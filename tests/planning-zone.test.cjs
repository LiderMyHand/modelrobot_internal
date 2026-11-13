const { test, before } = require('node:test');
const assert = require('node:assert/strict');

let T, createRobotModel, forwardKinematics, timeParameterize, blendPTPCorner;
before(async () => {
  T = await import('three');
  ({ createRobotModel, forwardKinematics } = await import('../frontend/planning/robot-model.js'));
  ({ timeParameterize } = await import('../frontend/planning/timing.js'));
  ({ blendPTPCorner } = await import('../frontend/planning/zone.js'));
});

function fixture() {
  const joints=[
    {name:'x',parent:'base',child:'middle',type:'prismatic',axis:[1,0,0],origin:new T.Matrix4().elements.slice(),lower:-1,upper:1,theta:0},
    {name:'y',parent:'middle',child:'tip',type:'prismatic',axis:[0,1,0],origin:new T.Matrix4().elements.slice(),lower:-1,upper:1,theta:0},
  ];
  const model=createRobotModel({joints,tipLink:'tip'}), limits={velocity:[.6,.6],acceleration:[1.5,1.5]};
  const first=timeParameterize([{s:0,q:[0,0]},{s:1,q:[.4,0]}],limits,{model});
  const second=timeParameterize([{s:0,q:[.4,0]},{s:1,q:[.4,.4]}],limits,{model});
  assert.equal(first.status,'timed'); assert.equal(second.status,'timed');
  const reserve=1.45;
  const stretch=points=>points.map(point=>({...point,time:point.time*reserve,
    velocity:point.velocity.map(value=>value/reserve),acceleration:point.acceleration.map(value=>value/reserve**2)}));
  const before=stretch(first.points),after=stretch(second.points);
  const samples=[...before,...after.slice(1).map(point=>({...point,time:point.time+first.duration*reserve}))];
  return {model,limits,samples,boundaryTime:first.duration*reserve,leftStart:0,rightEnd:(first.duration+second.duration)*reserve};
}

test('positive ZONE crosses a PTP corner without stopping and stays within TCP, velocity, and acceleration bounds',()=>{
  const context=fixture(), radius=.07;
  const result=blendPTPCorner(context.samples,{...context,radius,isStateValid:()=>true});
  assert.equal(result.status,'blended',result.reason);
  assert.ok(result.cornerSpeedFraction>1e-5);
  assert.ok(result.waypointDeviation>1e-6,'The blend should bypass the exact corner');
  assert.ok(result.samples.every((point,i)=>i===0||point.time>result.samples[i-1].time));
  const corner=forwardKinematics(context.model,[.4,0]);
  const window=result.samples.filter(point=>point.time>=result.entryTime&&point.time<=result.exitTime);
  for(let k=1;k<window.length;k++) window[k].q.forEach((value,j)=>
    assert.ok(value>=window[k-1].q[j]-1e-8,'A blended joint should not reverse within the corner window'));
  for(const cutTime of [result.entryTime,result.exitTime]) {
    const actual=result.samples.find(point=>Math.abs(point.time-cutTime)<1e-12);
    const original=context.samples.find(point=>Math.abs(point.time-cutTime)<1e-12);
    for(const key of ['q','velocity','acceleration']) actual[key].forEach((value,j)=>
      assert.ok(Math.abs(value-original[key][j])<1e-8,`C2 splice ${key} mismatch at ${cutTime}`));
  }
  for(const point of window){
    const pose=forwardKinematics(context.model,point.q);
    assert.ok(Math.hypot(...pose.position.map((value,i)=>value-corner.position[i]))<=radius+1e-7);
    point.velocity.forEach((value,i)=>assert.ok(Math.abs(value)<=context.limits.velocity[i]*(1+1e-6)));
    point.acceleration.forEach((value,i)=>assert.ok(Math.abs(value)<=context.limits.acceleration[i]*(1+1e-6)));
  }
  const originalCorner=context.samples.find(point=>Math.abs(point.time-context.boundaryTime)<1e-9);
  assert.ok(originalCorner.velocity.every(value=>Math.abs(value)<1e-9),'Default boundary remains a stop before blending');
});

test('ZONE rejects a corner whose interior is blocked instead of silently stopping',()=>{
  const context=fixture();
  const isStateValid=q=>!(Math.abs(q[0]-.4)>1e-9&&Math.abs(q[1])>1e-9);
  const result=blendPTPCorner(context.samples,{...context,radius:.1,isStateValid});
  assert.equal(result.status,'zone_infeasible');
  assert.match(result.reason,/obstacle/);
});
