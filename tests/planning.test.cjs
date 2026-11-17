const { test, before } = require('node:test');
const assert = require('node:assert/strict');

let T, modelApi, ikApi, pathApi, ptpApi, timingApi;
let planningApi;
before(async () => {
  T = await import('three');
  modelApi = await import('../frontend/planning/robot-model.js');
  ikApi = await import('../frontend/planning/ik-pose.js');
  pathApi = await import('../frontend/planning/paths.js');
  ptpApi = await import('../frontend/planning/ptp.js');
  timingApi = await import('../frontend/planning/timing.js');
  planningApi = await import('../frontend/planning/index.js');
});

function makeJoint(name, parent, child, type, axis, xyz, limit = [-Math.PI, Math.PI]) {
  const origin = new T.Matrix4().makeTranslation(...xyz);
  return { name, parent, child, type, axis: new T.Vector3(...axis), basicMatrix: origin,
    lower: limit[0], upper: limit[1], theta: 0 };
}

function sixAxis(base = new T.Matrix4()) {
  const joints = [
    makeJoint('j1','base','l1','revolute',[0,0,1],[0,0,0]),
    makeJoint('j2','l1','l2','revolute',[0,1,0],[0,0,.3]),
    makeJoint('j3','l2','l3','revolute',[0,1,0],[.35,0,0]),
    makeJoint('j4','l3','l4','revolute',[1,0,0],[.3,0,0]),
    makeJoint('j5','l4','l5','revolute',[0,1,0],[.2,0,0]),
    makeJoint('j6','l5','tool','revolute',[1,0,0],[0,0,.12]),
  ];
  return modelApi.createRobotModel({ joints, tipLink:'tool', toolTransform:new T.Matrix4().makeTranslation(.12,0,0), worldFromBase:base });
}

function closePose(a, b, p = 1e-4, r = 1e-3) {
  const residual = ikApi.poseResidual(a,b);
  assert.ok(residual.positionError < p, `position error ${residual.positionError}`);
  assert.ok(residual.orientationError < r, `orientation error ${residual.orientationError}`);
}

test('6D IK reaches both TCP position and orientation with a transformed robot base', () => {
  const base = new T.Matrix4().makeRotationZ(.4).setPosition(.8,-.3,.15);
  const model = sixAxis(base), wanted = [.4,-.5,.7,.3,-.6,.4];
  const target = modelApi.forwardKinematics(model,wanted);
  const result = ikApi.solvePose(model,target,{maxStarts:13,maxIterations:180});
  assert.equal(result.status,'reached',JSON.stringify(result));
  closePose(result.pose,target);
  closePose(modelApi.forwardKinematics(model,result.q),target);
  assert.ok(result.q.every((q,i)=>q>=model.joints[model.active[i]].lower&&q<=model.joints[model.active[i]].upper));
});

test('equivalent Q and AA pose targets yield the same IK branch from the same seed', async () => {
  const { compileProgram, quaternionToAxisAngle } = await import('../frontend/program.js');
  const model = sixAxis(), target = modelApi.forwardKinematics(model, [.2, -.3, .4, .1, -.2, .3]);
  const { axis, angle } = quaternionToAxisAngle(target.quaternion);
  const xyz = target.position.join(' ');
  const compiled = compileProgram(`POSE q world ${xyz} Q ${target.quaternion.join(' ')}\nPOSE a world ${xyz} AA ${axis.join(' ')} ${angle}`);
  assert.equal(compiled.ok, true);
  const qTarget = compiled.poses.get('q'), aaTarget = compiled.poses.get('a');
  closePose(qTarget, aaTarget, 1e-12, 1e-12);
  const options = { maxStarts: 13, maxIterations: 180 };
  const qSolution = ikApi.solvePose(model, qTarget, options), aaSolution = ikApi.solvePose(model, aaTarget, options);
  assert.equal(qSolution.status, 'reached');
  assert.equal(aaSolution.status, 'reached');
  assert.ok(qSolution.q.every((value, index) => Math.abs(value - aaSolution.q[index]) < 1e-10));
});

