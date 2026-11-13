const { test, before } = require('node:test');
const assert = require('node:assert/strict');

let T, createRobotModel, SceneModel, createPlanningCollisionScene;
before(async () => {
  T = await import('three');
  ({ createRobotModel } = await import('../frontend/planning/robot-model.js'));
  ({ SceneModel } = await import('../frontend/scene-model.js'));
  ({ createPlanningCollisionScene } = await import('../frontend/planning/collision-scene.js'));
});

const box = (size=[.2,.2,.2]) => ({ type:'box', size });
const item = (name, x, geometry=box()) => ({ name, pose:[x,0,0,0,0,0], static:false,
  links:[{ name:'body', pose:[0,0,0,0,0,0], visuals:[], collisions:[{name:'body',pose:[0,0,0,0,0,0],geometry}] }] });
function fixture({robotGeometry=box(),worldModels=[item('obstacle',1),item('pick_box',.4)],baseGeometry=null,meshGeometry,axis=[1,0,0]}={}) {
  const joint={name:'slide',parent:'base',child:'tip',type:'prismatic',axis:new T.Vector3(...axis),
    basicMatrix:new T.Matrix4(),lower:0,upper:2,theta:0};
  const robotModel=createRobotModel({joints:[joint],tipLink:'tip'});
  const scene=new T.Scene(), sceneModel=new SceneModel({scene,meshGeometry});
  sceneModel.loadWorld({name:'cell',models:worldModels});
  const robotCollisionShapes=[{link:'tip',geometry:robotGeometry,origin:new T.Matrix4().elements.slice()}];
  if(baseGeometry)robotCollisionShapes.push({link:'base',geometry:baseGeometry,origin:new T.Matrix4().elements.slice()});
  const query=createPlanningCollisionScene({robotName:'arm',robotModel,allJoints:[joint],robotCollisionShapes,sceneModel,meshGeometry});
  return {query,sceneModel,robotModel,joint,scene};
}

test('planner collision query uses detached URDF and SDF transforms at each q', () => {
  const {query,joint,scene}=fixture();
  assert.equal(query.isStateValid([0]),true);
  assert.equal(query.isStateValid([1]),false);
  assert.equal(query.isStateValid([2]),true);
  assert.equal(joint.theta,0,'Collision query must not move live joint');
  assert.ok(!scene.getObjectByName('SDF world')?.position.x,'Collision query must not move viewer scene');
  query.dispose();
});

test('grabbed object follows tool, collides with scene, and release freezes its world pose', () => {
  const {query}=fixture();
  query.attach('pick_box','tool',[0]);
  assert.equal(query.snapshot().find(x=>x.name==='pick_box').attachment,'tool');
  assert.equal(query.isStateValid([.6]),false,'Carried box meets obstacle even while robot tip remains clear');
  const carried=query.getObjectWorld('pick_box',[.6]);
  assert.ok(Math.abs(new T.Vector3().setFromMatrixPosition(carried).x-1)<1e-9);
  const linkFrame=query.getFrameWorld('model/pick_box/link/body',[.6]);
  assert.ok(Math.abs(new T.Vector3().setFromMatrixPosition(linkFrame).x-1)<1e-9);
  assert.ok(Math.abs(new T.Vector3().setFromMatrixPosition(query.getFrameWorld('tool',[.6])).x-.6)<1e-9);
  query.release('pick_box',[.6]);
  assert.equal(query.snapshot().find(x=>x.name==='pick_box').attachment,null);
  assert.equal(query.isStateValid([0]),true,'Static scene contact after release does not invalidate robot motion');
  const released=query.getObjectWorld('pick_box',[0]);
  assert.ok(Math.abs(new T.Vector3().setFromMatrixPosition(released).x-1)<1e-9);
  query.dispose();
});

