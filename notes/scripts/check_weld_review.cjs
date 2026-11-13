const {spawn}=require('node:child_process');
const {readFileSync,mkdirSync}=require('node:fs');
const {chromium}=require('@playwright/test');

async function main(){
  const server=spawn('python3',['-m','http.server','8771','--bind','127.0.0.1'],{stdio:'ignore'});
  let browser;
  try{
    const url='http://127.0.0.1:8771/standalone.html';
    for(let i=0;i<100;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
    browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url);await page.waitForFunction(()=>App.workcellUI?.sceneModel&&window.robotjointcollection?.length);
    await page.evaluate(({urdf,sdf,program})=>{App.localRobots.showURDF(urdf);App.workcellUI.sdfSource.value=sdf;App.workcellUI.applySDF();App.workcellUI.programSource.value=program;},
      {urdf:readFileSync('testowe/weld/robot.urdf','utf8'),sdf:readFileSync('testowe/weld/world.sdf','utf8'),program:readFileSync('testowe/weld/program.txt','utf8')});
    await page.locator('#tab-program').click();await page.locator('#program-plan').click();
    await page.waitForFunction(()=>App.workcellUI.plan||document.getElementById('program-status').classList.contains('text-danger'));
    const state=await page.evaluate(()=>{const ui=App.workcellUI,object=ui.sceneModel.getObject('workpiece');object.updateWorldMatrix(true,false);return {status:document.getElementById('program-status').textContent,processDisabled:document.getElementById('process-export').disabled,segments:ui.plan?.weld?.segments.length,previewLines:ui.weldPreviews?.length,
      seamEndpoints:ui.weldPreviews?.map(line=>{line.updateWorldMatrix(true,false);const a=line.geometry.getAttribute('position');return [new THREE.Vector3().fromBufferAttribute(a,0).applyMatrix4(line.matrixWorld).toArray(),new THREE.Vector3().fromBufferAttribute(a,a.count-1).applyMatrix4(line.matrixWorld).toArray()];}),
      seamExtents:ui.weldPreviews?.map(line=>{line.updateWorldMatrix(true,false);const a=line.geometry.getAttribute('position');const ys=[];for(let i=0;i<a.count;i++)ys.push(new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(line.matrixWorld).y);return {count:a.count,minY:Math.min(...ys),maxY:Math.max(...ys)};})}});
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#process-export').click()]);
    const processDoc=JSON.parse(readFileSync(await download.path(),'utf8'));
    const summary={state,download:download.suggestedFilename(),frame:processDoc.header?.frame_id,eventKinds:processDoc.events?.map(e=>e.kind),segmentTypes:processDoc.segments?.map(s=>s.type),sampleCounts:processDoc.segments?.map(s=>s.samples.length),first:processDoc.segments?.[0]?.samples[0],last:processDoc.segments?.at(-1)?.samples.at(-1),errors};
    await page.evaluate(()=>{const ui=App.workcellUI;ui.app.camera.position.set(0.35,0.05,2);ui.app.cameraControls.target.set(0.35,0.05,0);ui.app.camera.lookAt(ui.app.cameraControls.target);ui.app.cameraControls.update();});
    mkdirSync('notes/artifacts',{recursive:true});await page.screenshot({path:'notes/artifacts/weld_top_review.png',fullPage:true});
    await page.evaluate(()=>{App.workcellUI.preview.visible=false;});
    await page.screenshot({path:'notes/artifacts/weld_top_seam_only.png',fullPage:true});
    process.stdout.write(JSON.stringify(summary)+'\n');
    if(errors.length)process.exitCode=1;
  }finally{await browser?.close();server.kill();}
}
main().catch(e=>{process.stderr.write(e.stack+'\n');process.exitCode=1;});
