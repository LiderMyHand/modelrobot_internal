const { test, before } = require('node:test');
const assert = require('node:assert/strict');

let T, SceneModel, compileProgram, planProgram, snapshotProgramContext, planProgramFromSnapshot, createCartesianZonePath, linearPath, createPlanningCollisionScene;
before(async()=>{
  T=await import('three');
  ({SceneModel}=await import('../frontend/scene-model.js'));
  ({compileProgram}=await import('../frontend/program.js'));
  ({planProgram}=await import('../frontend/program-plan.js'));
  ({snapshotProgramContext}=await import('../frontend/planning/snapshot.js'));
  ({planProgramFromSnapshot}=await import('../frontend/planning/worker-core.js'));
  ({createCartesianZonePath}=await import('../frontend/planning/cartesian-zone.js'));
  ({linearPath}=await import('../frontend/planning/paths.js'));
  ({createPlanningCollisionScene}=await import('../frontend/planning/collision-scene.js'));
});
function context(worldModels=[],robotRadius=.0001,orientable=false) {
  const robotRoot=new T.Group(),tip=new T.Group(),sceneModel=new SceneModel({scene:new T.Scene()});
  robotRoot.add(tip);sceneModel.addRobot('arm',robotRoot,{links:new Map([['tip',tip]])});
  sceneModel.loadWorld({name:'cell',models:worldModels});
  const origin=new T.Matrix4().elements.slice();
  const jointModels=[
    {name:'x',parent:'base',child:'mid',type:'prismatic',axis:[1,0,0],origin,lower:-1,upper:1,theta:0,attributes:{limit:{velocity:.6}}},
    {name:'y',parent:'mid',child:orientable?'wrist':'tip',type:'prismatic',axis:[0,1,0],origin,lower:-1,upper:1,theta:0,attributes:{limit:{velocity:.6}}},
  ];
  if(orientable) jointModels.push({name:'yaw',parent:'wrist',child:'tip',type:'revolute',axis:[0,0,1],origin,
    lower:-Math.PI,upper:Math.PI,theta:0,attributes:{limit:{velocity:1.5}}});
  return {robotName:'arm',robotRoot,jointModels,sceneModel,
    robotCollisionShapes:[{link:'tip',geometry:{type:'sphere',radius:robotRadius},origin}],
    motionLimits:{x:{velocity:.6,acceleration:1.5},y:{velocity:.6,acceleration:1.5},
      ...(orientable?{yaw:{velocity:1.5,acceleration:3}}:{})}};
}
const pose=(name,x,y,orientation='0 0 0 1')=>`POSE ${name} world ${x} ${y} 0 Q ${orientation}`;
const base=`ROBOT arm\nTOOL tip\n${pose('corner',.4,0)}\n${pose('finish',.4,.4)}`;

test('program LIN-LIN ZONE bypasses the waypoint; default and PAUSE retain exact stops',()=>{
  const live=context(),source=`${base}\nZONE 0.07\nMOVEL corner\nMOVEL finish`;
  const active=planProgram(compileProgram(source),live);
  assert.equal(active.status,'planned',active.diagnostics?.[0]?.message);
  assert.equal(active.plans.length,2);
  assert.equal(active.cartesianZoneBlends.length,1);
  assert.equal(active.zoneBlends.length,0);
  const boundary=active.cartesianZoneBlends[0].boundaryTime;
  const point=active.samples.find(sample=>Math.abs(sample.time-boundary)<1e-9);
  assert.ok(point);
  assert.ok(Math.hypot(point.q[0]-.4,point.q[1])>1e-5);
  assert.ok(active.cartesianZoneBlends[0].speedFraction>1e-5);
  assert.ok(active.cartesianZoneBlends[0].maxWaypointDistance<=.07+1e-8);
  assert.equal(active.plans[0].endTime,active.plans[1].startTime);
  const stamps=active.trajectory.points.map(item=>item.time_from_start.sec*1e9+item.time_from_start.nanosec);
  assert.ok(stamps.every((value,i)=>i===0||value>stamps[i-1]));
  const worker=planProgramFromSnapshot(compileProgram(source),structuredClone(snapshotProgramContext(live)));
  assert.equal(worker.status,'planned',worker.diagnostics?.[0]?.message);
  assert.deepEqual(worker.samples,active.samples);
  const stopped=planProgram(compileProgram(source.replace('ZONE 0.07','ZONE 0')),live);
  assert.equal(stopped.status,'planned');assert.equal(stopped.cartesianZoneBlends.length,0);
  const stop=stopped.samples.find(sample=>Math.abs(sample.time-stopped.plans[0].endTime)<1e-9);
  assert.ok(Math.hypot(stop.q[0]-.4,stop.q[1])<1e-4);
  assert.ok(stop.velocity.every(value=>Math.abs(value)<1e-9));
  const paused=planProgram(compileProgram(source.replace('MOVEL finish','PAUSE 0\nMOVEL finish')),live);
  assert.equal(paused.status,'planned');assert.equal(paused.cartesianZoneBlends.length,0);
});

