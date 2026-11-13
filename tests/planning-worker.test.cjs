const { test, before } = require('node:test');
const assert = require('node:assert/strict');

let T, SceneModel, compileProgram, planProgram, snapshotProgramContext, planProgramFromSnapshot;
before(async () => {
  T = await import('three');
  ({ SceneModel } = await import('../frontend/scene-model.js'));
  ({ compileProgram } = await import('../frontend/program.js'));
  ({ planProgram } = await import('../frontend/program-plan.js'));
  ({ snapshotProgramContext } = await import('../frontend/planning/snapshot.js'));
  ({ planProgramFromSnapshot } = await import('../frontend/planning/worker-core.js'));
});

test('serialized worker scene plans the same program without mutating live robot state', () => {
  const joint={name:'slide',parent:'base',child:'tip',type:'prismatic',axis:new T.Vector3(1,0,0),
    basicMatrix:new T.Matrix4(),lower:0,upper:1,theta:0,attributes:{limit:{velocity:1}}};
  const sourceMesh=new T.BoxGeometry(.2,.2,.2);
  const meshGeometry=uri=>uri==='obstacle.stl'?sourceMesh:null;
  const robotRoot=new T.Group(), sceneModel=new SceneModel({scene:new T.Scene(),meshGeometry});
  sceneModel.addRobot('arm',robotRoot,{links:new Map([['tip',new T.Group()]])});
  sceneModel.loadWorld({name:'cell',models:[{name:'obstacle',pose:[2,0,0,0,0,0],static:true,
    links:[{name:'body',pose:[0,0,0,0,0,0],visuals:[],collisions:[{name:'mesh',pose:[0,0,0,0,0,0],geometry:{type:'mesh',uri:'obstacle.stl',scale:[1,1,1]}}]}]},
  {name:'pick_box',pose:[.4,0,0,0,0,0],static:false,
    links:[{name:'body',pose:[0,0,0,0,0,0],visuals:[],collisions:[{name:'box',pose:[0,0,0,0,0,0],geometry:{type:'box',size:[.1,.1,.1]}}]}]},
  {name:'tag',pose:[.44,0,0,0,0,0],static:false,
    links:[{name:'body',pose:[0,0,0,0,0,0],visuals:[],collisions:[{name:'box',pose:[0,0,0,0,0,0],geometry:{type:'box',size:[.1,.1,.1]}}]}]}]});
  sceneModel.attached.set('pick_box','tool');
  sceneModel.attached.set('tag','model/pick_box');
  const robotCollisionShapes=[{link:'tip',geometry:{type:'box',size:[.1,.1,.1]},origin:new T.Matrix4().elements.slice()}];
  const context={robotName:'arm',robotRoot,jointModels:[joint],robotCollisionShapes,sceneModel,meshGeometry,
    motionLimits:{slide:{velocity:1,acceleration:2}}};
  const compiled=compileProgram('ROBOT arm\nTOOL tip\nJOINTS goal slide=0.5\nMOVEJ goal');
  const direct=planProgram(compiled,context);
  const snapshot=snapshotProgramContext(context);
  const cloned=structuredClone({compiled,snapshot});
  const worker=planProgramFromSnapshot(cloned.compiled,cloned.snapshot);
  assert.equal(direct.status,'planned');
  assert.equal(worker.status,'planned');
  assert.deepEqual(worker.trajectory,direct.trajectory);
  assert.deepEqual(worker.samples,direct.samples);
  assert.deepEqual(snapshot.scene.attached,[['pick_box','tool'],['tag','model/pick_box']]);
  assert.equal(snapshot.scene.meshes.length,1);
  assert.doesNotThrow(()=>structuredClone(worker));
  assert.equal(joint.theta,0);
  assert.equal(robotRoot.position.x,0);
  sourceMesh.dispose();
});