test('grasp distance uses object collision geometry and rejects objects without it', () => {
  const {query}=fixture({worldModels:[item('pick_box',.4)]});
  assert.ok(Math.abs(query.distanceToObject('pick_box',[0,0,0],[0])-.3)<1e-8);
  assert.equal(query.distanceToObject('pick_box',[.4,0,0],[0]),0);
  assert.ok(Math.abs(query.distanceToObjectSurface('pick_box',[.4,0,0],[0])-.1)<1e-8);
  assert.throws(()=>query.distanceToObject('missing',[0,0,0],[0]),/Unknown scene object/);
  query.dispose();
  const empty=fixture({worldModels:[{name:'empty',pose:[1,0,0,0,0,0],static:false,
    links:[{name:'body',pose:[0,0,0,0,0,0],visuals:[],collisions:[]}]}]});
  assert.throws(()=>empty.query.distanceToObject('empty',[1,0,0],[0]),/no collision geometry/);
  empty.query.dispose();
});

test('nested model join preserves world pose, follows a carried parent, and checks outside obstacles', () => {
  const {query}=fixture({worldModels:[item('parent',.4),item('child',.5),item('obstacle',1.3)]});
  const x=(name,q)=>new T.Vector3().setFromMatrixPosition(query.getObjectWorld(name,q)).x;
  query.attach('parent','tool',[0]);
  query.attach('child','model/parent',[0]);
  assert.ok(Math.abs(x('child',[0])-.5)<1e-9,'Join must preserve child world pose');
  assert.equal(query.isStateValid([0]),true,'Parent-child overlap is internal joined contact');
  assert.ok(Math.abs(x('parent',[.5])-.9)<1e-9);
  assert.ok(Math.abs(x('child',[.5])-1)<1e-9,'Child must follow the robot-carried parent');
  assert.equal(query.isStateValid([.5]),true);
  assert.equal(query.isStateValid([.65]),false,'Joined child must still collide with an outside model');
  assert.throws(()=>query.attach('parent','model/child',[0]),/cycle/);
  assert.throws(()=>query.attach('child','model/child',[0]),/cycle/);
  assert.ok(Math.abs(x('child',[.5])-1)<1e-9,'Failed cycle must leave attachment intact');
  query.release('child',[.3]);
  assert.ok(Math.abs(x('child',[0])-.8)<1e-9,'Release freezes the child in world coordinates');
  query.dispose();
});

test('attached object may start at exact support contact but penetration is blocked', () => {
  const {query}=fixture({worldModels:[item('pick_box',.4),item('support',.6)]});
  query.attach('pick_box','tool',[0]);
  assert.equal(query.isStateValid([0]),true,'Exact face contact at pickup is permitted');
  assert.equal(query.isStateValid([.05]),false,'Motion into the support is rejected');
  query.dispose();
});

test('same or adjacent robot links are excluded; contained sphere still intersects box', () => {
  const {query}=fixture({baseGeometry:box([.5,.5,.5]),worldModels:[item('obstacle',1,box([2,2,2]))],robotGeometry:{type:'sphere',radius:.1}});
  assert.equal(query.isStateValid([0]),false,'Robot sphere is contained in scene box');
  query.dispose();
  const overlap=fixture({baseGeometry:box([.5,.5,.5]),worldModels:[],robotGeometry:box([.5,.5,.5])});
  assert.equal(overlap.query.isStateValid([0]),true,'Adjacent base and tip links are excluded');
  overlap.query.dispose();
});

test('declared carrier contact exempts only the fixed robot base assembly', () => {
  const joint={name:'slide',parent:'base',child:'tip',type:'prismatic',axis:new T.Vector3(1,0,0),
    basicMatrix:new T.Matrix4().makeTranslation(.4,0,0),lower:-1,upper:1,theta:0};
  const robotModel=createRobotModel({joints:[joint],tipLink:'tip'});
  const scene=new T.Scene(), sceneModel=new SceneModel({scene});
  sceneModel.loadWorld({name:'carrier_cell',models:[item('carrier',0,box([.3,.3,.3]))]});
  const root=new T.Group(); scene.add(root); sceneModel.addRobot('arm',root);
  const robotCollisionShapes=[{link:'base',geometry:box([.2,.2,.2]),origin:new T.Matrix4().elements.slice()},
    {link:'tip',geometry:box([.08,.08,.08]),origin:new T.Matrix4().elements.slice()}];
  const makeQuery=()=>createPlanningCollisionScene({robotName:'arm',robotModel,allJoints:[joint],
    robotCollisionShapes,sceneModel});
  const unmounted=makeQuery();
  assert.equal(unmounted.isStateValid([0]),false,'Undeclared base/carrier overlap is a collision');
  unmounted.dispose();
  sceneModel.mountRobotBase('arm','model/carrier');
  const mounted=makeQuery();
  assert.equal(mounted.isStateValid([0]),true,'Declared fixed base/carrier contact is internal to the mount');
  assert.equal(mounted.isStateValid([-.4]),false,'The moving tip can still collide with its carrier');
  mounted.dispose();
});

