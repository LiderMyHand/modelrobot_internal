const { spawn } = require('node:child_process');
const { readFileSync, mkdirSync } = require('node:fs');
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const net = require('node:net');

const freePort = () => new Promise((resolve, reject) => {
  const listener = net.createServer(); listener.once('error', reject);
  listener.listen(0, '127.0.0.1', () => { const port = listener.address().port; listener.close(() => resolve(port)); });
});

async function main() {
  const port=await freePort();
  const server=spawn('python3',['-c',readFileSync('tests/serve.py','utf8').replace('8765',String(port))],{stdio:'ignore'});
  let browser;
  try {
    const url=`http://127.0.0.1:${port}/standalone.html`;
    for(let i=0;i<100;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
    browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
    const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(new URL(r.url()).pathname));
    await page.goto(url);await page.waitForFunction(()=>window.robotjointcollection?.length);
    await page.locator('#tab-workcell').click();await page.locator('#workcell-demo').click();
    await page.waitForFunction(()=>document.getElementById('workcell-status').textContent.includes('Pick-and-place example loaded'));
    const demo=await page.evaluate(()=>({robot:App.workcellUI.activeRobotName,objects:[...App.workcellUI.sceneModel.models.keys()],program:document.getElementById('program-source').value,world:App.workcellUI.sceneModel.world.name}));
    mkdirSync('notes/artifacts',{recursive:true});await page.screenshot({path:'notes/artifacts/browser_demo_button.png',fullPage:true});
    await page.locator('#tab-program').click();await page.locator('#program-plan').click();
    await page.waitForFunction(()=>{const s=document.getElementById('program-status').textContent;return s.startsWith('Planned')||s.startsWith('Line ');},undefined,{timeout:120000});
    const planned=await page.evaluate(()=>({status:document.getElementById('program-status').textContent,plan:App.workcellUI.plan&&{duration:App.workcellUI.plan.duration,moves:App.workcellUI.plan.plans.length,events:App.workcellUI.plan.events.length,samples:App.workcellUI.plan.samples.length}}));
    let trajectory=null;
    let eventPlayback=null;
    if(planned.plan){
      eventPlayback=await page.evaluate(()=>{
        const ui=App.workcellUI,events=ui.plan.events;
        const state=()=>({time:ui.player.time,attachment:ui.sceneModel.attachmentRecords(),box:ui.sceneModel.getObject('pick_box').getWorldPosition(new THREE.Vector3()).toArray()});
        const initial=state();ui.player.seek(events[0].time+0.01);const grabbed=state();
        ui.player.seek((events[0].time+events[1].time)/2);const carrying=state();
        ui.player.seek(events[1].time);const released=state();ui.player.reset();const reset=state();
        return {events,initial,grabbed,carrying,released,reset};
      });
      await page.evaluate(()=>App.workcellUI.player.seek((App.workcellUI.plan.events[0].time+App.workcellUI.plan.events[1].time)/2));
      await page.screenshot({path:'notes/artifacts/browser_demo_carry.png',fullPage:true});
      await page.evaluate(()=>App.workcellUI.player.reset());
      const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#trajectory-export').click()]);
      trajectory=JSON.parse(readFileSync(await download.path(),'utf8'));
    }
    await page.locator('#tab-workcell').click();
    const [archive]=await Promise.all([page.waitForEvent('download'),page.locator('#project-export').click()]);
    const zip=readFileSync(await archive.path());
    const before=await page.evaluate(()=>({robot:App.workcellUI.activeRobotName,objects:[...App.workcellUI.sceneModel.models.keys()],program:document.getElementById('program-source').value,world:App.workcellUI.sceneModel.world.name}));
    await page.locator('#project-file').setInputFiles({name:'roundtrip.zip',mimeType:'application/zip',buffer:zip});
    await page.waitForFunction(()=>document.getElementById('workcell-status').textContent.startsWith('Opened project'));
    const after=await page.evaluate(()=>({robot:App.workcellUI.activeRobotName,objects:[...App.workcellUI.sceneModel.models.keys()],program:document.getElementById('program-source').value,world:App.workcellUI.sceneModel.world.name,status:document.getElementById('workcell-status').textContent}));
    const summary={demo,planned,eventPlayback,trajectory:trajectory&&{jointNames:trajectory.joint_names,frame:trajectory.header?.frame_id,points:trajectory.points.length,first:trajectory.points[0],last:trajectory.points.at(-1)},zipBytes:zip.byteLength,before,after,workerRequested:requests.includes('/scripts/planning-worker.bundle.js'),errors};
    assert.equal(demo.robot,'classroom_six_axis_arm');
    assert.deepEqual(demo.objects,['table','pick_box','obstacle','destination']);
    assert.match(demo.program,/MOVEC via place_approach/);
    assert.deepEqual(planned.plan && [planned.plan.moves,planned.plan.events],[3,2]);
    assert.deepEqual(eventPlayback.events.map(event=>event.kind),['GRAB','RELEASE']);
    assert.equal(eventPlayback.grabbed.attachment[0].object,'pick_box');
    assert.equal(eventPlayback.carrying.attachment[0].object,'pick_box');
    assert.ok(Math.hypot(...eventPlayback.carrying.box.map((value,i)=>value-eventPlayback.initial.box[i]))>0.2);
    assert.deepEqual(eventPlayback.released.attachment,[]);
    assert.ok(Math.hypot(...eventPlayback.released.box.map((value,i)=>value-[.84,-.16,.785][i]))<.003);
    assert.deepEqual(eventPlayback.reset.box,eventPlayback.initial.box);
    assert.equal(summary.trajectory.frame,'world');
    assert.equal(summary.trajectory.jointNames.length,6);
    assert.equal(summary.trajectory.points,planned.plan.samples);
    assert.deepEqual(summary.trajectory.first.velocities,[0,0,0,0,0,0]);
    assert.deepEqual(summary.trajectory.last.accelerations,[0,0,0,0,0,0]);
    assert.deepEqual(after.robot,before.robot);assert.deepEqual(after.objects,before.objects);
    assert.equal(after.program,before.program);assert.equal(after.world,before.world);
    assert.match(after.status,/^Opened project/);
    assert.ok(summary.workerRequested);assert.deepEqual(errors,[]);
    process.stdout.write(JSON.stringify(summary)+'\n');
  }finally{await browser?.close();server.kill();}
}
main().catch(e=>{process.stderr.write(e.stack+'\n');process.exitCode=1;});
