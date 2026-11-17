const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
let T, createRobotModel, forwardKinematics, integrateJogVelocity, solveVelocity;
before(async () => {
  T = await import('three');
  ({ createRobotModel, forwardKinematics } = await import('../frontend/planning/robot-model.js'));
  ({ integrateJogVelocity } = await import('../frontend/planning/jog-integration.js'));
  ({ solveVelocity } = await import('../frontend/planning/velocity-ik.js'));
});
function joint(i, axis, xyz, type = 'revolute') {
  return { name: `j${i}`, parent: i === 1 ? 'base' : `l${i-1}`, child: `l${i}`, type, axis,
    basicMatrix: new T.Matrix4().makeTranslation(...xyz), lower: -2, upper: 2, theta: 0 };
}
function arm() {
  return createRobotModel({ joints: [joint(1,[0,0,1],[0,0,0]), joint(2,[0,1,0],[0,0,.3]),
    joint(3,[0,1,0],[.35,0,0]), joint(4,[1,0,0],[.3,0,0]),
    joint(5,[0,1,0],[.2,0,0]), joint(6,[1,0,0],[0,0,.12])],
    tipLink:'l6', toolTransform: new T.Matrix4().makeTranslation(.12,0,0) });
}
function rail() { return createRobotModel({joints:[joint(1,[1,0,0],[0,0,0],'prismatic')],tipLink:'l1'}); }