test('Cartesian ZONE reports unreachable orientation and plans consecutive flybys',()=>{
  const changing=`ROBOT arm\nTOOL tip\n${pose('corner',.4,0)}\n${pose('turn',.4,.4,'0 0 0.09983341664682815 0.9950041652780258')}\nZONE 0.07\nMOVEL corner\nMOVEL turn`;
  const orientation=planProgram(compileProgram(changing),context());
  assert.equal(orientation.status,'error');
  assert.equal(orientation.diagnostics[0].code,'ZONE_INFEASIBLE');
  assert.equal(orientation.diagnostics[0].line,5);
  const run=`${base}\n${pose('third',.6,.5)}\nZONE 0.07\nMOVEL corner\nMOVEL finish\nMOVEL third`;
  const chain=planProgram(compileProgram(run),context());
  assert.equal(chain.status,'planned',chain.diagnostics?.[0]?.message);
  assert.equal(chain.plans.length,3);
  assert.equal(chain.cartesianZoneBlends.length,2);
  for (let i=0;i<2;i++) {
    const corner=chain.cartesianZoneBlends[i];
    assert.ok(corner.speedFraction>1e-5);
    assert.ok(corner.maxWaypointDistance<=corner.radius+1e-8);
    assert.equal(chain.plans[i].endTime,corner.boundaryTime);
    assert.equal(chain.plans[i+1].startTime,corner.boundaryTime);
    assert.ok(chain.samples.some(sample=>Math.abs(sample.time-corner.boundaryTime)<1e-9));
  }
  assert.ok(chain.samples.every((sample,i)=>i===0||sample.time>chain.samples[i-1].time));
  const worker=planProgramFromSnapshot(compileProgram(run),structuredClone(snapshotProgramContext(context())));
  assert.equal(worker.status,'planned',worker.diagnostics?.[0]?.message);
  assert.deepEqual(worker.samples,chain.samples);
  assert.deepEqual(worker.cartesianZoneBlends,chain.cartesianZoneBlends);
});

test('Cartesian ZONE chain preserves a middle CIRC via and stops at an explicit ZONE 0',()=>{
  const source=`ROBOT arm\nTOOL tip\n${pose('first',.2,0)}\n${pose('via',.3,.1)}\n${pose('second',.4,0)}\n${pose('third',.6,.2)}\nZONE 0.05\nMOVEL first\nMOVEC via second\nMOVEL third`;
  const plan=planProgram(compileProgram(source),context());
  assert.equal(plan.status,'planned',plan.diagnostics?.[0]?.message);
  assert.equal(plan.cartesianZoneBlends.length,2);
  assert.ok(plan.samples.some(sample=>Math.hypot(sample.q[0]-.3,sample.q[1]-.1)<1e-4));
  const stopped=planProgram(compileProgram(source.replace('MOVEL third','ZONE 0\nMOVEL third')),context());
  assert.equal(stopped.status,'planned',stopped.diagnostics?.[0]?.message);
  assert.equal(stopped.cartesianZoneBlends.length,1);
  assert.ok(stopped.samples.some(sample=>Math.hypot(sample.q[0]-.4,sample.q[1])<1e-4 &&
    sample.velocity.every(value=>Math.abs(value)<1e-9)));
});

test('multi-corner flyby may bypass a colliding nominal middle waypoint',()=>{
  const sphere={name:'middle_block',pose:[.4,.4,0,0,0,0],static:true,
    links:[{name:'body',pose:[0,0,0,0,0,0],visuals:[],
      collisions:[{name:'body',pose:[0,0,0,0,0,0],geometry:{type:'sphere',radius:.003}}]}]};
  const source=`${base}\n${pose('third',.6,.5)}\nZONE 0.07\nMOVEL corner\nMOVEL finish\nMOVEL third`;
  const plan=planProgram(compileProgram(source),context([sphere]));
  assert.equal(plan.status,'planned',plan.diagnostics?.[0]?.message);
  assert.equal(plan.cartesianZoneBlends.length,2);
  assert.ok(plan.cartesianZoneBlends[1].maxWaypointDistance>.003);
});