test('6D IK rejects unreachable poses, bad options and directly actuated mimic joints', () => {
  const model=sixAxis();
  const target={position:[100,0,0],quaternion:[0,0,0,1]};
  const result=ikApi.solvePose(model,target,{maxStarts:3,maxIterations:40});
  assert.equal(result.status,'unreachable');assert.ok(result.positionError>90);
  assert.equal(ikApi.solvePose(model,target,{orientationWeight:0}).status,'invalid_target');
  assert.equal(ikApi.solvePose(model,target,{maxStarts:0}).status,'invalid_target');
  const mimic=makeJoint('m','base','tip','revolute',[0,0,1],[0,0,0]);mimic.mimic={joint:'driver'};
  assert.throws(()=>modelApi.createRobotModel({joints:[mimic],tipLink:'tip'}),/mimic joint/);
});

test('LIN preserves endpoint poses and CIRC passes its via pose on a long arc', () => {
  const identity=[0,0,0,1], rotated=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),1).toArray();
  const start={position:[1,0,0],quaternion:identity}, via={position:[-1,0,0],quaternion:rotated};
  const end={position:[0,1,0],quaternion:identity};
  const line=pathApi.linearPath(start,end);closePose(line.at(0),start,1e-10,1e-10);closePose(line.at(1),end,1e-10,1e-10);
  const arc=pathApi.circularPath(start,via,end);
  assert.ok(Math.abs(arc.sweep)>Math.PI);closePose(arc.at(arc.viaFraction),via,1e-10,1e-10);
  closePose(arc.at(1),end,1e-10,1e-10);
  assert.throws(()=>pathApi.circularPath(start,{...via,position:[.5,.5,0]},end),/non-collinear/);
});

test('equivalent AA endpoints use the same shortest LIN orientation path', async () => {
  const { axisAngleToQuaternion } = await import('../frontend/program.js');
  const start = { position: [0, 0, 0], quaternion: [0, 0, 0, 1] };
  const longAA = { position: [1, 0, 0], quaternion: axisAngleToQuaternion([0, 0, 1], 3 * Math.PI / 2) };
  const shortAA = { position: [1, 0, 0], quaternion: axisAngleToQuaternion([0, 0, 1], -Math.PI / 2) };
  const longLine = pathApi.linearPath(start, longAA), shortLine = pathApi.linearPath(start, shortAA);
  assert.ok(Math.abs(longLine.rotationAngle - Math.PI / 2) < 1e-12);
  closePose(longLine.at(0.5), shortLine.at(0.5), 1e-12, 1e-12);
  const expected = { position: [0.5, 0, 0], quaternion: axisAngleToQuaternion([0, 0, 1], -Math.PI / 4) };
  closePose(longLine.at(0.5), expected, 1e-12, 1e-12);
});

test('opposite exact half-turn quaternion signs have the same endpoint but opposite LIN midpoints', async () => {
  const { axisAngleToQuaternion } = await import('../frontend/program.js');
  const start = { position: [0, 0, 0], quaternion: [0, 0, 0, 1] };
  const positive = pathApi.linearPath(start, { position: [1, 0, 0], quaternion: [0, 0, 1, 0] });
  const negative = pathApi.linearPath(start, { position: [1, 0, 0], quaternion: [0, 0, -1, 0] });
  closePose(positive.at(1), negative.at(1), 1e-12, 1e-12);
  closePose(positive.at(0.5), { position: [0.5, 0, 0], quaternion: axisAngleToQuaternion([0, 0, 1], Math.PI / 2) }, 1e-12, 1e-12);
  closePose(negative.at(0.5), { position: [0.5, 0, 0], quaternion: axisAngleToQuaternion([0, 0, 1], -Math.PI / 2) }, 1e-12, 1e-12);
});

