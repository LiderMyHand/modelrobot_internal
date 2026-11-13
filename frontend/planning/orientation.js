import { Quaternion, Vector3 } from 'three';

const quaternion = values => new Quaternion(...values).normalize();
const vector = values => new Vector3(...values);

/** Shortest relative rotation, expressed as a rotation vector in a's body frame. */
export function relativeRotationVector(a, b) {
  const qa = quaternion(a), qb = quaternion(b);
  if (qa.dot(qb) < 0) qb.set(-qb.x, -qb.y, -qb.z, -qb.w);
  const delta = qa.clone().invert().multiply(qb).normalize();
  const imaginary = new Vector3(delta.x, delta.y, delta.z);
  const norm = imaginary.length();
  return norm < 1e-12 ? imaginary.multiplyScalar(2) : imaginary.multiplyScalar(2 * Math.atan2(norm, delta.w) / norm);
}

export function rotationVectorQuaternion(phi) {
  const theta = phi.length();
  if (theta < 1e-10) return new Quaternion(phi.x / 2, phi.y / 2, phi.z / 2, 1).normalize();
  return new Quaternion().setFromAxisAngle(phi.clone().divideScalar(theta), theta);
}

function rightJacobian(phi, value) {
  const theta = phi.length(), cross = new Vector3().crossVectors(phi, value);
  const twice = new Vector3().crossVectors(phi, cross);
  if (theta < 1e-6) return value.clone().addScaledVector(cross, -0.5).addScaledVector(twice, 1 / 6);
  return value.clone().addScaledVector(cross, -(1 - Math.cos(theta)) / theta ** 2)
    .addScaledVector(twice, (theta - Math.sin(theta)) / theta ** 3);
}

function inverseRightJacobian(phi, value) {
  const theta = phi.length(), cross = new Vector3().crossVectors(phi, value);
  const twice = new Vector3().crossVectors(phi, cross);
  const coefficient = theta < 1e-6 ? 1 / 12 + theta ** 2 / 720
    : 1 / theta ** 2 - 1 / (2 * theta * Math.tan(theta / 2));
  return value.clone().addScaledVector(cross, 0.5).addScaledVector(twice, coefficient);
}

/** C1 SO(3) splice with body angular derivatives measured per metre of path coordinate. */
export function orientationTransition(a, b, inboundBodyRate, outboundBodyRate, span) {
  if (!(Number.isFinite(span) && span > 0)) throw new Error('Orientation transition needs positive span.');
  const qa = quaternion(a), delta = relativeRotationVector(a, b);
  const startDerivative = vector(inboundBodyRate).multiplyScalar(span);
  const endDerivative = inverseRightJacobian(delta, vector(outboundBodyRate)).multiplyScalar(span);
  // Cubic Bézier representation of a Hermite rotation-vector curve.
  const controls = [new Vector3(), startDerivative.clone().divideScalar(3),
    delta.clone().addScaledVector(endDerivative, -1 / 3), delta.clone()];
  const derivatives = controls.slice(0, 3).map((control, i) => controls[i + 1].clone().sub(control).multiplyScalar(3));
  const rateBound = Math.max(...derivatives.map(value => value.length())) / span;
  const angleBound = controls.slice(0, 3).reduce((sum, control, i) => sum + controls[i + 1].distanceTo(control), 0);
  const phiAt = u => {
    const t = Math.max(0, Math.min(1, u)), v = 1 - t;
    return controls[0].clone().multiplyScalar(v ** 3)
      .addScaledVector(controls[1], 3 * v ** 2 * t)
      .addScaledVector(controls[2], 3 * v * t ** 2)
      .addScaledVector(controls[3], t ** 3);
  };
  const phiPrimeAt = u => {
    const t = Math.max(0, Math.min(1, u)), v = 1 - t;
    return derivatives[0].clone().multiplyScalar(v ** 2)
      .addScaledVector(derivatives[1], 2 * v * t)
      .addScaledVector(derivatives[2], t ** 2);
  };
  return {
    relativeAngle: delta.length(), angleBound, rateBound,
    at(u) { return qa.clone().multiply(rotationVectorQuaternion(phiAt(u))).normalize().toArray(); },
    bodyRateAt(u) { return rightJacobian(phiAt(u), phiPrimeAt(u)).divideScalar(span).toArray(); },
  };
}