test('four Cartesian moves form three flybys under one sticky ZONE',()=>{
  const source=`ROBOT arm\nTOOL tip\n${pose('a',.3,0)}\n${pose('b',.3,.3)}\n${pose('c',.6,.3)}\n${pose('d',.6,.6)}\nZONE 0.05\nMOVEL a\nMOVEL b\nMOVEL c\nMOVEL d`;
  const result=planProgram(compileProgram(source),context());
  assert.equal(result.status,'planned',result.diagnostics?.[0]?.message);
  assert.equal(result.plans.length,4);
  assert.equal(result.cartesianZoneBlends.length,3);
  assert.ok(result.cartesianZoneBlends.every(corner=>corner.speedFraction>1e-5));
  assert.ok(result.samples.every((sample,i)=>i===0||sample.time>result.samples[i-1].time));
});

test('ZONE changes inside a Cartesian run set each corner radius',()=>{
  const source=`${base}\n${pose('third',.6,.5)}\nZONE 0.07\nMOVEL corner\nZONE 0.05\nMOVEL finish\nZONE 0.03\nMOVEL third`;
  const compiled=compileProgram(source),result=planProgram(compiled,context());
  assert.equal(result.status,'planned',result.diagnostics?.[0]?.message);
  assert.deepEqual(result.cartesianZoneBlends.map(item=>item.radius),[.05,.03]);
  assert.ok(result.cartesianZoneBlends.every(item=>item.speedFraction>1e-5 &&
    item.maxWaypointDistance<=item.radius+1e-8));
  const worker=planProgramFromSnapshot(compiled,structuredClone(snapshotProgramContext(context())));
  assert.equal(worker.status,'planned',worker.diagnostics?.[0]?.message);
  assert.deepEqual(worker.cartesianZoneBlends,result.cartesianZoneBlends);
});

test('program and Worker agree on orientation-changing Cartesian ZONE with an orientable robot',()=>{
  const source=`ROBOT arm\nTOOL tip\n${pose('corner',.4,0,'0 0 0.24740395925452294 0.9689124217106447')}\n${pose('finish',.4,.4,'0 0 0.5226872289306592 0.8525245220595057')}\nZONE 0.07\nMOVEL corner\nMOVEL finish`;
  const live=context([],.0001,true);live.planningOptions={cartesianZone:{maxAngularSpeed:.6}};
  const direct=planProgram(compileProgram(source),live);
  assert.equal(direct.status,'planned',direct.diagnostics?.[0]?.message);
  assert.equal(direct.cartesianZoneBlends.length,1);
  assert.ok(direct.cartesianZoneBlends[0].orientationTransitionAngle>0);
  assert.ok(direct.cartesianZoneBlends[0].maxAngularSpeedBound<=.6+1e-9);
  const worker=planProgramFromSnapshot(compileProgram(source),structuredClone(snapshotProgramContext(live)));
  assert.equal(worker.status,'planned',worker.diagnostics?.[0]?.message);
  assert.deepEqual(worker.samples,direct.samples);
  assert.deepEqual(worker.cartesianZoneBlends,direct.cartesianZoneBlends);
});

test('invalid second CIRC geometry reports the second command line',()=>{
  const source=`ROBOT arm\nTOOL tip\n${pose('corner',.4,0)}\n${pose('via',.5,0)}\n${pose('finish',.6,0)}\nZONE 0.07\nMOVEL corner\nMOVEC via finish`;
  const result=planProgram(compileProgram(source),context());
  assert.equal(result.status,'error');
  assert.equal(result.diagnostics[0].code,'CARTESIAN_TARGET');
  assert.equal(result.diagnostics[0].line,8);
  assert.match(result.diagnostics[0].message,/non-collinear/);
});

test('program LIN-CIRC zone retains the circular via pose in its timed playback',()=>{
  const source=`ROBOT arm\nTOOL tip\n${pose('corner',.2,0)}\n${pose('via',.3,.1)}\n${pose('finish',.4,0)}\nZONE 0.05\nMOVEL corner\nMOVEC via finish`;
  const plan=planProgram(compileProgram(source),context());
  assert.equal(plan.status,'planned',plan.diagnostics?.[0]?.message);
  assert.equal(plan.cartesianZoneBlends.length,1);
  assert.ok(plan.samples.some(sample=>Math.hypot(sample.q[0]-.3,sample.q[1]-.1)<1e-4));
});