test('Cartesian solver includes CIRC via sample and reports blocked geometry without detouring', () => {
  const model=modelApi.createRobotModel({joints:[makeJoint('turn','base','tip','revolute',[0,0,1],[0,0,0])],tipLink:'tip',toolTransform:new T.Matrix4().makeTranslation(1,0,0)});
  const startQ=[0], viaQ=[.4], endQ=[.8];
  const start=modelApi.forwardKinematics(model,startQ), via=modelApi.forwardKinematics(model,viaQ), end=modelApi.forwardKinematics(model,endQ);
  const arc=pathApi.circularPath(start,via,end);
  const plan=pathApi.solveCartesianPath(model,arc,{start:startQ,translationStep:.1,maxStarts:4,maxIterations:120});
  assert.equal(plan.status,'planned',JSON.stringify(plan));
  const viaSample=plan.jointPath.find(item=>Math.abs(item.s-arc.viaFraction)<1e-12);
  assert.ok(viaSample,'Via fraction must be an explicit joint sample');
  closePose(modelApi.forwardKinematics(model,viaSample.q),via,1e-4,1e-3);

  const slide=modelApi.createRobotModel({joints:[makeJoint('slide','base','tip','prismatic',[1,0,0],[0,0,0],[0,1])],tipLink:'tip'});
  const slideStart=modelApi.forwardKinematics(slide,[0]), slideEnd=modelApi.forwardKinematics(slide,[.3]);
  const blocked=pathApi.solveCartesianPath(slide,pathApi.linearPath(slideStart,slideEnd),{start:[0],translationStep:.05,isStateValid:q=>q[0]<.15});
  assert.equal(blocked.status,'collision');
  assert.match(blocked.reason,/collision\/state validation/i);
  assert.equal(blocked.result.status,'collision');
  assert.ok(blocked.result.positionError<=1e-4,'The geometric IK target is reached; the state validator rejects it.');
});

test('PTP plans directly, checks interior states, then routes around a joint-space obstacle', () => {
  const model=modelApi.createRobotModel({joints:[
    makeJoint('x','base','a','revolute',[0,0,1],[0,0,0],[-2,2]),
    makeJoint('y','a','tip','revolute',[0,1,0],[1,0,0],[-2,2]),
  ],tipLink:'tip'});
  const valid=q=>!(Math.abs(q[0])<.25&&Math.abs(q[1])<.25);
  const queries=ptpApi.createCollisionQueries(model,valid);
  assert.equal(queries.isEdgeValid([-1,-1],[1,1]),false);
  const route=ptpApi.planPTP(model,[-1,-1],[1,1],{...queries,maxNodes:4000,seed:19});
  assert.equal(route.status,'planned',JSON.stringify(route));
  assert.equal(route.direct,false);
  for(let i=1;i<route.jointPath.length;i++) assert.ok(queries.isEdgeValid(route.jointPath[i-1].q,route.jointPath[i].q));
  assert.throws(()=>ptpApi.createCollisionQueries(model,valid,{maxRevoluteStep:0}),/positive/);
});

test('timing produces bounded velocity and acceleration and zero endpoint derivatives', () => {
  const model=sixAxis();const q0=model.initial,q1=[.4,-.3,.2,.5,.1,-.2];
  const plan=ptpApi.planPTP(model,q0,q1);
  const limits={velocity:[1,1,1,1,1,1],acceleration:[2,2,2,2,2,2]};
  const timed=timingApi.timeParameterize(plan.jointPath,limits,{model,dt:.01});
  assert.equal(timed.status,'timed',JSON.stringify(timed));
  assert.ok(timed.duration>0);assert.deepEqual(timed.points[0].q,q0);
  assert.ok(timed.points[0].velocity.every(v=>Math.abs(v)<1e-12));
  assert.ok(timed.points.at(-1).acceleration.every(a=>Math.abs(a)<1e-10));
  for(const point of timed.points) for(let j=0;j<6;j++){
    assert.ok(Math.abs(point.velocity[j])<=1+1e-9);
    assert.ok(Math.abs(point.acceleration[j])<=2+1e-9);
  }
});

