import { copyTimedJointSamples, timedJointStateAt } from './timed-joints.js';

/** Deterministic simulation-time playback of planned joint samples and scene events. */
export class ProgramPlayer {
  constructor({ sceneModel, applyJointState, onTime = () => {}, onState = () => {} }) {
    this.sceneModel = sceneModel; this.applyJointState = applyJointState;
    this.onTime = onTime; this.onState = onState;
    this.state = 'empty'; this.time = 0; this.eventCursor = 0; this.frame = null;
  }
  load({ samples, events = [] }) {
    if (!Array.isArray(samples) || !samples.length || samples[0].time !== 0 || !samples.every((sample, i) => Number.isFinite(sample.time) && sample.time >= 0 && Array.isArray(sample.q) && sample.q.every(Number.isFinite) && (i === 0 || sample.time > samples[i - 1].time) && sample.q.length === samples[0].q.length)) throw new Error('Playback needs strictly increasing timed joint samples from t=0.');
    if (!Array.isArray(events) || !events.every((event, i) => Number.isFinite(event.time) && event.time >= 0 && event.time <= samples.at(-1).time &&
      (['GRAB', 'RELEASE'].includes(event.kind) && typeof event.object === 'string' ||
        event.kind === 'WELD_JOIN' && typeof event.child === 'string' && typeof event.parent === 'string' && event.child !== event.parent && event.frame === `model/${event.parent}`) &&
      (i === 0 || event.time >= events[i - 1].time))) throw new Error('Playback events must be ordered grab, release, or weld-join commands within the timeline.');
    this.pause();
    if (this.samples) this.reset();
    this.samples = copyTimedJointSamples(samples);
    this.events = events.map(event => ({ ...event }));
    this.initialWorld = this.sceneModel.snapshotWorld();
    this.initialAttachments = this.sceneModel.attachmentRecords?.() || [];
    this.time = 0; this.eventCursor = 0; this.state = 'ready';
    this.applyJointState(this.samples[0].q); this.seek(0); this.state = 'ready'; this.onState(this.state);
  }
  qAt(time) {
    return timedJointStateAt(this.samples, time).q;
  }
  restoreStart() {
    this.sceneModel.loadWorld(this.initialWorld);
    this.applyJointState(this.samples[0].q);
    for (const attachment of this.initialAttachments) this.sceneModel.attach(attachment.object, attachment.frame, { keepWorldPose: true });
    this.eventCursor = 0; this.time = 0;
  }
  seek(time) {
    if (!this.samples) return;
    const clamped = Math.max(0, Math.min(this.samples.at(-1).time, time));
    if (clamped < this.time) this.restoreStart();
    while (this.eventCursor < this.events.length && this.events[this.eventCursor].time <= clamped) {
      const event = this.events[this.eventCursor++];
      this.applyJointState(this.qAt(event.time));
      if (event.kind === 'GRAB') this.sceneModel.attach(event.object, event.frame, { keepWorldPose: true });
      else if (event.kind === 'RELEASE') this.sceneModel.release(event.object);
      else this.sceneModel.attach(event.child, event.frame, { keepWorldPose: true });
    }
    this.applyJointState(this.qAt(clamped)); this.time = clamped;
    if (clamped >= this.samples.at(-1).time) { this.pause(); this.state = 'finished'; this.onState(this.state); }
    this.onTime(clamped);
  }
  play() {
    if (!this.samples) throw new Error('Plan a program before playback.');
    if (this.state === 'finished') this.reset();
    if (this.state === 'playing') return;
    this.state = 'playing'; this.onState(this.state);
    const startTime = performance.now() - this.time * 1000;
    const tick = now => {
      this.frame = null;
      try { this.seek((now - startTime) / 1000); }
      catch (error) { this.pause(); this.state = 'error'; this.onState(this.state, error); return; }
      if (this.state === 'playing') this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }
  pause() {
    if (this.frame != null) cancelAnimationFrame(this.frame);
    this.frame = null;
    if (this.state === 'playing') { this.state = 'paused'; this.onState(this.state); }
  }
  step() {
    if (!this.samples) throw new Error('Plan a program before playback.');
    this.pause();
    const next = this.samples.find(sample => sample.time > this.time + 1e-9);
    if (next) this.seek(next.time); else this.seek(this.samples.at(-1).time);
  }
  reset() {
    if (!this.samples) return;
    this.pause(); this.restoreStart(); this.seek(0); this.state = 'ready'; this.onState(this.state);
  }
}