test('program CIRC-LIN zone retains inbound via and rejects a weld-active flyby',()=>{
  const source=`ROBOT arm\nTOOL tip\n${pose('via',.1,.1)}\n${pose('corner',.2,0)}\n${pose('finish',.4,0)}\nZONE 0.05\nMOVEC via corner\nMOVEL finish`;
  const plan=planProgram(compileProgram(source),context());
  assert.equal(plan.status,'planned',plan.diagnostics?.[0]?.message);
  assert.equal(plan.cartesianZoneBlends.length,1);
  assert.ok(plan.samples.some(sample=>Math.hypot(sample.q[0]-.1,sample.q[1]-.1)<1e-4));
  const object={name:'workpiece',pose:[0,0,.02,0,0,0],static:true,
    links:[{name:'body',pose:[0,0,0,0,0,0],visuals:[],collisions:[{name:'body',pose:[0,0,0,0,0,0],geometry:{type:'sphere',radius:.01}}]}]};
  const weldSource=`${base}\nZONE 0.07\nWELD ON workpiece\nMOVEL corner\nMOVEL finish\nWELD OFF`;
  const weld=planProgram(compileProgram(weldSource),context([object]));
  assert.equal(weld.status,'error');
  assert.equal(weld.diagnostics[0].code,'ZONE_WELD_UNSUPPORTED');
});

test('program CIRC-CIRC zone preserves both via poses in the timed trajectory',()=>{
  const source=`ROBOT arm\nTOOL tip\n${pose('via1',.1,.1)}\n${pose('corner',.2,0)}\n${pose('via2',.3,-.1)}\n${pose('finish',.4,0)}\nZONE 0.05\nMOVEC via1 corner\nMOVEC via2 finish`;
  const plan=planProgram(compileProgram(source),context());
  assert.equal(plan.status,'planned',plan.diagnostics?.[0]?.message);
  assert.equal(plan.cartesianZoneBlends.length,1);
  for(const [x,y] of [[.1,.1],[.3,-.1]])
    assert.ok(plan.samples.some(sample=>Math.hypot(sample.q[0]-x,sample.q[1]-y)<1e-4),`Missing via ${x}, ${y}`);
});

test('Cartesian ZONE collision diagnostic points to the active source line',()=>{
  const inbound=linearPath({position:[0,0,0],quaternion:[0,0,0,1]},
    {position:[.4,0,0],quaternion:[0,0,0,1]});
  const outbound=linearPath({position:[.4,0,0],quaternion:[0,0,0,1]},
    {position:[.4,.4,0],quaternion:[0,0,0,1]});
  const obstacles=[];
  for(let attempt=0;attempt<7;attempt++){
    const built=createCartesianZonePath(inbound,outbound,.07,{trimScale:1/2**attempt});
    if(built.status!=='built')continue;
    const [x,y]=built.path.at(built.path.boundaryFraction).position;
    const radius=Math.min(.4-x,y)*.4;
    obstacles.push({name:`block_${attempt}`,pose:[x,y,0,0,0,0],static:true,
      links:[{name:'body',pose:[0,0,0,0,0,0],visuals:[],collisions:[{name:'body',pose:[0,0,0,0,0,0],geometry:{type:'sphere',radius}}]}]});
  }
  assert.equal(obstacles.length,7);
  const result=planProgram(compileProgram(`${base}\nZONE 0.07\nMOVEL corner\nMOVEL finish`),context(obstacles,1e-7));
  assert.equal(result.status,'error');
  assert.equal(result.diagnostics[0].code,'ZONE_COLLISION');
  assert.equal(result.diagnostics[0].line,5);
});

test('Cartesian blend validates before a later GRAB changes the collision snapshot',()=>{
  const source=`${base}\nZONE 0.07\nMOVEL corner\nMOVEL finish`;
  const clear=planProgram(compileProgram(source),context());
  assert.equal(clear.status,'planned');
  const boundary=clear.samples.find(sample=>Math.abs(sample.time-clear.cartesianZoneBlends[0].boundaryTime)<1e-9);
  const offset=.04;
  const sphere=(name,x,y,radius)=>({name,pose:[x,y,0,0,0,0],static:name==='block',
    links:[{name:'body',pose:[0,0,0,0,0,0],visuals:[],collisions:[{name:'body',pose:[0,0,0,0,0,0],geometry:{type:'sphere',radius}}]}]});
  const radius=Math.abs(.4-boundary.q[0])/4;
  const live=context([sphere('grasp',.4,.4+offset,.005),
    sphere('block',boundary.q[0],boundary.q[1]+offset,radius)]);
  const programmed=planProgram(compileProgram(`${source}\nGRAB grasp`),live);
  assert.equal(programmed.status,'planned',programmed.diagnostics?.[0]?.message);
  assert.equal(programmed.cartesianZoneBlends.length,1);
  assert.deepEqual(programmed.events.map(event=>event.kind),['GRAB']);
  const query=createPlanningCollisionScene({robotName:'arm',robotModel:programmed.model,
    allJoints:live.jointModels,robotCollisionShapes:live.robotCollisionShapes,sceneModel:live.sceneModel});
  query.attach('grasp','tool',programmed.samples.at(-1).q);
  assert.equal(query.isStateValid(boundary.q),false,'Checking the prior blend after GRAB would use future attachment state');
  query.dispose();
});