test('timing retains a narrow interior knot and falls back to a real stop at an unsafe rounded corner', () => {
  const limits={velocity:[1],acceleration:[2]};
  const narrow=[{s:0,q:[0]},{s:.01,q:[.02]},{s:1,q:[.1]}];
  const timed=timingApi.timeParameterize(narrow,limits,{dt:10});
  assert.equal(timed.status,'timed',JSON.stringify(timed));
  assert.ok(timed.points.some(point=>Math.abs(point.s-.01)<1e-10&&Math.abs(point.q[0]-.02)<1e-10));
  for(const point of timed.points){assert.ok(Math.abs(point.velocity[0])<=1+1e-9);assert.ok(Math.abs(point.acceleration[0])<=2+1e-9);}
  const corner=[{s:0,q:[0]},{s:.5,q:[1]},{s:1,q:[1.1]}];
  const fallback=timingApi.timeParameterize(corner,limits,{isStateValid:q=>q[0]<=1.1+1e-8,allowInternalStops:true});
  assert.equal(fallback.status,'timed',JSON.stringify(fallback));
  assert.equal(fallback.internalStops,true);
  assert.ok(fallback.points.some(point=>Math.abs(point.s-.5)<1e-10&&Math.abs(point.velocity[0])<1e-10));
});

test('top-level planner returns a timed CIRC and ROS-shaped trajectory fields', () => {
  const model=modelApi.createRobotModel({joints:[makeJoint('turn','base','tip','revolute',[0,0,1],[0,0,0])],tipLink:'tip',toolTransform:new T.Matrix4().makeTranslation(1,0,0)});
  const via=modelApi.forwardKinematics(model,[.4]),goal=modelApi.forwardKinematics(model,[.8]);
  const arc=pathApi.circularPath(modelApi.forwardKinematics(model,[0]),via,goal);
  const plan=planningApi.planMove({type:'CIRC',model,start:[0],via,goal,limits:{velocity:[1],acceleration:[2]}});
  assert.equal(plan.status,'planned',JSON.stringify(plan));
  const timedVia=plan.points.find(point=>Math.abs(point.s-arc.viaFraction)<1e-10);
  assert.ok(timedVia,'Timed playback must include the programmed via pose');
  closePose(modelApi.forwardKinematics(model,timedVia.q),via,1e-4,1e-3);
  const ros=planningApi.trajectoryToROS(plan,model.jointNames);
  assert.deepEqual(ros.joint_names,['turn']);
  assert.ok(ros.points.length>2);assert.ok(ros.points.at(-1).time_from_start.sec>=0);
});

test('near-coincident circular via and uniform fractions retain via without extreme retiming', () => {
  const model=modelApi.createRobotModel({joints:[
    makeJoint('x','base','x_link','prismatic',[1,0,0],[0,0,0],[0,.8]),
    makeJoint('y','x_link','tip','prismatic',[0,1,0],[0,0,0],[-.25,.25]),
  ],tipLink:'tip'});
  const pose=(x,y)=>({position:[x,y,0],quaternion:[0,0,0,1]});
  const start=[.14998919783424,0], via=pose(.35,.14), goal=pose(.55,0);
  const arc=pathApi.circularPath(modelApi.forwardKinematics(model,start),via,goal);
  assert.ok(Math.abs(arc.viaFraction-.5)<.00002 && arc.viaFraction!==.5);
  const limits={velocity:[.5,.5],acceleration:[1,1]};
  const plan=planningApi.planMove({type:'CIRC',model,start,via,goal,limits});
  assert.equal(plan.status,'planned',JSON.stringify(plan));
  assert.ok(plan.duration<10,`Unexpected ${plan.duration} s for a ${arc.length} m arc`);
  assert.ok(plan.points.length<3000);
  const viaKnot=plan.jointPath.find(point=>Math.abs(point.s-arc.viaFraction)<1e-12);
  assert.ok(viaKnot,'The exact programmed via fraction must remain in the IK path');
  closePose(modelApi.forwardKinematics(model,viaKnot.q),via,1e-4,1e-3);
  for(const point of plan.points) for(let j=0;j<2;j++) {
    assert.ok(Math.abs(point.velocity[j])<=limits.velocity[j]+1e-9);
    assert.ok(Math.abs(point.acceleration[j])<=limits.acceleration[j]+1e-9);
  }
});
