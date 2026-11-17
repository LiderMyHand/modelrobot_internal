const { chromium } = require('@playwright/test');
(async () => {
 const b = await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
 const p=await b.newPage(); await p.goto('http://127.0.0.1:8765/standalone.html');
 await p.waitForFunction(()=>App.workcellUI?.activeRobotName); await p.evaluate(()=>App.workcellUI.loadDemo());
 const candidates=[[0,-.3,.6,.2,-.3,.2],[0,-.5,.8,.3,-.4,.2],[.2,-.5,.8,.3,-.4,.2],[0,-.2,.4,.2,-.4,.2],[.2,0,0,.2,-.3,.2],[0,0,0,.2,-.3,.2]];
 for(const q of candidates){const r=await p.evaluate(q=>{const u=App.workcellUI;const n=['base_yaw','shoulder_pitch','elbow_pitch','wrist_roll','wrist_pitch','wrist_final'];u.applyNamedJointState(n,q);document.getElementById('pendant-frame').value='joint';const health=u.currentJacobianHealth;const clear=u.jogPendantJoint(1,0);u.applyNamedJointState(n,q);return {q,health:health?.status,clear,status:document.getElementById('pendant-status').textContent};},q);console.log(JSON.stringify(r));}
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
