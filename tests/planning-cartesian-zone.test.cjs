const { test, before } = require('node:test');
const assert = require('node:assert/strict');

let T, paths, createCartesianZonePath, planCartesianZonePair, createCartesianZoneChainPath, planCartesianZoneChain,
  maximumPathAngularRate, createRobotModel, forwardKinematics, relativeRotationVector;
before(async()=>{
  T=await import('three');
  paths=await import('../frontend/planning/paths.js');
  ({createCartesianZonePath,planCartesianZonePair,createCartesianZoneChainPath,planCartesianZoneChain,
    maximumPathAngularRate}=await import('../frontend/planning/cartesian-zone.js'));
  ({createRobotModel,forwardKinematics}=await import('../frontend/planning/robot-model.js'));
  ({relativeRotationVector}=await import('../frontend/planning/orientation.js'));
});
const pose=(x,y,z=0)=>({position:[x,y,z],quaternion:[0,0,0,1]});
const yawPose=(x,y,yaw)=>({position:[x,y,0],quaternion:[0,0,Math.sin(yaw/2),Math.cos(yaw/2)]});
const dist=(a,b)=>Math.hypot(...a.map((value,i)=>value-b[i]));
const rotationError=(a,b)=>relativeRotationVector(a,b).length();
function model() {
  const origin=new T.Matrix4().elements.slice();
  return createRobotModel({tipLink:'tip',joints:[
    {name:'x',parent:'base',child:'middle',type:'prismatic',axis:[1,0,0],origin,lower:-1,upper:1,theta:0},
    {name:'y',parent:'middle',child:'tip',type:'prismatic',axis:[0,1,0],origin,lower:-1,upper:1,theta:0},
  ]});
}
function orientableModel() {
  const origin=new T.Matrix4().elements.slice();
  return createRobotModel({tipLink:'tip',joints:[
    {name:'x',parent:'base',child:'middle',type:'prismatic',axis:[1,0,0],origin,lower:-1,upper:1,theta:0},
    {name:'y',parent:'middle',child:'wrist',type:'prismatic',axis:[0,1,0],origin,lower:-1,upper:1,theta:0},
    {name:'yaw',parent:'wrist',child:'tip',type:'revolute',axis:[0,0,1],origin,lower:-Math.PI,upper:Math.PI,theta:0},
  ]});
}

test('LIN-LIN composite keeps exact original prefixes and a bounded C2 corner',()=>{
  const first=paths.linearPath(pose(0,0),pose(.4,0)),second=paths.linearPath(pose(.4,0),pose(.4,.4));
  const built=createCartesianZonePath(first,second,.07);
  assert.equal(built.status,'built',built.reason);
  const path=built.path;
  assert.ok(dist(path.at(0).position,[0,0,0])<1e-12);
  assert.ok(dist(path.at(1).position,[.4,.4,0])<1e-12);
  for(const s of [.1,path.entryFraction*.5]) assert.ok(dist(path.at(s).position,first.at(s*path.length/first.length).position)<1e-12);
  assert.ok(dist(path.at(path.boundaryFraction).position,[.4,0,0])>1e-5);
  for(let i=0;i<=100;i++){
    const s=path.entryFraction+(path.exitFraction-path.entryFraction)*i/100;
    assert.ok(dist(path.at(s).position,[.4,0,0])<=.07+1e-8);
  }
  assert.ok(built.controls.every(point=>dist(point,[.4,0,0])<=.07));
});

test('CIRC via remains a required exact sample outside a LIN-CIRC zone',()=>{
  const first=paths.linearPath(pose(-.2,0),pose(0,0));
  const second=paths.circularPath(pose(0,0),pose(.1,.1),pose(.2,0));
  const built=createCartesianZonePath(first,second,.05);
  assert.equal(built.status,'built',built.reason);
  const viaFraction=built.path.requiredFractions.find(s=>dist(built.path.at(s).position,[.1,.1,0])<1e-9);
  assert.ok(Number.isFinite(viaFraction));
  assert.ok(viaFraction>built.path.exitFraction);
  assert.ok(dist(built.path.at(viaFraction).position,[.1,.1,0])<1e-9);
});

