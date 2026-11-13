const {spawn}=require('node:child_process');
const {readFileSync}=require('node:fs');
const {chromium}=require('@playwright/test');

async function main(){
  const server=spawn('python3',['-m','http.server','8772','--bind','127.0.0.1'],{stdio:'ignore'});let browser;
  try{
    const url='http://127.0.0.1:8772/standalone.html';
    for(let i=0;i<100;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
    browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url);await page.waitForFunction(()=>App.workcellUI?.sceneModel&&window.robotjointcollection?.length);
    await page.evaluate(({urdf,sdf})=>{App.localRobots.showURDF(urdf);App.workcellUI.sdfSource.value=sdf;App.workcellUI.applySDF();App.workcellUI.programSource.value='ROBOT classroom_six_axis_arm\nTOOL tcp_link\nJOINTS near base_yaw=0.2 shoulder_pitch=0 elbow_pitch=0 wrist_roll=0 wrist_pitch=0 wrist_final=0\nMOVEJ near\n';},
      {urdf:readFileSync('testowe/workcell/arm.urdf','utf8'),sdf:readFileSync('testowe/workcell/world.sdf','utf8')});
    await page.evaluate(async()=>{await App.workcellUI.planCurrentProgram();App.workcellUI.player.seek(App.workcellUI.plan.duration/2);});
    const before=await page.evaluate(()=>({yaw:robotjointcollection.findWhere({name:'base_yaw'}).theta,planned:!!App.workcellUI.plan,time:App.workcellUI.player.time}));
    await page.locator('#pose-toggle').click();
    const target=await page.evaluate(()=>{
      window.scene.updateMatrixWorld(true);
      const pair=[...App.poseTool.meshes()].find(([,owner])=>owner.name==='forearm_link');
      if(!pair)throw new Error('No forearm visual mesh.');
      const [mesh]=pair;if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
      const point=mesh.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);
      const clip=point.clone().project(App.camera),rect=renderer.domElement.getBoundingClientRect();
      return {world:point.toArray(),x:rect.left+(clip.x+1)*rect.width/2,y:rect.top+(1-clip.y)*rect.height/2};
    });
    await page.mouse.click(target.x,target.y);
    const after=await page.evaluate(()=>({yaw:robotjointcollection.findWhere({name:'base_yaw'}).theta,planned:!!App.workcellUI.plan,active:App.poseTool.active?.object.name,
      marker:App.poseTool.marker?.position.toArray(),centre:App.poseTool.centreMarker?.position.toArray(),status:document.getElementById('program-status').textContent}));
    process.stdout.write(JSON.stringify({before,target,after,errors})+'\n');if(errors.length)process.exitCode=1;
  }finally{await browser?.close();server.kill();}
}
main().catch(e=>{process.stderr.write(e.stack+'\n');process.exitCode=1;});