function classroomFixture() {
  const xml = readFileSync('testowe/workcell/arm.urdf', 'utf8');
  const attributes = text => Object.fromEntries([...text.matchAll(/(\w+)="([^"]*)"/g)].map(match => [match[1],match[2]]));
  const joints = [...xml.matchAll(/<joint\s+([^>]+)>([\s\S]*?)<\/joint>/g)].map(([,head,body]) => {
    const info=attributes(head), tag=name=>attributes(body.match(new RegExp(`<${name}\\s+([^>]+)`))?.[1] || '');
    const xyz=(tag('origin').xyz || '0 0 0').split(/\s+/).map(Number);
    assert.equal(tag('origin').rpy,undefined,'classroom fixture uses unrotated joint origins');
    return {...info,parent:tag('parent').link,child:tag('child').link,
      axis:(tag('axis').xyz || '1 0 0').split(/\s+/).map(Number),
      basicMatrix:new T.Matrix4().makeTranslation(...xyz),
      lower:Number(tag('limit').lower),upper:Number(tag('limit').upper),theta:0,
      velocity:Number(tag('limit').velocity)};
  });
  assert.equal(joints.length,7);
  return {model:createRobotModel({joints,tipLink:'tcp_link'}),
    velocityLimits:joints.filter(j=>j.type!=='fixed').map(j=>j.velocity)};
}

test('classroom fixture completes the exact browser world and tool jog sequence', () => {
  const {model,velocityLimits}=classroomFixture();
  let q=[.23,-.5,.8,.3,-.4,.2];
  const start=forwardKinematics(model,q);
  const world=integrateJogVelocity(model,q,[0,0,.03,0,0,0],{dt:.1,velocityLimits});
  assert.equal(world.status,'solved',JSON.stringify(world));
  assert.equal(world.sampleTimes.at(-1),.1);
  assert.equal(world.sampleTimes.length,11,'ten 10ms steps, no floating-point residue step');
  const end=forwardKinematics(model,world.nextQ);
  assert.ok(Math.hypot(...end.position.map((v,i)=>v-start.position[i]-(i===2?.003:0)))<1e-5);
  q=world.nextQ;
  const tool=integrateJogVelocity(model,q,[.03,0,0,0,0,0],{dt:.1,frame:'tool',velocityLimits});
  assert.equal(tool.status,'solved',JSON.stringify(tool));
  assert.equal(tool.sampleTimes.at(-1),.1);
});

test('finite Cartesian jog avoids the large one-Euler-step axis and orientation error', () => {
  const model = arm();
  const q = [-1.2987105299718678,-1.0839110992848873,.3384531469084322,-1.2146519178524613,.5774269557557999,.26451974697411057];
  const twist = [0,0,.2,0,0,0], options = {dt:.25,velocityLimits:Array(6).fill(2)};
  const initial = forwardKinematics(model,q), coarse = solveVelocity(model,q,twist,options);
  const coarsePose = forwardKinematics(model,coarse.nextQ);
  assert.ok(Math.hypot(...coarsePose.position.map((v,i)=>v-initial.position[i]-twist[i]*.25)) > .02);
  // The requested .25s path approaches an unavailable direction. Unlike the
  // coarse solve it must fail atomically, not jump across that region.
  const blocked = integrateJogVelocity(model,q,twist,options);
  assert.notEqual(blocked.status,'solved');
  assert.deepEqual(blocked.nextQ,q);
  const result = integrateJogVelocity(model,q,twist,{...options,dt:.2});
  assert.equal(result.status,'solved',JSON.stringify(result));
  const final = forwardKinematics(model,result.nextQ);
  const desiredDistance = .2 * .2 * result.averageSpeedScale;
  assert.ok(Math.hypot(...final.position.map((v,i)=>v-initial.position[i]-(i===2?desiredDistance:0))) < .0015);
  assert.ok(new T.Quaternion(...initial.quaternion).angleTo(new T.Quaternion(...final.quaternion)) < .003);
  assert.ok(result.samples.length >= 21);
  assert.deepEqual(result.samples[0],q);
  for (let i=1;i<result.samples.length;i++) {
    const step = result.sampleTimes[i]-result.sampleTimes[i-1];
    assert.ok(step <= .01+1e-12);
    assert.ok(result.samples[i].every((v,j)=>Math.abs(v-result.samples[i-1][j])/step <= 2+1e-8));
  }
});

test('rate-limited translation reduces speed without changing direction', () => {
  const model=rail(), q=[0], twist=[.2,0,0,0,0,0];
  const result=integrateJogVelocity(model,q,twist,{dt:.1,velocityLimits:[.05]});
  assert.equal(result.status,'solved');
  assert.equal(result.speedScale,.25);
  assert.ok(Math.abs(result.nextQ[0]-.005)<1e-8);
  assert.ok(result.achieved.slice(1).every(v=>v===0));
  assert.ok(Math.abs(result.qdot[0]-.05)<1e-7);
  assert.deepEqual(q,[0]); assert.deepEqual(twist,[.2,0,0,0,0,0]);
});

test('failure after progressing internally returns an atomic unchanged configuration', () => {
  const model=rail(); model.joints[0].upper=.001;
  const result=integrateJogVelocity(model,[0],[.1,0,0,0,0,0],{dt:.1,velocityLimits:[.2]});
  assert.notEqual(result.status,'solved');
  assert.ok(result.failedAtTime>0);
  assert.deepEqual(result.nextQ,[0]); assert.deepEqual(result.samples,[[0]]);
  assert.deepEqual(result.qdot,[0]); assert.equal(result.integratedTime,0);
});

test('tool-frame translation respects rotated base and retains orientation', () => {
  const model=rail(); model.worldFromBase=new T.Matrix4().makeRotationZ(Math.PI/2).elements;
  const result=integrateJogVelocity(model,[0],[.1,0,0,0,0,0],{frame:'tool',dt:.1,velocityLimits:[1]});
  assert.equal(result.status,'solved');
  const p=forwardKinematics(model,result.nextQ).position;
  assert.ok(Math.abs(p[0])<1e-8 && Math.abs(p[1]-.01)<1e-8);
});

test('world angular velocity composes on the left at a nonidentity TCP rotation', () => {
  const model=createRobotModel({joints:[joint(1,[0,0,1],[0,0,0],'continuous')],tipLink:'l1',
    toolTransform:new T.Matrix4().makeRotationX(.7)});
  const q=[.4], result=integrateJogVelocity(model,q,[0,0,0,0,0,.4],{dt:.25,velocityLimits:[1]});
  assert.equal(result.status,'solved');
  const a=forwardKinematics(model,q), b=forwardKinematics(model,result.nextQ);
  const expected=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),.1).multiply(new T.Quaternion(...a.quaternion));
  assert.ok(expected.angleTo(new T.Quaternion(...b.quaternion))<1e-6);
});

test('invalid initial joint state and malformed inputs never synthesize a recovery motion', () => {
  const model=rail();
  assert.equal(integrateJogVelocity(model,[2.000001],[0,0,0,0,0,0]).status,'invalid_target');
  assert.equal(integrateJogVelocity(model,[0],[0,0]).status,'invalid_target');
  assert.equal(integrateJogVelocity(model,[0],[0,0,0,0,0,0],{dt:0}).status,'invalid_target');
});