test('CIRC-LIN, CIRC-CIRC, and long-arc CIRC retain via points and bounded transition geometry',()=>{
  const first=paths.circularPath(pose(0,0),pose(.1,.1),pose(.2,0));
  const lin=paths.linearPath(pose(.2,0),pose(.4,0));
  const second=paths.circularPath(pose(.2,0),pose(.3,-.1),pose(.4,0));
  for(const outbound of [lin,second]) {
    const built=createCartesianZonePath(first,outbound,.05);
    assert.equal(built.status,'built',built.reason);
    assert.ok(built.path.requiredFractions.some(s=>dist(built.path.at(s).position,[.1,.1,0])<1e-9));
    if(outbound.type==='CIRC') assert.ok(built.path.requiredFractions.some(s=>dist(built.path.at(s).position,[.3,-.1,0])<1e-9));
    assert.ok(built.controls.every(point=>dist(point,[.2,0,0])<.05));
  }
  const long=paths.circularPath(pose(1,0),pose(-1,0),pose(0,-1));
  assert.ok(Math.abs(long.sweep)>Math.PI);
  const joined=createCartesianZonePath(long,paths.linearPath(pose(0,-1),pose(.2,-1)),.05);
  assert.equal(joined.status,'built',joined.reason);
  assert.ok(joined.path.requiredFractions.some(s=>dist(joined.path.at(s).position,[-1,0,0])<1e-9));
});

test('three-move Cartesian chain has disjoint trims and two timed non-stopping corners',()=>{
  const waypoints=[yawPose(0,0,0),yawPose(.4,0,.4),yawPose(.4,.4,.8),yawPose(.6,.5,1.2)];
  const segments=waypoints.slice(1).map((value,i)=>paths.linearPath(waypoints[i],value));
  const geometry=createCartesianZoneChainPath(segments,[.06,.06]);
  assert.equal(geometry.status,'built',geometry.reason);
  assert.ok(geometry.corners[0].exitDistance<geometry.corners[1].entryDistance);
  assert.ok(geometry.path.requiredFractions.every((value,i,values)=>i===0||value>values[i-1]));
  for(const corner of geometry.corners) {
    assert.ok(dist(geometry.path.at(corner.boundaryDistance/geometry.total).position,corner.waypoint)>1e-5);
    for(let i=0;i<=20;i++) {
      const distance=corner.entryDistance+(corner.exitDistance-corner.entryDistance)*i/20;
      assert.ok(dist(geometry.path.at(distance/geometry.total).position,corner.waypoint)<=.06+1e-8);
    }
  }
  const robot=orientableModel();
  const timed=planCartesianZoneChain({model:robot,start:[0,0,0],paths:segments,radii:[.06,.06],
    limits:{velocity:[.6,.6,1.5],acceleration:[1.5,1.5,3]},isStateValid:()=>true});
  assert.equal(timed.status,'planned',timed.reason);
  assert.equal(timed.corners.length,2);
  assert.ok(timed.corners.every(corner=>corner.speedFraction>1e-5&&corner.maxWaypointDistance<=.06+1e-8));
  assert.ok(timed.maxAngularSpeedBound<=1+1e-9);
  assert.ok(timed.points.every((point,i)=>i===0||point.time>timed.points[i-1].time));
  assert.ok(timed.points.every(point=>dist(forwardKinematics(robot,point.q).position,timed.path.at(point.s).position)<.002));
});

test('Cartesian chain collision at its second corner identifies that corner',()=>{
  const points=[pose(0,0),pose(.4,0),pose(.4,.4),pose(.6,.5)];
  const segments=points.slice(1).map((value,i)=>paths.linearPath(points[i],value));
  const result=planCartesianZoneChain({model:model(),start:[0,0],paths:segments,radii:[.06,.06],
    limits:{velocity:[.6,.6],acceleration:[1.5,1.5]},
    isStateValid:q=>!(q[0]>.40000001 && q[1]>.40000001)});
  assert.equal(result.status,'zone_infeasible');
  assert.equal(result.causeStatus,'collision');
  assert.equal(result.cornerIndex,1);
});

test('composite LIN-LIN plan has a non-stopping timed boundary and FK follows declared curve',()=>{
  const robot=model(),first=paths.linearPath(pose(0,0),pose(.4,0)),second=paths.linearPath(pose(.4,0),pose(.4,.4));
  const result=planCartesianZonePair({model:robot,start:[0,0],inbound:first,outbound:second,radius:.07,
    limits:{velocity:[.6,.6],acceleration:[1.5,1.5]},isStateValid:()=>true});
  assert.equal(result.status,'planned',result.reason);
  const boundary=result.points.find(point=>Math.abs(point.time-result.boundaryTime)<1e-9);
  assert.ok(boundary);
  assert.ok(result.speedFraction>1e-5);
  assert.ok(dist(forwardKinematics(robot,boundary.q).position,[.4,0,0])>1e-5);
  assert.ok(result.maxWaypointDistance<=.07+1e-8);
  for(const point of result.points) {
    assert.ok(dist(forwardKinematics(robot,point.q).position,result.path.at(point.s).position)<.002);
    point.velocity.forEach((value,i)=>assert.ok(Math.abs(value)<=.6*(1+1e-6)));
    point.acceleration.forEach((value,i)=>assert.ok(Math.abs(value)<=1.5*(1+1e-6)));
  }
  const override=planCartesianZonePair({model:robot,start:[0,0],inbound:first,outbound:second,radius:.07,
    limits:{velocity:[.6,.6],acceleration:[1.5,1.5]},isStateValid:()=>true,
    options:{timing:{allowInternalStops:true}}});
  assert.equal(override.status,'planned',override.reason);
  assert.equal(override.internalStops,false,'User timing overrides cannot permit stops inside a Cartesian flyby');
  assert.deepEqual(override.points,result.points);
});

