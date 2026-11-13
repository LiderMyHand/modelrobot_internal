const { test, before } = require('node:test');
const assert = require('node:assert/strict');

let T, SceneModel, compileProgram, planProgram, snapshotProgramContext, planProgramFromSnapshot, createPlanningCollisionScene;
before(async()=>{
  T=await import('three');
  ({SceneModel}=await import('../frontend/scene-model.js'));
  ({compileProgram}=await import('../frontend/program.js'));
  ({planProgram}=await import('../frontend/program-plan.js'));
  ({snapshotProgramContext}=await import('../frontend/planning/snapshot.js'));
  ({planProgramFromSnapshot}=await import('../frontend/planning/worker-core.js'));
  ({createPlanningCollisionScene}=await import('../frontend/planning/collision-scene.js'));
});

function context(worldModels=[], yLower=-1) {
  const robotRoot=new T.Group(), tip=new T.Group(), sceneModel=new SceneModel({scene:new T.Scene()});
  robotRoot.add(tip);
  sceneModel.addRobot('arm',robotRoot,{links:new Map([['tip',tip]])});
  sceneModel.loadWorld({name:'cell',models:worldModels});
  const jointModels=[
    {name:'x',parent:'base',child:'middle',type:'prismatic',axis:[1,0,0],origin:new T.Matrix4().elements.slice(),lower:-1,upper:1,theta:0,attributes:{limit:{velocity:.6}}},
    {name:'y',parent:'middle',child:'tip',type:'prismatic',axis:[0,1,0],origin:new T.Matrix4().elements.slice(),lower:yLower,upper:1,theta:0,attributes:{limit:{velocity:.6}}},
  ];
  return {robotName:'arm',robotRoot,jointModels,sceneModel,
    robotCollisionShapes:[{link:'tip',geometry:{type:'sphere',radius:.000001},origin:new T.Matrix4().elements.slice()}],
    motionLimits:{x:{velocity:.6,acceleration:1.5},y:{velocity:.6,acceleration:1.5}}};
}
const source=(zone='ZONE 0.07',between='')=>`ROBOT arm\nTOOL tip\nJOINTS corner x=0.4 y=0\nJOINTS finish x=0.4 y=0.4\n${zone}\nMOVEJ corner\n${between}MOVEJ finish`;

test('ZONE parser accepts metre radii and rejects negative, excessive, or malformed values',()=>{
  assert.equal(compileProgram(source()).ok,true);
  assert.deepEqual(compileProgram(source()).steps.find(step=>step.kind==='ZONE').radius,.07);
  for(const value of ['-0.01','0.21','Infinity','oops'])
    assert.ok(compileProgram(source(`ZONE ${value}`)).diagnostics.some(item=>item.code==='ZONE_SYNTAX'));
});

test('program ZONE blends only compatible PTP neighbors; ZONE 0 and PAUSE retain exact stops',()=>{
  const live=context();
  const active=planProgram(compileProgram(source()),live);
  assert.equal(active.status,'planned',active.diagnostics?.[0]?.message);
  assert.equal(active.zoneBlends.length,1);
  const boundary=active.plans[0].endTime;
  const corner=active.samples.find(point=>Math.abs(point.time-boundary)<1e-9);
  assert.ok(corner);
  assert.ok(Math.max(...corner.velocity.map(Math.abs))>1e-5);
  assert.ok(Math.hypot(corner.q[0]-.4,corner.q[1])>1e-6);
  assert.ok(active.zoneBlends[0].waypointDeviation<=.07+1e-8);
  const stamps=active.trajectory.points.map(point=>point.time_from_start.sec*1e9+point.time_from_start.nanosec);
  assert.ok(stamps.every((stamp,i)=>i===0||stamp>stamps[i-1]),'ROS nanosecond timestamps must increase strictly');
  const worker=planProgramFromSnapshot(compileProgram(source()),structuredClone(snapshotProgramContext(live)));
  assert.equal(worker.status,'planned');
  assert.deepEqual(worker.samples,active.samples);
  const stopped=planProgram(compileProgram(source('ZONE 0.07','ZONE 0\n')),live);
  assert.equal(stopped.status,'planned');
  assert.equal(stopped.zoneBlends.length,0);
  const stop=stopped.samples.find(point=>Math.abs(point.time-stopped.plans[0].endTime)<1e-9);
  assert.deepEqual(stop.q,[.4,0]);
  assert.ok(stop.velocity.every(value=>Math.abs(value)<1e-9));
  const paused=planProgram(compileProgram(source('ZONE 0.07','PAUSE 0\n')),live);
  assert.equal(paused.status,'planned');
  assert.equal(paused.zoneBlends.length,0);
  const repeatedTool=planProgram(compileProgram(source('ZONE 0.07','TOOL tip\n')),live);
  assert.equal(repeatedTool.status,'planned');
  assert.equal(repeatedTool.zoneBlends.length,0);
  assert.equal(repeatedTool.duration,stopped.duration,'A TOOL barrier must not reserve zone timing');
});

test('ZONE checks the scene state at its boundary before a later GRAB changes attachments',()=>{
  const free=planProgram(compileProgram(source()),context());
  assert.equal(free.status,'planned');
  const corner=free.samples.find(point=>Math.abs(point.time-free.plans[0].endTime)<1e-9);
  const sphere=(name,x,y,radius)=>({name,pose:[x,y,0,0,0,0],static:name==='block',
    links:[{name:'body',pose:[0,0,0,0,0,0],visuals:[],collisions:[{name:'body',pose:[0,0,0,0,0,0],geometry:{type:'sphere',radius}}]}]});
  const live=context([sphere('grasp',.4,.44,.005),sphere('block',corner.q[0],corner.q[1]+.04,.005)]);
  const programmed=planProgram(compileProgram(`${source()}\nGRAB grasp`),live);
  assert.equal(programmed.status,'planned',programmed.diagnostics?.[0]?.message);
  assert.equal(programmed.zoneBlends.length,1);
  assert.deepEqual(programmed.events.map(event=>event.kind),['GRAB']);
  const query=createPlanningCollisionScene({robotName:'arm',robotModel:programmed.model,
    allJoints:live.jointModels,robotCollisionShapes:live.robotCollisionShapes,sceneModel:live.sceneModel});
  query.attach('grasp','tool',[.4,.4]);
  assert.equal(query.isStateValid(corner.q),false,'Retrospective checking after GRAB would use the wrong scene state');
  query.dispose();
});

test('program reports source-line ZONE failure when its tolerance cannot contain a sampled blend',()=>{
  const result=planProgram(compileProgram(source('ZONE 0.00000001')),context());
  assert.equal(result.status,'error');
  assert.equal(result.diagnostics[0].code,'ZONE_INFEASIBLE');
  assert.equal(result.diagnostics[0].line,5);
});