test('planner rejects attachment cycles through a mounted robot base', () => {
  const joint={name:'slide',parent:'base',child:'tip',type:'prismatic',axis:new T.Vector3(1,0,0),
    basicMatrix:new T.Matrix4(),lower:0,upper:1,theta:0};
  const robotModel=createRobotModel({joints:[joint],tipLink:'tip'});
  const scene=new T.Scene(), sceneModel=new SceneModel({scene});
  sceneModel.loadWorld({name:'cell',models:[item('parent',0),item('carrier',.4),item('held',.8)]});
  const root=new T.Group(), tip=new T.Group(); root.add(tip); scene.add(root);
  sceneModel.addRobot('arm',root,{links:new Map([['tip',tip]])});
  sceneModel.attach('carrier','model/parent');
  sceneModel.mountRobotBase('arm','model/carrier');
  sceneModel.attach('held','robot/arm/link/tip');
  const query=createPlanningCollisionScene({robotName:'arm',robotModel,allJoints:[joint],
    robotCollisionShapes:[{link:'tip',geometry:box([.05,.05,.05]),origin:new T.Matrix4().elements.slice()}],sceneModel});
  assert.throws(()=>query.attach('carrier','tool',[0]),/cycle.*mounted robot base/);
  assert.throws(()=>query.attach('parent','model/held',[0]),/cycle.*mounted robot base/);
  assert.throws(()=>sceneModel.attach('carrier','robot/arm/link/tip'),/cycle/);
  assert.throws(()=>sceneModel.attach('parent','model/held'),/cycle/);
  query.dispose();
});

test('STL-like mesh uses BVH narrow phase; missing mesh fails explicitly', () => {
  const source=new T.BoxGeometry(.2,.2,.2);
  const meshGeometry=uri=>uri==='part.stl'?source:null;
  const {query}=fixture({robotGeometry:{type:'mesh',uri:'part.stl',scale:[1,1,1]},worldModels:[item('obstacle',1)],meshGeometry});
  assert.equal(query.isStateValid([0]),true);
  assert.equal(query.isStateValid([1]),false);
  query.dispose();source.dispose();
  assert.throws(()=>fixture({robotGeometry:{type:'mesh',uri:'missing.stl',scale:[1,1,1]},worldModels:[],meshGeometry}),/Missing local collision mesh/);
});

test('finite SDF ground plane permits exact support contact and blocks downward penetration', () => {
  const ground={name:'ground',pose:[0,0,-.1,0,0,0],static:true,
    links:[{name:'floor',pose:[0,0,0,0,0,0],visuals:[],collisions:[{name:'floor',pose:[0,0,0,0,0,0],geometry:{type:'plane',normal:[0,0,1],size:[2,2]}}]}]};
  const {query}=fixture({axis:[0,0,-1],worldModels:[ground]});
  assert.equal(query.isStateValid([0]),true);
  assert.equal(query.isStateValid([.02]),false);
  query.dispose();
  const cylinder=fixture({axis:[0,0,-1],worldModels:[ground],robotGeometry:{type:'cylinder',radius:.1,length:.2}});
  assert.equal(cylinder.query.isStateValid([0]),true,'Cylinder may rest on the plane');
  assert.equal(cylinder.query.isStateValid([.02]),false,'Cylinder penetration is blocked');
  cylinder.query.dispose();
  const source=new T.BoxGeometry(.2,.2,.2);
  const mesh=fixture({axis:[0,0,-1],worldModels:[ground],robotGeometry:{type:'mesh',uri:'solid.stl',scale:[1,1,1]},meshGeometry:uri=>uri==='solid.stl'?source:null});
  assert.equal(mesh.query.isStateValid([0]),true,'Mesh may rest on the plane');
  assert.equal(mesh.query.isStateValid([.02]),false,'Mesh penetration is blocked');
  mesh.query.dispose();source.dispose();
});