test('Cartesian ZONE refuses a blocked flyby without substituting a stop',()=>{
  const robot=model(),first=paths.linearPath(pose(0,0),pose(.4,0)),second=paths.linearPath(pose(.4,0),pose(.4,.4));
  const isStateValid=q=>!(q[0]<.4-1e-10&&q[1]>1e-10);
  const result=planCartesianZonePair({model:robot,start:[0,0],inbound:first,outbound:second,radius:.07,
    limits:{velocity:[.6,.6],acceleration:[1.5,1.5]},isStateValid});
  assert.equal(result.status,'zone_infeasible');
  assert.equal(result.causeStatus,'collision');
  assert.match(result.reason,/obstacle|collid|disallowed/i);
});

test('SO(3) splice preserves original orientations and angular tangents at both cuts',()=>{
  const first=paths.linearPath(yawPose(0,0,0),yawPose(.4,0,.5));
  const second=paths.circularPath(yawPose(.4,0,.5),yawPose(.5,.1,.8),yawPose(.6,0,1.2));
  const built=createCartesianZonePath(first,second,.06);
  assert.equal(built.status,'built',built.reason);
  const path=built.path, eps=1e-6, d=path.length*eps;
  const entry=path.entryFraction,exit=path.exitFraction;
  for(const s of [0,.2,entry*.8])
    assert.ok(rotationError(path.at(s).quaternion,first.at(s*path.length/first.length).quaternion)<1e-10);
  for(const s of [exit+(1-exit)*.2,1])
    assert.ok(rotationError(path.at(s).quaternion,second.at((s*path.length-first.length)/second.length).quaternion)<1e-10);
  const entryLeft=relativeRotationVector(path.at(entry-eps).quaternion,path.at(entry).quaternion).divideScalar(d);
  const entryRight=relativeRotationVector(path.at(entry).quaternion,path.at(entry+eps).quaternion).divideScalar(d);
  const exitLeft=relativeRotationVector(path.at(exit-eps).quaternion,path.at(exit).quaternion).divideScalar(d);
  const exitRight=relativeRotationVector(path.at(exit).quaternion,path.at(exit+eps).quaternion).divideScalar(d);
  assert.ok(entryLeft.distanceTo(entryRight)<2e-4,`entry angular-rate jump ${entryLeft.distanceTo(entryRight)}`);
  assert.ok(exitLeft.distanceTo(exitRight)<2e-4,`exit angular-rate jump ${exitLeft.distanceTo(exitRight)}`);
  const via=path.requiredFractions.find(s=>rotationError(path.at(s).quaternion,second.via.quaternion)<1e-9);
  assert.ok(Number.isFinite(via)&&via>exit);
  assert.ok(rotationError(path.at(via).quaternion,second.via.quaternion)<1e-9);
});

test('SO(3) transition matches noncommuting body rates and chooses shortest endpoint branch',async()=>{
  const {orientationTransition}=await import('../frontend/planning/orientation.js');
  const qa=new T.Quaternion().setFromEuler(new T.Euler(.35,-.2,.1));
  const qb=new T.Quaternion().setFromEuler(new T.Euler(-.1,.45,.7));
  const inbound=[.8,-.3,.2],outbound=[-.25,.6,.4],span=.12;
  const transition=orientationTransition(qa.toArray(),qb.toArray(),inbound,outbound,span);
  const negative=orientationTransition(qa.toArray(),qb.toArray().map(value=>-value),inbound,outbound,span);
  assert.ok(transition.relativeAngle<=Math.PI+1e-12);
  assert.ok(rotationError(transition.at(0),qa.toArray())<1e-12);
  assert.ok(rotationError(transition.at(1),qb.toArray())<1e-12);
  for(const u of [0,.2,.5,.8,1]) assert.ok(rotationError(transition.at(u),negative.at(u))<1e-10);
  const du=1e-6;
  const startNumerical=relativeRotationVector(transition.at(0),transition.at(du)).divideScalar(span*du);
  const endNumerical=relativeRotationVector(transition.at(1-du),transition.at(1)).divideScalar(span*du);
  assert.ok(startNumerical.distanceTo(new T.Vector3(...inbound))<2e-4);
  assert.ok(endNumerical.distanceTo(new T.Vector3(...outbound))<2e-4);
  for(const u of [0,.1,.3,.5,.7,.9,1])
    assert.ok(Math.hypot(...transition.bodyRateAt(u))<=transition.rateBound*(1+1e-9));
});

