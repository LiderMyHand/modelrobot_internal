const finiteVector = (values, length) => Array.isArray(values) && values.length === length && values.every(Number.isFinite);

/** Copy a timed path without discarding the derivatives used by browser replay. */
export function copyTimedJointSamples(samples) {
  if (!Array.isArray(samples) || !samples.length || samples[0]?.time !== 0 ||
      !finiteVector(samples[0]?.q, samples[0]?.q?.length) || !samples[0].q.length) {
    throw new Error('Timed joint samples must start at t=0 with a finite joint vector.');
  }
  const n = samples[0].q.length;
  const derivativeMode = samples[0].velocity != null || samples[0].acceleration != null;
  return samples.map((sample, index) => {
    if (!Number.isFinite(sample.time) || sample.time < 0 ||
        (index && sample.time <= samples[index - 1].time) || !finiteVector(sample.q, n)) {
      throw new Error('Timed joint samples need strictly increasing times and equal finite joint vectors.');
    }
    const hasVelocity = sample.velocity != null, hasAcceleration = sample.acceleration != null;
    if (hasVelocity !== hasAcceleration || hasVelocity !== derivativeMode || hasVelocity &&
        (!finiteVector(sample.velocity, n) || !finiteVector(sample.acceleration, n))) {
      throw new Error('Timed joint derivatives need one finite velocity and acceleration per joint.');
    }
    return { time: sample.time, q: [...sample.q],
      ...(hasVelocity ? { velocity: [...sample.velocity], acceleration: [...sample.acceleration] } : {}) };
  });
}

/** Evaluate a C2 quintic between two timed samples; legacy q-only paths remain linear. */
export function interpolateTimedJointSegment(a, b, time) {
  const h = b.time - a.time;
  if (!(h > 0) || !Number.isFinite(time)) throw new Error('Timed interpolation needs a finite time and increasing samples.');
  const u = Math.max(0, Math.min(1, (time - a.time) / h));
  const smooth = a.velocity && a.acceleration && b.velocity && b.acceleration;
  if (!smooth) return { q: a.q.map((value, j) => value + (b.q[j] - value) * u),
    velocity: a.q.map((value, j) => (b.q[j] - value) / h), acceleration: a.q.map(() => 0) };
  const q = [], velocity = [], acceleration = [];
  for (let j = 0; j < a.q.length; j++) {
    const c0 = a.q[j], c1 = a.velocity[j] * h, c2 = a.acceleration[j] * h * h / 2;
    const dq = b.q[j] - c0 - c1 - c2;
    const dv = b.velocity[j] * h - c1 - 2 * c2;
    const da = b.acceleration[j] * h * h - 2 * c2;
    const c3 = 10 * dq - 4 * dv + da / 2;
    const c4 = -15 * dq + 7 * dv - da;
    const c5 = 6 * dq - 3 * dv + da / 2;
    q.push(c0 + u * (c1 + u * (c2 + u * (c3 + u * (c4 + u * c5)))));
    velocity.push((c1 + u * (2 * c2 + u * (3 * c3 + u * (4 * c4 + u * 5 * c5)))) / h);
    acceleration.push((2 * c2 + u * (6 * c3 + u * (12 * c4 + u * 20 * c5))) / (h * h));
  }
  return { q, velocity, acceleration };
}

/** Look up a timed state with the same interpolation in all browser clocks. */
export function timedJointStateAt(samples, time) {
  if (!Number.isFinite(time)) throw new Error('Timed joint lookup needs a finite time.');
  if (time <= 0 || samples.length === 1) return { q: [...samples[0].q],
    velocity: [...(samples[0].velocity ?? samples[0].q.map(() => 0))],
    acceleration: [...(samples[0].acceleration ?? samples[0].q.map(() => 0))] };
  if (time >= samples.at(-1).time) {
    const last = samples.at(-1);
    return { q: [...last.q], velocity: [...(last.velocity ?? last.q.map(() => 0))],
      acceleration: [...(last.acceleration ?? last.q.map(() => 0))] };
  }
  let low = 0, high = samples.length - 1;
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    if (samples[mid].time <= time) low = mid; else high = mid;
  }
  return interpolateTimedJointSegment(samples[low], samples[high], time);
}
