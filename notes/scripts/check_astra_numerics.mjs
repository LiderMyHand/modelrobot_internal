// Independent review probe: no application state or application source changes.
import { Matrix4, Quaternion } from 'three';
import { createRobotModel, forwardKinematics } from '../../frontend/planning/robot-model.js';
import { solveVelocity } from '../../frontend/planning/velocity-ik.js';
import { writeFileSync } from 'node:fs';
const joint = (i, axis, xyz) => ({ name: `j${i}`, parent: i === 1 ? 'base' : `l${i-1}`,
  child: `l${i}`, type: 'revolute', axis, basicMatrix: new Matrix4().makeTranslation(...xyz),
  lower: -2, upper: 2, theta: 0 });
const model = createRobotModel({ joints: [
  joint(1,[0,0,1],[0,0,0]), joint(2,[0,1,0],[0,0,.3]),
  joint(3,[0,1,0],[.35,0,0]), joint(4,[1,0,0],[.3,0,0]),
  joint(5,[0,1,0],[.2,0,0]), joint(6,[1,0,0],[0,0,.12])],
  tipLink: 'l6', toolTransform: new Matrix4().makeTranslation(.12,0,0) });
let seed = 940170, worst = null, solved = 0;
const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2**32);
for (let sample = 0; sample < 1200; sample++) {
  const q = Array.from({length:6}, () => 2.8 * (random()-.5));
  const axis = sample % 3, twist = Array(6).fill(0); twist[axis] = .2;
  const result = solveVelocity(model,q,twist,{ dt:.25, velocityLimits:Array(6).fill(2) });
  if (result.status !== 'solved') continue;
  solved++;
  const a = forwardKinematics(model,q), b = forwardKinematics(model,result.nextQ);
  const error = Math.hypot(...b.position.map((v,i)=>v-a.position[i]-.25*twist[i]));
  const rotationError = new Quaternion(...a.quaternion).angleTo(new Quaternion(...b.quaternion));
  if (!worst || error > worst.positionError) worst = {q,axis,dt:.25,twist,qdot:result.qdot,
    localTranslationResidual:result.translationError,localAngularResidual:result.rotationError,
    positionError:error,rotationError,actualDisplacement:b.position.map((v,i)=>v-a.position[i]),health:result.health};
}
const one = createRobotModel({joints:[{...joint(1,[1,0,0],[0,0,0]),type:'prismatic', lower:0,upper:1}],tipLink:'l1'});
const nearBound = solveVelocity(one,[.9999],[.03,0,0,0,0,0],{dt:.1,velocityLimits:[.25]});
const outside = solveVelocity(one,[1.000001],[0,0,0,0,0,0],{dt:.1,velocityLimits:[.25]});
const report = {solved,worst,nearBound,outside};
writeFileSync(new URL('../artifacts/astra_numerics.json', import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