test('angular cap considers both CIRC SLERP segments even with a near-end via',()=>{
  for(const viaFraction of [1e-12,1-1e-12]){
    const path={viaFraction,angularVelocityAt(fraction){return fraction<viaFraction?[7,0,0]:[0,13,0];}};
    assert.equal(maximumPathAngularRate(path),13);
  }
});

test('orientation-changing LIN-LIN pair obeys angular and joint limits with exact timed cuts',()=>{
  const robot=orientableModel();
  const first=paths.linearPath(yawPose(0,0,0),yawPose(.4,0,.5));
  const second=paths.linearPath(yawPose(.4,0,.5),yawPose(.4,.4,1.1));
  const limits={velocity:[.6,.6,1.5],acceleration:[1.5,1.5,3]};
  const maxAngularSpeed=.2;
  const result=planCartesianZonePair({model:robot,start:[0,0,0],inbound:first,outbound:second,
    radius:.07,limits,isStateValid:()=>true,options:{cartesianZone:{maxAngularSpeed}}});
  assert.equal(result.status,'planned',result.reason);
  assert.ok(result.orientationTransitionAngle>0);
  assert.ok(result.maxAngularSpeedBound<=maxAngularSpeed*(1+1e-9));
  const faster=planCartesianZonePair({model:robot,start:[0,0,0],inbound:first,outbound:second,
    radius:.07,limits,isStateValid:()=>true,options:{cartesianZone:{maxAngularSpeed:2}}});
  assert.equal(faster.status,'planned',faster.reason);
  assert.ok(result.duration>faster.duration*1.2,'Angular cap must retime the whole pair');
  assert.ok(result.speedFraction>1e-5);
  for(const fraction of result.requiredFractions) assert.ok(result.points.some(point=>Math.abs(point.s-fraction)<1e-10));
  for(const point of result.points){
    const fk=forwardKinematics(robot,point.q), reference=result.path.at(point.s);
    assert.ok(dist(fk.position,reference.position)<.002);
    assert.ok(rotationError(fk.quaternion,reference.quaternion)<1e-4);
    point.velocity.forEach((value,i)=>assert.ok(Math.abs(value)<=limits.velocity[i]*(1+1e-6)));
    point.acceleration.forEach((value,i)=>assert.ok(Math.abs(value)<=limits.acceleration[i]*(1+1e-6)));
  }
  for(let i=1;i<result.points.length;i++){
    const previous=result.points[i-1],current=result.points[i];
    const average=rotationError(result.path.at(previous.s).quaternion,result.path.at(current.s).quaternion)/(current.time-previous.time);
    assert.ok(average<=maxAngularSpeed+1e-6);
  }
});

test('orientation-changing LIN/CIRC pairs keep exact via orientations in timed samples',()=>{
  const robot=orientableModel(),limits={velocity:[.7,.7,1.5],acceleration:[2,2,3]};
  const start=yawPose(0,0,0),corner=yawPose(.2,0,.35);
  const inboundLine=paths.linearPath(start,corner);
  const outboundArc=paths.circularPath(corner,yawPose(.3,.1,.675),yawPose(.4,0,1));
  const inboundArc=paths.circularPath(start,yawPose(.1,.1,.175),corner);
  const outboundLine=paths.linearPath(corner,yawPose(.4,0,1));
  const secondArc=paths.circularPath(corner,yawPose(.3,-.1,.675),yawPose(.4,0,1));
  for(const [inbound,outbound,vias] of [[inboundLine,outboundArc,[outboundArc.via]],
    [inboundArc,outboundLine,[inboundArc.via]], [inboundArc,secondArc,[inboundArc.via,secondArc.via]]]){
    const result=planCartesianZonePair({model:robot,start:[0,0,0],inbound,outbound,
      radius:.05,limits,isStateValid:()=>true});
    assert.equal(result.status,'planned',`${inbound.type}-${outbound.type}: ${result.reason}`);
    for(const via of vias){
      const required=result.requiredFractions.find(s=>dist(result.path.at(s).position,via.position)<1e-10);
      assert.ok(Number.isFinite(required));
      const sample=result.points.find(point=>Math.abs(point.s-required)<1e-10);
      assert.ok(sample,'exact CIRC via sample missing');
      assert.ok(dist(forwardKinematics(robot,sample.q).position,via.position)<.002);
      assert.ok(rotationError(forwardKinematics(robot,sample.q).quaternion,via.quaternion)<1e-4);
    }
  }
});
