const { spawn } = require('node:child_process');
const { readFileSync, mkdirSync } = require('node:fs');
const { chromium } = require('@playwright/test');

async function main() {
  const mode=process.argv[2] || 'movej';
  const server = spawn('python3', ['-m', 'http.server', '8769', '--bind', '127.0.0.1'], { stdio: 'ignore' });
  let browser;
  try {
    const url = 'http://127.0.0.1:8769/standalone.html';
    for (let i=0;i<100;i++) { try { if ((await fetch(url)).ok) break; } catch {} await new Promise(r=>setTimeout(r,100)); }
    browser = await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    const page = await browser.newPage({viewport:{width:1440,height:900}});
    const errors=[], workerRequests=[]; page.on('pageerror',error=>errors.push(error.message));
    page.on('request',request=>{if(request.url().includes('planning-worker'))workerRequests.push(request.url());});
    await page.goto(url); await page.waitForFunction(()=>window.robotjointcollection?.length);
    await page.evaluate(xml=>App.localRobots.showURDF(xml),readFileSync('testowe/workcell/arm.urdf','utf8'));
    await page.locator('#tab-workcell').click();
    const originalWorld=readFileSync('testowe/workcell/world.sdf','utf8');
    const world=mode==='attach' ? originalWorld.replace('<pose>0.42 0.16 0.765 0 0 0</pose>','<pose>0.94 0 0.88 0 0 0</pose>') : originalWorld;
    await page.locator('#sdf-source').fill(world);
    await page.locator('#sdf-apply').click();
    const home=await page.evaluate(()=>{
      const link=robotlinkcollection.findWhere({name:'tcp_link'}).get('link');
      robot.updateMatrixWorld(true);
      const p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();
      link.matrixWorld.decompose(p,q,s);
      return {position:p.toArray(),quaternion:q.toArray(),robot:App.workcellUI.activeRobotName};
    });
    const circle=await page.evaluate(()=>{
      const joint=robotjointcollection.findWhere({name:'base_yaw'}), link=robotlinkcollection.findWhere({name:'tcp_link'}).get('link');
      const pose=angle=>{joint.movejoint(angle);robot.updateMatrixWorld(true);const p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();link.matrixWorld.decompose(p,q,s);return {position:p.toArray(),quaternion:q.toArray()};};
      const via=pose(0.1),end=pose(0.2);joint.movejoint(0);robot.updateMatrixWorld(true);return {via,end};
    });
    const poseLine=(name,pose)=>`POSE ${name} world ${pose.position.join(' ')} Q ${pose.quaternion.join(' ')}`;
    const program=mode==='circ' ? `ROBOT ${home.robot}\nTOOL tcp_link\n${poseLine('via',circle.via)}\n${poseLine('end',circle.end)}\nMOVEC via end\n`
      : mode==='lin' ? `ROBOT ${home.robot}\nTOOL tcp_link\n${poseLine('end',circle.end)}\nMOVEL end\n`
      : mode==='aa' ? `ROBOT ${home.robot}\nTOOL tcp_link\nPOSE end world ${circle.end.position.join(' ')} AA 0 0 1 0.2\nMOVEL end\n`
      : mode==='grabfar' ? `ROBOT ${home.robot}\nTOOL tcp_link\nJOINTS near base_yaw=0.2 shoulder_pitch=0.1 elbow_pitch=0 wrist_roll=0 wrist_pitch=0 wrist_final=0\nMOVEJ near\nGRAB pick_box\nPAUSE 0.5\n`
      : mode==='pick' ? `ROBOT ${home.robot}\nTOOL tcp_link\nPOSE pick world 0.42 0.16 0.82 Q 0 0 0 1\n${poseLine('home',home)}\nMOVEJ pick\nGRAB pick_box\nMOVEJ home\nRELEASE pick_box\n`
      : mode==='attach' ? `ROBOT ${home.robot}\nTOOL tcp_link\nJOINTS near base_yaw=0.2 shoulder_pitch=0 elbow_pitch=0 wrist_roll=0 wrist_pitch=0 wrist_final=0\nGRAB pick_box\nMOVEJ near\n`
      : `ROBOT ${home.robot}\nTOOL tcp_link\nJOINTS near base_yaw=0.2 shoulder_pitch=0.1 elbow_pitch=0 wrist_roll=0 wrist_pitch=0 wrist_final=0\n${poseLine('home',home)}\nMOVEJ near\nMOVEJ home\n`;
    await page.locator('#tab-program').click();
    await page.locator('#program-source').fill(program);
    const start=Date.now();
    await page.locator('#program-plan').click({timeout:120000});
    await page.waitForFunction(()=>{const s=document.getElementById('program-status').textContent;return s.startsWith('Planned')||s.startsWith('Line ')||s.startsWith('Scene assets')||s.startsWith('Robot collision');},undefined,{timeout:120000});
    const result=await page.evaluate(()=>({status:document.getElementById('program-status').textContent,diagnostics:[...document.querySelectorAll('#program-diagnostics li')].map(e=>e.textContent),plan:App.workcellUI.plan&&{duration:App.workcellUI.plan.duration,moves:App.workcellUI.plan.plans.length,samples:App.workcellUI.plan.samples.length,endpointQ:App.workcellUI.plan.samples.at(-1).q},robot:App.workcellUI.activeRobotName}));
    process.stdout.write(JSON.stringify({mode,home,program,result,elapsedMs:Date.now()-start,workerRequests,errors})+'\n');
    mkdirSync('notes/artifacts',{recursive:true});
    await page.screenshot({path:`notes/artifacts/browser_${mode}_plan.png`,fullPage:true});
    if (result.plan) {
      await page.evaluate(()=>App.workcellUI.player.seek(App.workcellUI.plan.duration/2));
      await page.screenshot({path:`notes/artifacts/browser_${mode}_midpoint.png`,fullPage:true});
      const playback=await page.evaluate(()=>({time:App.workcellUI.player.time,state:App.workcellUI.player.state,q:App.workcellUI.player.qAt(App.workcellUI.player.time),status:document.getElementById('program-status').textContent,
        attachment:App.workcellUI.sceneModel.attachmentRecords(),boxWorld:App.workcellUI.sceneModel.models.has('pick_box')?App.workcellUI.sceneModel.getObject('pick_box').getWorldPosition(new THREE.Vector3()).toArray():null}));
      process.stdout.write(JSON.stringify({playback})+'\n');
      await page.locator('#program-reset').click();
      await page.locator('#program-step').click();
      const stepped=await page.evaluate(()=>({time:App.workcellUI.player.time,q:robotjointcollection.findWhere({name:'base_yaw'}).theta}));
      await page.locator('#program-reset').click();
      await page.locator('#program-play').click();
      await page.waitForFunction(()=>App.workcellUI.player.state==='finished',{timeout:15000});
      const finished=await page.evaluate(()=>({time:App.workcellUI.player.time,q:robotjointcollection.findWhere({name:'base_yaw'}).theta,status:document.getElementById('program-status').textContent,
        attachment:App.workcellUI.sceneModel.attachmentRecords(),boxWorld:App.workcellUI.sceneModel.models.has('pick_box')?App.workcellUI.sceneModel.getObject('pick_box').getWorldPosition(new THREE.Vector3()).toArray():null}));
      await page.locator('#program-reset').click();
      const reset=await page.evaluate(()=>({time:App.workcellUI.player.time,q:robotjointcollection.findWhere({name:'base_yaw'}).theta,state:App.workcellUI.player.state,
        attachment:App.workcellUI.sceneModel.attachmentRecords(),boxWorld:App.workcellUI.sceneModel.models.has('pick_box')?App.workcellUI.sceneModel.getObject('pick_box').getWorldPosition(new THREE.Vector3()).toArray():null}));
      process.stdout.write(JSON.stringify({stepped,finished,reset})+'\n');
    }
    await page.close();
    if(errors.length) process.exitCode=1;
  } finally {await browser?.close();server.kill();}
}
main().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1;});
