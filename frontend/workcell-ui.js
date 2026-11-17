import { Box3, BufferGeometry, CurvePath, Float32BufferAttribute, Line, LineBasicMaterial, LineCurve3, Mesh, MeshBasicMaterial, Quaternion, TubeGeometry, Vector3 } from 'three';
import { SceneModel } from './scene-model.js';
import { parseSDF, serializeSDF } from './sdf.js';
import { axisAngleToQuaternion, compileProgram, quaternionToAxisAngle } from './program.js';
import { packProject, unpackProject } from './project-bundle.js';
import { planProgramInWorker } from './planning/worker-client.js';
import { ProgramPlayer } from './program-player.js';
import { createRobotModel, forwardKinematics } from './planning/robot-model.js';
import { createPlanningCollisionScene, createSceneDeviceCollisionQuery, parseURDFCollisionShapes } from './planning/collision-scene.js';
import { ProjectStore } from './project-store.js';
import { validateRobotStateForURDF } from './project-robot-state.js';
import { normalizeKinematicConstraints, validateFourBarProjectState } from './kinematic-constraints.js';
import { createFourBarModel, expandFourBar, fourBarPose } from './planning/four-bar.js';
import { jacobianHealth } from './planning/velocity-ik.js';
import { integrateJogVelocity } from './planning/jog-integration.js';
import { resolveMotionLimits } from './motion-limits.js';
import { readExampleText } from './example-text.js';
import { compileMultiProgram } from './multi-program-language.js';
import { createMultiProgramState, stepMultiProgram } from './multi-program-scheduler.js';
import { applySceneDevices, captureSceneDevices } from './device-motion.js';
import { advanceSharedClockTo, createSharedClock, stepSharedClock } from './shared-clock.js';
import { acceptRobotPlan, createTriggeredClock, rejectRobotPlan, stepTriggeredClock, syncTriggeredDevices } from './triggered-clock.js';

const emptyWorld = '<sdf version="1.10">\n  <world name="workcell"/>\n</sdf>\n';

export class WorkcellUI {
  constructor(app) { this.app = app; this.activeRobotName = null; this.pendingRobotMount = null; this.kinematicConstraints = null; this.closedLoopModel = null; this.includeFiles = new Map(); this.motionLimits = {}; this.sceneIntegrityIssues = []; this.plan = null; this.signalState = null; this.signalInitialDevices = null; this.signalEvents = []; this.sharedClock = null; this.sharedFrame = null; this.triggerClock = null; this.triggerFrame = null; this.triggerGeneration = 0; this.projectStore = new ProjectStore(); }

  init() {
    this.sceneModel = new SceneModel({ scene: window.scene, meshGeometry: uri => this.app.localRobots.meshGeometry(uri) });
    const byId = id => document.getElementById(id);
    const collisionLabel = byId('collision-enabled').closest('label');
    collisionLabel.lastChild.textContent = ' Show collision warnings';
    collisionLabel.title = 'Displays approximate URDF self-collision warnings. Path planning and pendant jogging always check robot and scene collision geometry.';
    this.sdfSource = byId('sdf-source'); this.sdfSource.value = emptyWorld;
    this.programSource = byId('program-source');
    byId('lesson-return').textContent = 'Reset to teaching start';
    byId('lesson-steps').lastElementChild.querySelector('b').textContent = 'Reset to teaching start';
    byId('lesson-return').title = 'Instantly restores the lesson joint pose; this is a reset, not a planned robot move.';
    const startButton = document.createElement('button'); startButton.type = 'button'; startButton.id = 'start-programming'; startButton.textContent = 'Start programming';
    byId('open-files').after(startButton);
    startButton.onclick = () => { this.app.workspace.select('program'); byId('program-learning').open = true; byId('program-learning').scrollIntoView({ block: 'start' }); };
    byId('lesson-teach').onclick = () => this.loadTeachingLesson().catch(error => this.programStatus(error.message, true));
    byId('lesson-demo').onclick = async () => { try { if (!await this.loadDemo()) return; this.app.workspace.select('program'); byId('program-learning').open = false; this.programStatus('Example ready. Plan path, then Play. Inspect MOVEJ, MOVEC, MOVEL and GRAB/RELEASE in the source.'); } catch (error) { this.programStatus(error.message, true); } };
    byId('lesson-return').onclick = () => { if (!this.teachingStart) return; this.invalidatePlan({ restoreStart: false }); this.applyNamedJointState(this.teachingStart.names, this.teachingStart.q); this.programStatus('Returned to the teaching start. Plan path to preview A → B from this displayed pose.'); };
    byId('lesson-singularity').onclick = () => {
      if (!this.teachingStart) return;
      this.invalidatePlan({ restoreStart: false });
      this.applyNamedJointState(this.teachingStart.names, [0,0,0,0,0,0]);
      byId('pendant-frame').value = 'world'; this.updatePendantMode();
      this.programStatus('Straight-posture exercise: try World +X and observe the blocked direction. Joint mode can bend the arm; Reset to teaching start restores the lesson pose.');
    };
    byId('pendant-recover-joint').onclick = () => { byId('pendant-frame').value = 'joint'; this.updatePendantMode(); };
    this.signalProgramSource = byId('signal-program-source');
    this.signalProgramSource.addEventListener('input', () => { this.stopSharedRun('Concurrent source changed. Prepare a new shared run.'); this.stopTriggeredRun('Concurrent source changed. Prepare a new triggered run.'); this.signalState = null; this.signalInitialDevices = null; this.signalEvents = []; this.signalCompileDiagnostics = []; this.renderSignalRun('Program source changed. Check or run to begin from the current scene.'); });
    byId('signal-example').onclick = async () => {
      try {
        this.stopSharedRun('Concurrent example changed. Prepare a new shared run.');
        this.stopTriggeredRun('Concurrent example changed. Prepare a new triggered run.');
        this.signalProgramSource.value = await readExampleText('testowe/multi_program/handshake.mprg');
        this.signalState = null; this.signalInitialDevices = null; this.signalEvents = []; this.signalCompileDiagnostics = [];
        this.renderSignalRun('Handshake example loaded. Step or run to inspect it.');
      } catch (error) { this.signalCompileDiagnostics = [{ message: error.message }]; this.renderSignalRun('Cannot load the handshake example.'); }
    };
    byId('signal-device-example').onclick = async () => {
      try {
        if (!this.app.workspace.canReplaceDraft()) return;
        this.stopSharedRun('Conveyor scene changed. Prepare a new shared run.');
        this.stopTriggeredRun('Conveyor scene changed. Prepare a new triggered run.');
        const files = await Promise.all(['conveyor.sdf', 'conveyor.mprg']
          .map(name => readExampleText(`testowe/multi_program/${name}`)));
        this.sdfSource.value = files[0]; this.applySDF();
        this.signalProgramSource.value = files[1];
        this.signalState = null; this.signalInitialDevices = null; this.signalEvents = []; this.signalCompileDiagnostics = [];
        this.renderSignalRun('Conveyor scene and program loaded. Step to see the tray move.');
      } catch (error) { this.signalCompileDiagnostics = [{ message: error.message }]; this.renderSignalRun('Cannot load the conveyor example.'); }
    };
    byId('signal-check').onclick = () => { this.leaveSharedForSignalLab(); this.stopTriggeredRun(); this.checkSignalPrograms(); };
    byId('signal-run').onclick = () => { this.leaveSharedForSignalLab(); this.stopTriggeredRun(); this.runSignalPrograms(); };
    byId('signal-step').onclick = () => { this.leaveSharedForSignalLab(); this.stopTriggeredRun(); this.stepSignalPrograms(); };
    byId('signal-reset').onclick = () => { this.leaveSharedForSignalLab(); this.stopTriggeredRun(); this.resetSignalPrograms(); };
    byId('shared-example').onclick = () => this.loadSharedExample().catch(error => this.sharedStatus(error.message, true));
    byId('shared-prepare').onclick = () => this.prepareSharedRun();
    byId('shared-step').onclick = () => this.stepSharedRun();
    byId('shared-play').onclick = () => this.playSharedRun();
    byId('shared-pause').onclick = () => this.pauseSharedRun();
    byId('shared-reset').onclick = () => this.resetSharedRun();
    byId('shared-tick-seconds').addEventListener('input', () => this.stopSharedRun('Tick duration changed. Prepare a new shared run.'));
    byId('trigger-example').onclick = () => this.loadTriggeredExample().catch(error => this.triggerStatus(error.message, true));
    byId('trigger-two-example').onclick = () => this.loadTriggeredExample({ robotFile: 'two_requests.robot',
      programFile: 'two_requests.mprg', message: 'Two-run example loaded. The tray moves between robot plans.' })
      .catch(error => this.triggerStatus(error.message, true));
    byId('trigger-prepare').onclick = () => this.prepareTriggeredRun();
    byId('trigger-step').onclick = () => this.stepTriggeredRun();
    byId('trigger-play').onclick = () => this.playTriggeredRun();
    byId('trigger-pause').onclick = () => this.pauseTriggeredRun();
    byId('trigger-reset').onclick = () => this.resetTriggeredRun();
    byId('trigger-tick-seconds').addEventListener('input', () => this.stopTriggeredRun('Tick duration changed. Prepare a new triggered run.'));
    byId('pose-target-current').onclick = () => { try { this.readCurrentTCP(); } catch (error) { this.programStatus(error.message, true); } };
    byId('pose-target-plan').onclick = () => { try { this.planPoseTarget(); } catch (error) { this.programStatus(error.message, true); } };
    byId('pose-target-link').onchange = () => { try { this.readCurrentTCP(); this.refreshPendantJointOptions(); } catch (error) { this.programStatus(error.message, true); } };
    byId('pose-target-frame').onchange = () => { try { this.readCurrentTCP(); } catch (error) { this.programStatus(error.message, true); } };
    const stopPendant = () => this.stopPendantHold();
    const bindPendantButton = (button, run) => {
      button.onpointerdown = event => {
        if (event.button !== 0 || !event.isPrimary) return;
        stopPendant();
        event.preventDefault(); button.setPointerCapture(event.pointerId);
        if (!run()) return;
        const repeatMs = Number(document.getElementById('pendant-step-seconds').value) * 1000;
        this.pendantHoldTimer = setTimeout(() => {
          this.pendantHoldInterval = setInterval(() => { if (!run()) stopPendant(); }, repeatMs);
        }, 320);
      };
      button.onpointerup = stopPendant;
      button.onpointercancel = stopPendant;
      button.onlostpointercapture = stopPendant;
      button.onclick = event => { if (event.detail === 0) run(); };
    };
    for (const button of document.querySelectorAll('[data-pendant-axis]')) bindPendantButton(button, () => {
      const axis = Number(button.dataset.pendantAxis), sign = Number(button.dataset.pendantSign);
      return byId('pendant-frame').value === 'joint' ? this.jogPendantJoint(sign, axis) : this.jogPendant(axis, sign);
    });
    byId('pendant-frame').onchange = () => this.updatePendantMode();
    byId('pendant-axis-prev').onclick = () => { this.pendantAxisOffset = Math.max(0, (this.pendantAxisOffset || 0) - 6); this.updatePendantMode(); };
    byId('pendant-axis-next').onclick = () => { this.pendantAxisOffset = (this.pendantAxisOffset || 0) + 6; this.updatePendantMode(); };
    byId('pendant-coord').onclick = () => {
      const modes = ['joint', 'world', 'tool'], select = byId('pendant-frame');
      select.value = modes[(modes.indexOf(select.value) + 1) % modes.length];
      this.updatePendantMode();
    };
    this.updatePendantMode(); this.initPendantPanel();
    window.addEventListener('blur', stopPendant);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopPendant(); });
    byId('pendant-teach-pose').onclick = () => { try { this.teachPendantTarget('pose'); } catch (error) { this.pendantStatus(error.message, true); } };
    byId('pendant-teach-joints').onclick = () => { try { this.teachPendantTarget('joints'); } catch (error) { this.pendantStatus(error.message, true); } };
    const teachRow = byId('pendant-teach-joints').closest('.button-row');
    teachRow.prepend(byId('pendant-teach-joints'));
    byId('pendant-frame').parentElement.previousElementSibling.before(teachRow);
    byId('teach-pendant').querySelector('p').textContent = 'Click for one step; hold to repeat. Joint limits and scene collisions are checked.';
    byId('teach-pendant').querySelector(':scope > small').textContent = 'Teach adds a MOVEJ target to the source. Replan after manual movement.';
    byId('pendant-status').after(byId('pendant-condition'));
    this.poseOrientationKind = byId('pose-target-orientation').value;
    byId('pose-target-orientation').onchange = event => {
      const next = event.target.value;
      try {
        const values = this.poseOrientationValues();
        const converted = next === 'AA' ? quaternionToAxisAngle(values) : axisAngleToQuaternion(values.slice(0, 3), values[3]);
        const array = next === 'AA' ? [...converted.axis, converted.angle] : converted;
        byId('pose-target-orientation-values').value = array.map(value => Number(value.toPrecision(10))).join(' ');
      } catch (error) {
        event.target.value = this.poseOrientationKind;
        this.programStatus(error.message, true);
        return;
      }
      this.poseOrientationKind = next;
    };
    this.player = new ProgramPlayer({ sceneModel: this.sceneModel, applyJointState: q => this.applyJointState(q),
      onTime: time => {
        const last = this.plan?.weld?.events?.filter(event => event.time <= time).at(-1);
        byId('program-time').textContent = `Time ${time.toFixed(2)} s${last?.kind === 'WELD_ON' ? ` · Welding ${last.object}` : ''}`;
        const attachments = JSON.stringify(this.sceneModel.attachmentRecords());
        if (attachments !== this.attachmentSummary) { this.attachmentSummary = attachments; this.renderObjects(); }
        if (this.weldPreviews?.length && this.plan?.weld?.segments?.some((segment, index) =>
          this.weldPreviews[index]?.parent !== this.sceneModel.getObject(segment.object))) this.showWeldPreview(this.plan);
      },
      onState: (state, error) => {
        if (error) this.programStatus(error.message, true);
        else if (state === 'finished') this.programStatus('Playback finished.');
        else if (state === 'paused') this.programStatus(`Paused at ${this.player.time.toFixed(2)} s.`);
        else if (state === 'ready' && this.plan) this.programStatus('Ready at program start.');
        this.refreshLifecycle();
      } });
    this.programSource.addEventListener('input', () => { this.invalidatePlan({ restoreStart: false }); this.programStatus('Source changed. Displayed robot and scene preserved; plan again before playback.'); });
    document.addEventListener('pointerdown', event => {
      if (event.target.closest('#joint-controls, #robotcsv, #loadcsv, #playbutton, #nextbutton, #prevbutton, #pose-toggle')) this.player.pause();
    }, true);
    this.motionLimitsSource = byId('motion-limits-source');
    byId('sdf-file').onchange = async event => {
      try {
        const file = event.target.files?.[0]; if (!file) return;
        this.sdfSource.value = await file.text(); this.applySDF();
      } catch (error) { this.status(error.message, true); }
      finally { event.target.value = ''; }
    };
    byId('sdf-apply').onclick = () => { try { this.applySDF(); } catch (error) { this.status(error.message, true); } };
    byId('workcell-fit').onclick = () => this.fitWorkcell();
    byId('robot-base-frame').onchange = event => {
      try {
        if (!this.activeRobotName) throw new Error('Load a URDF robot before mounting its base.');
        this.invalidatePlan({ restoreStart: false });
        this.sceneModel.mountRobotBase(this.activeRobotName, event.target.value, { keepWorldPose: true });
        this.refreshRobotBaseFrames(); this.renderObjects(); this.fitWorkcell();
        this.status(`Robot base → ${event.target.value}.`);
      } catch (error) { this.refreshRobotBaseFrames(); this.status(error.message, true); }
    };
    byId('workcell-demo').onclick = () => this.loadDemo().catch(error => this.status(error.message, true));
    byId('workcell-weld-demo').onclick = () => this.loadDemo('weld', 'robot.urdf', 'Weld-path example loaded. Open Program, then choose Plan path.').catch(error => this.status(error.message, true));
    byId('workcell-weld-join-demo').onclick = () => this.loadDemo('weld', 'robot.urdf', 'Weld-and-join example loaded. Open Program, then choose Plan path.', 'join_program.txt').catch(error => this.status(error.message, true));
    byId('workcell-four-bar-demo').onclick = () => this.loadFourBarExample().catch(error => this.status(error.message, true));
    byId('program-check').onclick = () => this.checkProgram();
    byId('project-file').onchange = async event => {
      try { const file = event.target.files?.[0]; if (file) await this.openProject(await file.arrayBuffer()); }
      catch (error) { this.status(error.message, true); }
      finally { event.target.value = ''; }
    };
    byId('project-export').onclick = () => { try { this.saveProject(); } catch (error) { this.status(error.message, true); } };
    byId('project-save-local').onclick = () => this.saveLocalProject().catch(error => this.status(error.message, true));
    byId('project-open-local').onclick = () => this.openLocalProject().catch(error => this.status(error.message, true));
    byId('project-delete-local').onclick = () => this.deleteLocalProject().catch(error => this.status(error.message, true));
    byId('motion-limits-apply').onclick = () => {
      try {
        const settings = JSON.parse(this.motionLimitsSource.value);
        if (!settings || Array.isArray(settings) || typeof settings !== 'object') throw new Error('Motion limits must be a JSON object keyed by joint name.');
        for (const [name, limits] of Object.entries(settings)) {
          if (!limits || Array.isArray(limits) || typeof limits !== 'object' || !Object.keys(limits).every(key => ['velocity', 'acceleration'].includes(key)) || !Object.values(limits).every(value => Number.isFinite(value) && value > 0)) throw new Error(`Joint ${name} needs positive velocity/acceleration values.`);
        }
        this.motionLimits = settings; this.invalidatePlan(); this.status('Motion limit overrides applied.');
      } catch (error) { this.status(error.message, true); }
    };
    byId('program-plan').onclick = () => this.planCurrentProgram();
    byId('program-play').onclick = () => { this.stopSharedRun(); this.stopTriggeredRun(); this.app.animform.stop(); this.app.poseTool.finish(true); this.player.play(); };
    byId('program-pause').onclick = () => { this.stopSharedRun(); this.stopTriggeredRun(); this.player.pause(); };
    byId('program-step').onclick = () => { this.stopSharedRun(); this.stopTriggeredRun(); this.app.animform.stop(); this.app.poseTool.finish(true); this.player.step(); };
    byId('program-reset').onclick = () => { this.stopSharedRun(); this.stopTriggeredRun(); this.player.reset(); };
    byId('trajectory-export').onclick = () => this.downloadTrajectory();
    byId('process-export').onclick = () => this.downloadProcessTrajectory();
    for (const id of ['program-play', 'program-pause', 'program-step', 'program-reset', 'trajectory-export']) byId(id).disabled = true;
    this.applySDF();
    this.refreshProjects().catch(error => this.status(error.message, true));
    if (window.robot) this.onRobotLoaded(byId('robottext').value);
  }

  status(message, error = false) {
    const element = document.getElementById('workcell-status');
    element.textContent = message; element.classList.toggle('text-danger', error);
    this.refreshProgramContext();
  }
  refreshProgramContext() {
    const element = document.getElementById('program-robot-context');
    if (!element) return;
    const robot = this.activeRobotName || 'none';
    const world = this.sceneModel?.world?.name || 'none';
    const tool = this.programSource?.value.match(/^\s*TOOL\s+(\S+)/m)?.[1] || 'not set';
    element.textContent = `Robot: ${robot} · World: ${world} · Program TCP: ${tool}`;
  }
  programStatus(message, error = false) {
    const element = document.getElementById('program-status');
    element.textContent = message; element.classList.toggle('text-danger', error);
    this.refreshProgramContext();
    this.refreshLifecycle();
  }
  refreshLifecycle() {
    const element = document.getElementById('program-lifecycle');
    if (!element) return;
    const state = this.planningController ? 'Planning path…' : this.plan ?
      ({ playing: 'Playing planned path', paused: 'Paused — plan available', finished: 'Finished — Reset returns to start', ready: 'Ready to play' }[this.player?.state] || 'Planned path available') : 'No planned path — teach or edit, then Plan path';
    element.textContent = state;
    element.dataset.state = this.planningController ? 'planning' : this.plan ? this.player?.state || 'ready' : 'empty';
  }
  pendantStatus(message, error = false) {
    const element = document.getElementById('pendant-status');
    if (!element) return;
    element.textContent = message; element.classList.toggle('text-danger', error);
    this.programStatus(`${error ? 'Jog blocked: ' : ''}${message}`, error);
    document.getElementById('pendant-recover-joint').hidden = !error || document.getElementById('pendant-frame').value === 'joint';
  }
  stopPendantHold() {
    clearTimeout(this.pendantHoldTimer); clearInterval(this.pendantHoldInterval);
    this.pendantHoldTimer = null; this.pendantHoldInterval = null;
  }
  updatePendantMode() {
    this.stopPendantHold();
    const mode = document.getElementById('pendant-frame').value;
    document.getElementById('pendant-joint-controls').hidden = mode !== 'joint';
    document.getElementById('pendant-cartesian-controls').hidden = mode === 'joint';
    const labels = ['X', 'Y', 'Z', 'Rx', 'Ry', 'Rz'];
    const offset = this.pendantAxisOffset || 0, count = this.pendantJointNames?.length || 0;
    document.getElementById('pendant-axis-page').hidden = mode !== 'joint' || count <= 6;
    document.getElementById('pendant-axis-range').textContent = ` J${offset + 1}–J${Math.min(offset + 6, count)} of ${count} `;
    document.getElementById('pendant-axis-prev').disabled = offset === 0;
    document.getElementById('pendant-axis-next').disabled = offset + 6 >= count;
    for (let axis = 0; axis < 6; axis++) {
      const row = document.querySelector(`[data-pendant-row="${axis}"]`);
      const joint = this.pendantJointNames?.[axis + offset], label = mode === 'joint' ? `J${axis + offset + 1}` : labels[axis];
      row.querySelector('strong').textContent = mode === 'joint' ? `${label}${joint ? ` · ${joint}` : ' · unavailable'}` : label;
      for (const button of row.querySelectorAll('button')) {
        button.textContent = `${Number(button.dataset.pendantSign) < 0 ? '−' : '+'} ${label}`;
        button.setAttribute('aria-label', mode === 'joint' ? `${Number(button.dataset.pendantSign) < 0 ? 'Decrease' : 'Increase'} ${joint || label}` :
          `${Number(button.dataset.pendantSign) < 0 ? 'Negative' : 'Positive'} ${label} in ${mode} coordinates`);
        button.disabled = mode === 'joint' && !joint;
      }
    }
    this.pendantStatus(mode === 'joint' ? 'Joint mode: choose an axis and press − or +.' :
      `${mode === 'world' ? 'World' : 'Tool'} TCP mode: choose a translation or rotation axis.`);
  }
  refreshPendantJointOptions() {
    let names = [];
    if (this.closedLoopModel) names = [...this.closedLoopModel.jointNames];
    else if (this.activeRobotName && window.robotjointcollection) {
      const link = document.getElementById('pose-target-link').value;
      if (link) {
        window.robot.updateWorldMatrix(true, false);
        try { names = createRobotModel({ joints: window.robotjointcollection.models, tipLink: link,
          worldFromBase: window.robot.matrixWorld }).jointNames; }
        catch { names = []; }
      }
    }
    this.pendantJointNames = names; this.pendantAxisOffset = 0;
    this.updatePendantMode();
  }
  initPendantPanel() {
    const floating = document.getElementById('floating-pendant');
    const handle = document.getElementById('pendant-panel-handle');
    const panel = document.getElementById('teach-pendant');
    const home = document.getElementById('pendant-home');
    const detachButton = document.getElementById('pendant-detach');
    const showButton = document.getElementById('pendant-show');
    const constrain = () => {
      if (floating.hidden) return;
      const box = floating.getBoundingClientRect();
      const width = Math.min(box.width, innerWidth - 16), height = Math.min(box.height, innerHeight - 68);
      const left = Math.max(8, Math.min(box.left, innerWidth - width - 8));
      const top = Math.max(60, Math.min(box.top, innerHeight - height - 8));
      if (Math.abs(box.width - width) > 0.5) floating.style.width = width + 'px';
      if (Math.abs(box.height - height) > 0.5) floating.style.height = height + 'px';
      floating.style.left = left + 'px'; floating.style.top = top + 'px';
    };
    const dock = () => {
      this.stopPendantHold(); home.append(panel); floating.hidden = true;
      detachButton.hidden = false; showButton.hidden = true;
      document.getElementById('program-pendant-details').open = true;
      this.app.workspace.select('program'); detachButton.focus();
    };
    detachButton.onclick = () => {
      this.stopPendantHold();
      document.getElementById('floating-pendant-content').append(panel);
      floating.hidden = false; detachButton.hidden = true; showButton.hidden = false;
      constrain(); handle.focus({ preventScroll: true });
    };
    document.getElementById('pendant-dock').onclick = dock;
    showButton.onclick = () => handle.focus({ preventScroll: true });
    let drag = null;
    handle.onpointerdown = event => {
      if (event.button !== 0 || event.target.closest('button')) return;
      const box = floating.getBoundingClientRect();
      drag = { x: event.clientX, y: event.clientY, left: box.left, top: box.top };
      handle.setPointerCapture(event.pointerId); handle.classList.add('dragging'); event.preventDefault();
    };
    handle.onpointermove = event => {
      if (!drag || !handle.hasPointerCapture(event.pointerId)) return;
      floating.style.left = drag.left + event.clientX - drag.x + 'px';
      floating.style.top = drag.top + event.clientY - drag.y + 'px'; constrain();
    };
    handle.onpointerup = event => {
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      drag = null; handle.classList.remove('dragging');
    };
    handle.onpointercancel = () => { drag = null; handle.classList.remove('dragging'); };
    handle.onkeydown = event => {
      if (event.target.closest('button')) return;
      const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (!directions[event.key]) return;
      event.preventDefault();
      const box = floating.getBoundingClientRect(), step = event.shiftKey ? 48 : 16;
      floating.style.left = box.left + directions[event.key][0] * step + 'px';
      floating.style.top = box.top + directions[event.key][1] * step + 'px'; constrain();
    };
    new ResizeObserver(constrain).observe(floating);
    window.addEventListener('resize', constrain);
  }
  refreshPendantFeedback() {
    const element = document.getElementById('pendant-feedback');
    if (!element) return;
    const name = document.getElementById('pose-target-link')?.value;
    if (!this.activeRobotName || !name || !window.robotjointcollection) { element.textContent = 'No selected TCP.'; return; }
    const frameName = `robot/${this.activeRobotName}/link/${name}`;
    if (!this.sceneModel.frames.has(frameName)) { element.textContent = 'Select a TCP link for the loaded robot.'; return; }
    const frame = this.sceneModel.getFrame(frameName);
    frame.updateWorldMatrix(true, false);
    const xyz = frame.getWorldPosition(new Vector3()).toArray();
    const xyzw = frame.getWorldQuaternion(new Quaternion()).toArray();
    const joints = window.robotjointcollection.filter(joint => joint.type !== 'fixed' && !joint.mimic)
      .map(joint => `${joint.name}=${Number(joint.theta).toFixed(4)}`);
    element.textContent = `TCP ${name} world XYZ: ${xyz.map(value => value.toFixed(4)).join('  ')} m\n` +
      `TCP Q xyzw: ${xyzw.map(value => value.toFixed(4)).join('  ')}\n` +
      `Joints: ${joints.join('  ')}`;
    const condition = document.getElementById('pendant-condition');
    if (this.closedLoopModel) {
      condition.textContent = 'Constrained mechanism: use its independent input joint.'; condition.dataset.level = 'info';
      document.getElementById('program-condition').textContent = condition.textContent;
      document.getElementById('program-condition').dataset.level = 'info'; this.currentJacobianHealth = null; return;
    }
    try {
      const model = createRobotModel({ joints: window.robotjointcollection.models, tipLink: name, worldFromBase: window.robot.matrixWorld });
      const health = jacobianHealth(model, model.initial);
      this.currentJacobianHealth = health;
      condition.dataset.level = health.status === 'regular' ? 'info' : 'warning';
      condition.textContent = health.status === 'rank_deficient' ? `Cartesian motion restricted (rank ${health.rank}/${health.expectedRank}). Use Joint mode to change posture.` :
        health.status === 'near_singular' ? 'Near singular configuration: Cartesian jogging may need large joint rates. Reduce speed or change posture in Joint mode.' :
          health.taskLimited ? `${health.activeJoints} controlled axes: only compatible TCP directions are possible.` : 'Cartesian motion available at this pose.';
      const summary = document.getElementById('program-condition');
      summary.textContent = health.status === 'regular' ? (health.taskLimited ? `Jog TCP: ${health.activeJoints} controlled axes; limited task directions.` : 'Cartesian directions available; joint limits and collisions are checked per jog.') :
        health.status === 'near_singular' ? 'Near singular posture — reduce speed or change posture in Joint mode.' : 'Cartesian motion restricted at this posture — use Joint mode to change posture.';
      summary.dataset.level = condition.dataset.level;
    } catch (error) {
      condition.textContent = `TCP motion assessment unavailable: ${error.message}`; condition.dataset.level = 'warning';
      document.getElementById('program-condition').textContent = condition.textContent;
      document.getElementById('program-condition').dataset.level = 'warning'; this.currentJacobianHealth = null;
    }
  }
  sharedStatus(message, error = false) {
    const element = document.getElementById('shared-status');
    if (!element) return;
    element.textContent = message; element.classList.toggle('text-danger', error);
  }
  stopSharedRun(message = 'Shared run stopped. Prepare to start again.') {
    if (this.sharedFrame != null) cancelAnimationFrame(this.sharedFrame);
    this.sharedFrame = null;
    if (this.sharedClock) {
      this.sharedClock = null;
      this.signalState = null; this.signalInitialDevices = null; this.signalEvents = []; this.signalCompileDiagnostics = [];
      this.renderSignalRun('Shared run stopped. Check or run the concurrent source from the current scene.');
      this.sharedStatus(message);
    }
  }
  leaveSharedForSignalLab() {
    if (!this.sharedClock) return;
    this.stopSharedRun('Shared clock stopped. The signal lab starts a separate run from the current scene.');
    this.signalState = null; this.signalInitialDevices = null; this.signalEvents = []; this.signalCompileDiagnostics = [];
  }
  triggerStatus(message, error = false) {
    const element = document.getElementById('trigger-status');
    if (!element) return;
    element.textContent = message; element.classList.toggle('text-danger', error);
  }
  stopTriggeredRun(message = 'Triggered run stopped. Prepare to start again.') {
    if (this.triggerFrame != null) cancelAnimationFrame(this.triggerFrame);
    this.triggerFrame = null; this.triggerPlaying = false; this.triggerVisualTime = null;
    this.triggerPlanningController?.abort(); this.triggerPlanningController = null;
    this.triggerGeneration++;
    if (this.triggerClock) {
      this.triggerClock = null; this.triggerPlayer = null; this.triggerBaseline = null;
      this.signalState = null; this.signalInitialDevices = null; this.signalEvents = []; this.signalCompileDiagnostics = [];
      this.renderSignalRun('Triggered run stopped. Check or run the concurrent source from the current scene.');
      this.triggerStatus(message);
    }
  }
  invalidatePlan({ restoreStart = true } = {}) {
    this.stopSharedRun('Robot plan changed. Prepare a new shared run.');
    this.stopTriggeredRun('Robot or scene state changed. Prepare a new triggered run.');
    this.planningController?.abort(); this.planningController = null;
    const planButton = document.getElementById('program-plan'); if (planButton) planButton.disabled = false;
    if (restoreStart && this.player?.samples && this.plan) this.player.reset();
    this.player?.pause();
    if (this.player) { this.player.samples = null; this.player.events = []; this.player.state = 'empty'; this.player.model = null; }
    this.plan = null;
    document.getElementById('program-diagnostics').replaceChildren();
    document.getElementById('program-time').textContent = 'Time — no planned path';
    if (this.preview) { this.preview.parent?.remove(this.preview); this.preview.geometry.dispose(); this.preview.material.dispose(); this.preview = null; }
    this.disposeWeldPreviews();
    for (const id of ['program-play', 'program-pause', 'program-step', 'program-reset', 'trajectory-export', 'process-export']) document.getElementById(id).disabled = true;
    this.refreshLifecycle();
  }
  manualControlStarted() {
    this.stopTriggeredRun('Manual robot control changed the start state. Prepare a new triggered run.');
    if (!this.pendantFeedbackFrame) this.pendantFeedbackFrame = requestAnimationFrame(() => {
      this.pendantFeedbackFrame = null; this.refreshPendantFeedback();
    });
    if (!this.plan && !this.planningController) return;
    this.invalidatePlan({ restoreStart: false });
    this.programStatus('Manual robot control changed the start state. Plan the program again.');
  }
  readInclude(uri, files = this.includeFiles) {
    const key = uri.replace(/^(model|file|package):\/\//, '').replace(/^\.\//, '');
    const matches = [...files].filter(([name]) => name === key || name.endsWith('/' + key));
    if (matches.length !== 1) throw new Error(matches.length ? `Ambiguous bundled include ${uri}.` : `Missing bundled include ${uri}.`);
    return matches[0][1];
  }
  applySDF() {
    this.invalidatePlan();
    const result = parseSDF(this.sdfSource.value, { readInclude: uri => this.readInclude(uri) });
    const errors = result.diagnostics.filter(item => item.severity === 'error');
    if (errors.length) throw new Error(errors.map(item => `${item.path}: ${item.message}`).join(' | '));
    const mounted = this.sceneModel.robotMountRecord(this.activeRobotName);
    if (mounted) {
      const frames = new Set(result.world.models.flatMap(model => [
        `model/${model.name}`, ...model.links.map(link => `model/${model.name}/link/${link.name}`)]));
      if (!frames.has(mounted.frame)) this.sceneModel.unmountRobotBase(this.activeRobotName);
    }
    const assetIssues = this.sceneModel.loadWorld(result.world);
    this.signalState = null; this.signalInitialDevices = null; this.signalEvents = []; this.signalCompileDiagnostics = [];
    if (this.signalProgramSource) this.renderSignalRun('Scene changed. Check or run the program from its new poses.');
    const coverageIssues = result.world.models.flatMap(model => model.links
      .filter(link => link.visuals.length && !link.collisions.length)
      .map(link => ({ severity: 'error', code: 'MISSING_SCENE_COLLISION', message: `${model.name}/${link.name} is visible but has no collision geometry.` })));
    this.sceneIntegrityIssues = [...assetIssues, ...coverageIssues].filter(item => item.severity === 'error');
    this.refreshRobotBaseFrames(); this.renderObjects(); this.fitWorkcell();
    const issues = [...result.diagnostics, ...assetIssues, ...coverageIssues];
    this.status(`Loaded ${result.world.models.length} scene object(s)${issues.length ? `; ${issues.length} issue(s): ${issues.map(item => item.message).join(' | ')}` : '.'}`, this.sceneIntegrityIssues.length > 0);
    return result;
  }
  renderObjects() {
    const list = document.getElementById('workcell-objects'); list.replaceChildren();
    const attachments = new Map(this.sceneModel.attachmentRecords().map(item => [item.object, item.frame]));
    for (const name of this.sceneModel.models.keys()) {
      const item = document.createElement('li'); item.textContent = attachments.has(name) ? `${name} → ${attachments.get(name)}` : name; list.append(item);
    }
    const mount = this.sceneModel.robotMountRecord(this.activeRobotName);
    if (mount) { const item = document.createElement('li'); item.textContent = `${mount.robot} base → ${mount.frame}`; list.append(item); }
    this.attachmentSummary = JSON.stringify(this.sceneModel.attachmentRecords());
  }
  refreshRobotBaseFrames() {
    const select = document.getElementById('robot-base-frame');
    if (!select || !this.sceneModel) return;
    const selected = this.sceneModel.robotMountRecord(this.activeRobotName)?.frame ?? 'world';
    const frames = ['world', ...[...this.sceneModel.frames.keys()].filter(name => name.startsWith('model/'))];
    select.replaceChildren(...frames.map(frame => new Option(frame, frame)));
    select.value = frames.includes(selected) ? selected : 'world';
    select.disabled = !this.activeRobotName;
  }
  beforeRobotReparse() {
    if (!this.sceneModel || !this.activeRobotName) return;
    this.pendingRobotMount = this.sceneModel.robotMountRecord(this.activeRobotName);
    if (this.pendingRobotMount) this.sceneModel.unmountRobotBase(this.activeRobotName);
  }
  onRobotLoaded(urdf) {
    if (!this.sceneModel || !window.robot || !window.robotlinkcollection) return;
    this.invalidatePlan();
    this.teachingStart = null; this.pendantLastAttempt = null;
    document.getElementById('lesson-return').hidden = true;
    document.getElementById('lesson-singularity-exercise').hidden = true;
    document.getElementById('lesson-steps').hidden = true;
    document.getElementById('pendant-result').textContent = '';
    if (this.activeRobotName) this.sceneModel.removeRobot(this.activeRobotName);
    const name = new DOMParser().parseFromString(urdf, 'application/xml').documentElement.getAttribute('name') || 'robot';
    const links = new Map(window.robotlinkcollection.map(link => [link.get('name'), link.get('link')]));
    this.sceneModel.addRobot(name, window.robot, { links });
    this.activeRobotName = name;
    this.closedLoopModel = null;
    if (this.kinematicConstraints?.mechanisms?.[0]?.robot === name) {
      try {
        window.robot.updateWorldMatrix(true, false);
        this.closedLoopModel = createFourBarModel({ descriptor: this.kinematicConstraints,
          joints: window.robotjointcollection.models, worldFromBase: window.robot.matrixWorld,
          tipLink: this.kinematicConstraints.mechanisms[0].leftClosureLink });
        this.applyNamedJointState([this.closedLoopModel.jointNames[0]], this.closedLoopModel.initial);
        for (const name of this.closedLoopModel.expandedJointNames.slice(1)) {
          const controller = this.app.robotjointmanipall.jointsdict[name]?.controller;
          if (!controller) continue;
          controller.domElement.style.opacity = '0.6';
          controller.domElement.title = `Passive four-bar joint; drive ${this.closedLoopModel.jointNames[0]}.`;
          for (const input of controller.domElement.querySelectorAll('input')) input.disabled = true;
        }
      } catch (error) {
        this.lastClosedLoopError = error.message;
        this.closedLoopModel = null; this.kinematicConstraints = null;
        this.status(`Four-bar constraint could not be applied: ${error.message}`, true);
      }
    } else if (this.kinematicConstraints) this.kinematicConstraints = null;
    if (this.pendingRobotMount && this.sceneModel.frames.has(this.pendingRobotMount.frame)) {
      this.sceneModel.mountRobotBase(name, this.pendingRobotMount.frame,
        { keepWorldPose: false, localPose: this.pendingRobotMount.localPose });
    }
    this.pendingRobotMount = null;
    this.refreshRobotBaseFrames(); this.renderObjects();
    const select = document.getElementById('pose-target-link');
    select.replaceChildren(...[...links.keys()].map(link => new Option(link, link)));
    select.value = links.has('tcp_link') ? 'tcp_link' : [...links.keys()].at(-1) || '';
    if (select.value) this.readCurrentTCP();
    this.refreshPendantJointOptions();
    this.refreshPendantFeedback();
    if (name === 'pi_robot') this.programStatus('Pi robot is a viewer example with incomplete planning collision geometry. Open Workcell → pick-and-place example to plan and jog a robot.');
  }
  poseOrientationValues() {
    const text = document.getElementById('pose-target-orientation-values').value.trim();
    const values = text.split(/\s+/).map(Number);
    if (values.length !== 4 || !values.every(Number.isFinite)) throw new Error('Orientation needs four finite values.');
    return values;
  }
  readCurrentTCP() {
    this.player?.pause();
    const name = document.getElementById('pose-target-link').value;
    if (!this.activeRobotName || !name) throw new Error('Load a URDF robot and select a TCP link.');
    const targetFrame = document.getElementById('pose-target-frame').value;
    if (!['world', 'tool'].includes(targetFrame)) throw new Error(`Unknown target frame ${targetFrame}.`);
    const position = new Vector3(), quaternion = new Quaternion();
    if (targetFrame === 'world') {
      const frame = this.sceneModel.getFrame(`robot/${this.activeRobotName}/link/${name}`);
      frame.updateWorldMatrix(true, false);
      frame.getWorldPosition(position); frame.getWorldQuaternion(quaternion);
    }
    for (const [axis, value] of Object.entries({ x: position.x, y: position.y, z: position.z })) document.getElementById(`pose-target-${axis}`).value = Number(value.toPrecision(10));
    const kind = document.getElementById('pose-target-orientation').value;
    const aa = kind === 'AA' ? quaternionToAxisAngle(quaternion.toArray()) : null;
    const values = aa ? [...aa.axis, aa.angle] : quaternion.toArray();
    document.getElementById('pose-target-orientation-values').value = values.map(value => Number(value.toPrecision(10))).join(' ');
    this.poseOrientationKind = kind;
    this.programStatus(targetFrame === 'world' ? `Read current ${name} pose in world coordinates.` :
      `Tool offsets reset: enter a move relative to the current ${name} pose.`);
    this.refreshPendantFeedback();
  }
  planPoseTarget() {
    if (!this.activeRobotName) throw new Error('Load a URDF robot before planning a pose.');
    const link = document.getElementById('pose-target-link').value;
    if (!link) throw new Error('Select a TCP link.');
    const positions = ['x', 'y', 'z'].map(axis => document.getElementById(`pose-target-${axis}`).value.trim());
    if (!positions.every(value => value && Number.isFinite(Number(value)))) throw new Error('X, Y, and Z must be finite metres.');
    const values = this.poseOrientationValues();
    const kind = document.getElementById('pose-target-orientation').value;
    const targetFrame = document.getElementById('pose-target-frame').value;
    if (!['world', 'tool'].includes(targetFrame)) throw new Error(`Unknown target frame ${targetFrame}.`);
    const move = document.getElementById('pose-target-motion').value;
    this.programSource.value = `ROBOT ${this.activeRobotName}\nTOOL ${link}\nPOSE goal_pose ${targetFrame} ${positions.map(Number).join(' ')} ${kind} ${values.join(' ')}\n${move} goal_pose\n`;
    return this.planCurrentProgram({ preserveCurrentState: true });
  }
  checkPendantEdge(model, joints, q, nextQ, waypoints = [q, nextQ]) {
    const edges = waypoints.slice(1).map((end, i) => ({ start: waypoints[i], end,
      steps: Math.max(1, ...end.map((value, index) => Math.ceil(Math.abs(value - waypoints[i][index]) /
        (model.joints[model.active[index]].type === 'prismatic' ? 0.005 : 0.02)))) }));
    const steps = edges.reduce((sum, edge) => sum + edge.steps, 0);
    if (steps > 2000 || edges.some(edge => edge.steps > 100)) throw new Error('Jog step needs too many collision samples; reduce its speed or duration.');
    const scene = createPlanningCollisionScene({ robotName: this.activeRobotName, robotModel: model,
      allJoints: joints, robotCollisionShapes: parseURDFCollisionShapes(this.app.localRobots.currentXml),
      sceneModel: this.sceneModel, meshGeometry: uri => this.app.localRobots.meshGeometry(uri) });
    try {
      let checked = 0;
      for (const edge of edges) for (let sample = 0; sample <= edge.steps; sample++) {
        const at = edge.start.map((value, index) => value + (edge.end[index] - value) * sample / edge.steps);
        if (!scene.isStateValid(at)) throw new Error(`Jog blocked by a robot or scene collision at sample ${checked}/${steps}${scene.lastCollision ? ` (${scene.lastCollision.join(' ↔ ')})` : ''}.`);
        if (sample < edge.steps) checked++;
      }
    } finally { scene.dispose(); }
    return steps + 1;
  }
  jogPendant(axis, sign) {
    try {
      if (!Number.isInteger(axis) || axis < 0 || axis > 5 || ![-1, 1].includes(sign)) throw new Error('Choose one Cartesian jog direction.');
      if (!this.activeRobotName || !window.robot || !window.robotjointcollection) throw new Error('Load a URDF robot before jogging.');
      if (this.closedLoopModel) throw new Error('Cartesian velocity jogging is available for serial robots; use the four-bar input slider.');
      if (this.sharedClock || this.triggerClock || this.planningController) throw new Error('Stop the shared run or current planning request before jogging.');
      if (this.sceneIntegrityIssues.length || this.app.collisions.issues.length) throw new Error('Complete collision geometry is required before jogging.');
      const link = document.getElementById('pose-target-link').value;
      if (!link) throw new Error('Select a TCP link before jogging.');
      const frame = document.getElementById('pendant-frame').value;
      if (!['world', 'tool'].includes(frame)) throw new Error('Choose world or tool jog coordinates.');
      const linear = Number(document.getElementById('pendant-linear-speed').value);
      const angular = Number(document.getElementById('pendant-angular-speed').value);
      const dt = Number(document.getElementById('pendant-step-seconds').value);
      if (!(linear >= 0.001 && linear <= 0.2 && angular >= 0.01 && angular <= 1 && dt >= 0.02 && dt <= 0.25))
        throw new Error('Linear speed must be 0.001–0.2 m/s, angular speed 0.01–1 rad/s, and step 0.02–0.25 s.');
      this.player.pause(); this.app.animform.stop(); this.app.poseTool.finish(true);
      window.robot.updateWorldMatrix(true, false);
      const joints = window.robotjointcollection.models;
      const model = createRobotModel({ joints, tipLink: link, worldFromBase: window.robot.matrixWorld });
      const q = [...model.initial], limits = resolveMotionLimits(model, joints, this.motionLimits);
      const twist = Array(6).fill(0); twist[axis] = sign * (axis < 3 ? linear : angular);
      const result = integrateJogVelocity(model, q, twist, { frame, velocityLimits: limits.velocity, dt });
      this.pendantLastAttempt = { axis, sign, frame, requested: twist, ...result };
      document.getElementById('pendant-result').textContent = `Last ${frame} velocity request: ${result.status}\n` +
        `Requested [m/s, rad/s]: ${twist.map(value => value.toFixed(4)).join(' ')}\n` +
        `Speed scale: minimum ${Math.round((result.speedScale ?? 1) * 100)}%, mean ${Math.round((result.averageSpeedScale ?? result.speedScale ?? 1) * 100)}%\n` +
        `Achieved: ${(result.achieved || []).map(value => value.toFixed(4)).join(' ')}\n` +
        `Residual: ${result.translationError?.toExponential(2) ?? 'unknown'} m/s, ${result.rotationError?.toExponential(2) ?? 'unknown'} rad/s\n` +
        (result.limitedJoints?.length ? `Limited joints: ${result.limitedJoints.join(', ')}\n` : '') +
        (result.status === 'solved' ? 'Velocity solution found; collision checks follow.' : 'Robot unchanged. Switch to Joint mode to change posture; reduce speed if a joint rate limit was reached.');
      if (result.status !== 'solved') throw new Error(`${result.reason || `Velocity IK could not produce the requested jog (${result.status}).`} Robot unchanged.`);
      const collisionSamples = this.checkPendantEdge(model, joints, q, result.nextQ, result.samples);
      this.invalidatePlan({ restoreStart: false });
      try { this.applyNamedJointState(model.jointNames, result.nextQ); }
      catch (error) { this.applyNamedJointState(model.jointNames, q); throw error; }
      const pose = forwardKinematics(model, result.nextQ);
      this.pendantLastJog = { axis, sign, frame, requested: twist, qdot: result.qdot,
        achieved: result.achieved, residual: result.residual, q: result.nextQ, pose, collisionSamples,
        speedScale: result.speedScale, averageSpeedScale: result.averageSpeedScale,
        integrationSteps: result.samples.length - 1, maximumPositionError: result.maximumPositionError,
        maximumOrientationError: result.maximumOrientationError };
      this.pendantJogCount = (this.pendantJogCount || 0) + 1;
      const direction = ['X', 'Y', 'Z', 'Rx', 'Ry', 'Rz'][axis];
      this.pendantStatus(`${frame === 'world' ? 'World' : 'Tool'} ${sign > 0 ? '+' : '−'}${direction} jog applied. ` +
        (result.speedScale < 1 ? `Automatically slowed as low as ${Math.round(result.speedScale * 100)}% to respect joint limits${result.limitedJoints?.length ? ` (${result.limitedJoints.join(', ')})` : ''}. ` : '') +
        'Replan the movement program before playback.');
      this.programStatus('Manual Cartesian jog changed the robot pose. Plan the program again.');
      return true;
    } catch (error) {
      const message = `${error.message}${/unchanged/i.test(error.message) ? '' : ' Robot unchanged.'}`;
      if (this.pendantLastAttempt) document.getElementById('pendant-result').textContent += `\nJog not applied: ${message}`;
      this.pendantStatus(message + (/collision/i.test(message) ? ` Inspect the scene before retrying.${this.teachingStart ? ' Return to teaching start restores the lesson posture.' : ''}` : ''), true);
      return false;
    }
  }
  jogPendantJoint(sign, axis) {
    try {
      if (![-1, 1].includes(sign) || !Number.isInteger(axis) || axis < 0 || axis > 5) throw new Error('Choose a joint jog direction.');
      if (!this.activeRobotName || !window.robot || !window.robotjointcollection) throw new Error('Load a URDF robot before jogging.');
      if (this.closedLoopModel) throw new Error('Use the four-bar input slider for this constrained mechanism.');
      if (this.sharedClock || this.triggerClock || this.planningController) throw new Error('Stop the shared run or current planning request before jogging.');
      if (this.sceneIntegrityIssues.length || this.app.collisions.issues.length) throw new Error('Complete collision geometry is required before jogging.');
      const link = document.getElementById('pose-target-link').value;
      const selected = this.pendantJointNames?.[axis + (this.pendantAxisOffset || 0)];
      const fraction = Number(document.getElementById('pendant-joint-speed').value) / 100;
      const dt = Number(document.getElementById('pendant-step-seconds').value);
      if (!(fraction >= 0.01 && fraction <= 1 && dt >= 0.02 && dt <= 0.25))
        throw new Error('Joint speed must be 1–100% of its limit, and step duration 0.02–0.25 s.');
      this.player.pause(); this.app.animform.stop(); this.app.poseTool.finish(true);
      window.robot.updateWorldMatrix(true, false);
      const joints = window.robotjointcollection.models;
      const model = createRobotModel({ joints, tipLink: link, worldFromBase: window.robot.matrixWorld });
      const index = model.jointNames.indexOf(selected);
      if (index < 0) throw new Error('Choose a movable joint in the selected TCP chain.');
      const q = [...model.initial], limits = resolveMotionLimits(model, joints, this.motionLimits);
      const joint = model.joints[model.active[index]], nextQ = [...q];
      const rate = Math.min(limits.velocity[index] * fraction, joint.type === 'prismatic' ? 0.05 : 0.3);
      nextQ[index] += sign * rate * dt;
      if (joint.type !== 'continuous') nextQ[index] = Math.max(joint.lower, Math.min(joint.upper, nextQ[index]));
      if (Math.abs(nextQ[index] - q[index]) < 1e-12) throw new Error(`Joint ${selected} is at its ${sign > 0 ? 'upper' : 'lower'} position limit. Jog the opposite direction.`);
      const collisionSamples = this.checkPendantEdge(model, joints, q, nextQ);
      this.invalidatePlan({ restoreStart: false });
      try { this.applyNamedJointState(model.jointNames, nextQ); }
      catch (error) { this.applyNamedJointState(model.jointNames, q); throw error; }
      this.pendantLastJog = { mode: 'joint', joint: selected, sign, q: nextQ,
        qdot: q.map((_, i) => i === index ? (nextQ[index] - q[index]) / dt : 0),
        pose: forwardKinematics(model, nextQ), collisionSamples };
      this.pendantJogCount = (this.pendantJogCount || 0) + 1;
      this.pendantStatus(`Joint ${selected} ${sign > 0 ? '+' : '−'} jog applied: ${rate.toFixed(3)} ${joint.type === 'prismatic' ? 'm/s' : 'rad/s'}, step ${Math.abs(nextQ[index] - q[index]).toFixed(4)} ${joint.type === 'prismatic' ? 'm' : 'rad'}. Replan before playback.`);
      this.programStatus('Manual joint jog changed the robot pose. Plan the program again.');
      return true;
    } catch (error) { this.pendantStatus(error.message, true); return false; }
  }
  teachPendantTarget(kind) {
    if (!this.activeRobotName || !window.robotjointcollection || !['pose', 'joints'].includes(kind))
      throw new Error('Load a robot before teaching a target.');
    if (this.closedLoopModel) throw new Error('Use the four-bar input joint target for this constrained mechanism.');
    const link = document.getElementById('pose-target-link').value;
    if (!link) throw new Error('Select a TCP link before teaching a target.');
    const source = this.programSource.value.trim(), compiled = compileProgram(source);
    if (!compiled.ok) throw new Error('Correct the movement program before appending a taught target.');
    const robotSteps = compiled.steps.filter(step => step.kind === 'ROBOT');
    const toolSteps = compiled.steps.filter(step => step.kind === 'TOOL');
    if (robotSteps.some(step => step.args[0] !== this.activeRobotName) ||
        toolSteps.some(step => step.args[0] !== link))
      throw new Error('The movement program selects another robot or TCP link; choose its link or start a new program.');
    let index = 1, name;
    do { name = `taught_${kind}_${index++}`; } while (compiled.poses.has(name) || compiled.joints.has(name));
    const lines = [];
    if (!robotSteps.length) lines.push(`ROBOT ${this.activeRobotName}`);
    if (!toolSteps.length) lines.push(`TOOL ${link}`);
    if (kind === 'pose') {
      const frame = this.sceneModel.getFrame(`robot/${this.activeRobotName}/link/${link}`);
      frame.updateWorldMatrix(true, false);
      const position = frame.getWorldPosition(new Vector3()).toArray();
      const quaternion = frame.getWorldQuaternion(new Quaternion()).toArray();
      lines.push(`POSE ${name} world ${position.join(' ')} Q ${quaternion.join(' ')}`);
    } else {
      window.robot.updateWorldMatrix(true, false);
      const model = createRobotModel({ joints: window.robotjointcollection.models, tipLink: link,
        worldFromBase: window.robot.matrixWorld });
      lines.push(`JOINTS ${name} ${model.jointNames.map((joint, i) => `${joint}=${model.initial[i]}`).join(' ')}`);
    }
    lines.push(`MOVEJ ${name}`);
    this.invalidatePlan({ restoreStart: false });
    this.programSource.value = `${source ? `${source}\n` : ''}${lines.join('\n')}\n`;
    this.pendantStatus(`Taught ${name} at the displayed robot pose. Plan the edited program to replay it.`);
    this.programStatus(`Appended ${name} and MOVEJ to the program. Plan to preview the sequence.`);
    return name;
  }
  applyJointState(q) {
    const names = this.plan?.model.jointNames || this.player?.model?.jointNames;
    return this.applyNamedJointState(names, q);
  }
  applyNamedJointState(names, q) {
    if (this.closedLoopModel && Array.isArray(names) && Array.isArray(q)) {
      const driver = this.closedLoopModel.jointNames[0];
      const index = names.indexOf(driver);
      if (index < 0 || (names.length !== 1 &&
          (names.length !== this.closedLoopModel.expandedJointNames.length ||
            names.some(name => !this.closedLoopModel.expandedJointNames.includes(name)))))
        throw new Error(`Four-bar state must include the independent joint ${driver}.`);
      const closed = expandFourBar(this.closedLoopModel, q[index]);
      if (closed.status !== 'expanded') throw new Error(closed.reason || `Four-bar closure failed: ${closed.status}.`);
      names = this.closedLoopModel.expandedJointNames;
      q = closed.q;
    }
    if (!names || q.length !== names.length) throw new Error('Playback joint model is unavailable.');
    for (let index = 0; index < names.length; index++) {
      const joint = window.robotjointcollection.findWhere({ name: names[index] });
      if (!joint || !joint.movejoint(q[index]) || Math.abs(joint.theta - q[index]) > 1e-7) throw new Error(`Robot rejected planned value for ${names[index]}.`);
      this.app.robotjointmanipall.jointsdict[names[index]]?.jointval();
    }
    window.robot.updateMatrixWorld(true);
    this.refreshPendantFeedback();
  }
  applyManualJoint(name, value) {
    if (!this.closedLoopModel) return false;
    if (name !== this.closedLoopModel.jointNames[0]) {
      this.programStatus(`${name} is passive; move ${this.closedLoopModel.jointNames[0]} to drive the closed loop.`);
      return true;
    }
    try { this.applyNamedJointState([name], [value]); }
    catch (error) { this.programStatus(error.message, true); }
    return true;
  }
  async planCurrentProgram({ preserveCurrentState = true } = {}) {
    this.invalidatePlan({ restoreStart: !preserveCurrentState });
    const compiled = this.checkProgram();
    if (!compiled.ok) return;
    const error = message => { this.programStatus(message, true); return; };
    if (!this.activeRobotName || !window.robot || !window.robotjointcollection) return error('Load a URDF robot before planning.');
    if (this.sceneIntegrityIssues.length) return error(`Scene assets are incomplete: ${this.sceneIntegrityIssues.map(item => item.message).join(' | ')}`);
    if (this.app.collisions.issues.length) return error(`Robot collision assets are incomplete: ${this.app.collisions.issues.join(' | ')}`);
    this.app.animform.stop(); this.app.poseTool.finish(true);
    const controller = new AbortController(); this.planningController = controller;
    document.getElementById('program-plan').disabled = true;
    this.programStatus('Planning in browser worker…');
    let result;
    try {
      result = await planProgramInWorker(compiled, { robotName: this.activeRobotName, robotRoot: window.robot,
        jointModels: window.robotjointcollection.models, robotXml: this.app.localRobots.currentXml,
        sceneModel: this.sceneModel, meshGeometry: uri => this.app.localRobots.meshGeometry(uri),
        motionLimits: this.motionLimits, kinematicConstraints: this.kinematicConstraints }, { signal: controller.signal });
    } catch (cause) { result = { status: 'error', diagnostics: [{ line: 1, code: 'WORKER', message: cause.message }] }; }
    if (this.planningController !== controller) return;
    this.planningController = null; document.getElementById('program-plan').disabled = false;
    if (result.status !== 'planned') {
      const list = document.getElementById('program-diagnostics'); list.replaceChildren();
      for (const item of result.diagnostics) { const row = document.createElement('li'); row.textContent = `Line ${item.line}: ${item.message}`; list.append(row); }
      return error(result.diagnostics.map(item => `Line ${item.line}: ${item.message}`).join(' | '));
    }
    this.plan = result;
    this.player.model = result.model;
    try { this.player.load(result); this.showPathPreview(result); }
    catch (cause) { this.invalidatePlan(); return error(cause.message); }
    for (const id of ['program-play', 'program-pause', 'program-step', 'program-reset', 'trajectory-export']) document.getElementById(id).disabled = false;
    document.getElementById('process-export').disabled = !result.weld?.segments?.length;
    this.programStatus(`Planned ${result.plans.length} move(s) over ${result.duration.toFixed(2)} s; ${result.samples.length} timed samples${result.zoneBlends?.length ? `; ${result.zoneBlends.length} PTP flyby corner(s)` : ''}${result.cartesianZoneBlends?.length ? `; ${result.cartesianZoneBlends.length} Cartesian flyby corner(s)` : ''}. Blue line shows the TCP path${result.weld?.segments?.length ? '; orange shows the weld seam.' : '.'}`);
  }
  showPathPreview(plan) {
    const positions = [];
    for (const sample of plan.samples) {
      const pose = plan.constrained ? fourBarPose(plan.model, sample.q[0]) : forwardKinematics(plan.model, sample.q);
      if (pose.status && pose.status !== 'expanded') throw new Error(pose.reason || pose.status);
      positions.push(...pose.position);
    }
    const geometry = new BufferGeometry(); geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    this.preview = new Line(geometry, new LineBasicMaterial({ color: 0x008bd2, transparent: true, opacity: 0.85 }));
    this.preview.name = 'planned-tcp-path'; window.scene.add(this.preview);
    this.showWeldPreview(plan);
  }
  disposeWeldPreviews() {
    for (const preview of this.weldPreviews || []) { preview.parent?.remove(preview); preview.geometry.dispose(); preview.material.dispose(); }
    this.weldPreviews = [];
  }
  showWeldPreview(plan) {
    this.disposeWeldPreviews();
    this.weldPreviews = (plan.weld?.segments || []).map((segment, index) => {
      const object = segment.object ? this.sceneModel.getObject(segment.object) : window.scene;
      object.updateWorldMatrix(true, false);
      const inverse = object.matrixWorld.clone().invert();
      const points = [];
      for (const sample of segment.samples) {
        const point = new Vector3(...sample.position).applyMatrix4(inverse);
        if (!points.length || point.distanceTo(points.at(-1)) > 1e-6) points.push(point);
      }
      if (points.length < 2) throw new Error(`Weld segment on line ${segment.line} has no visible length.`);
      const path = new CurvePath();
      for (let i = 1; i < points.length; i++) path.add(new LineCurve3(points[i - 1], points[i]));
      const seam = new Mesh(new TubeGeometry(path, Math.max(32, points.length), 0.003, 6, false),
        new MeshBasicMaterial({ color: 0xff7626, depthTest: false, depthWrite: false }));
      seam.renderOrder = 10; seam.name = `weld-seam-${index}`; object.add(seam); return seam;
    });
  }
  downloadTrajectory() {
    if (!this.plan) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(this.plan.trajectory, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'joint_trajectory.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  downloadProcessTrajectory() {
    if (!this.plan?.weld?.segments?.length) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(this.plan.processTrajectory, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'weld_path.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  fitWorkcell() {
    if (!this.sceneModel) return;
    const bounds = new Box3().setFromObject(this.sceneModel.layer);
    if (window.robot) bounds.union(new Box3().setFromObject(window.robot));
    if (bounds.isEmpty()) return;
    const camera = this.app.camera, controls = this.app.cameraControls;
    const center = bounds.getCenter(new Vector3());
    const direction = camera.position.clone().sub(controls.target).normalize();
    if (direction.lengthSq() < 0.01) direction.set(1, 1, 1).normalize();
    camera.position.copy(center).add(direction); camera.lookAt(center); camera.updateMatrixWorld();
    const inverseRotation = camera.quaternion.clone().invert();
    const verticalTan = Math.tan(camera.fov * Math.PI / 360), horizontalTan = verticalTan * camera.aspect;
    let distance = 0;
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      const corner = new Vector3(x, y, z).sub(center).applyQuaternion(inverseRotation);
      distance = Math.max(distance, corner.z + Math.max(Math.abs(corner.x) / horizontalTan, Math.abs(corner.y) / verticalTan));
    }
    distance = Math.max(distance * 1.25, 0.01 / (2 * verticalTan));
    controls.target.copy(center); camera.position.copy(center).addScaledVector(direction, distance);
    camera.near = Math.max(distance / 1000, 0.0001); camera.far = Math.max(distance * 100, 100);
    controls.minDistance = distance * 0.025; controls.maxDistance = distance * 50;
    camera.updateProjectionMatrix(); controls.update();
  }
  checkProgram() {
    const program = compileProgram(this.programSource.value);
    const list = document.getElementById('program-diagnostics'); list.replaceChildren();
    for (const item of program.diagnostics) {
      const row = document.createElement('li'); row.textContent = `Line ${item.line}: ${item.message}`; list.append(row);
    }
    this.programStatus(program.ok ? `Syntax valid: ${program.steps.length} command(s), ${program.poses.size + program.joints.size} target(s).` : `${program.diagnostics.length} program error(s).`, !program.ok);
    return program;
  }
  renderSignalRun(message = '') {
    const state = this.signalState;
    const status = document.getElementById('signal-status');
    const values = state ? Object.entries(state.signals).map(([name, value]) => `${name}=${value}`).join(', ') : '';
    const devices = state ? Object.entries(state.devices || {}).map(([name, position]) => `${name}=(${position.map(value => Number(value.toFixed(3))).join(', ')})`).join(', ') : '';
    status.textContent = message || (state ? `Tick ${state.tick} · ${state.status}${values ? ` · ${values}` : ''}${devices ? ` · ${devices}` : ''}` : 'Enter concurrent programs to begin.');
    status.classList.toggle('text-danger', Boolean(state && !['running', 'finished'].includes(state.status)) || Boolean(this.signalCompileDiagnostics?.length));
    const diagnostics = document.getElementById('signal-diagnostics'); diagnostics.replaceChildren();
    for (const item of [...(this.signalCompileDiagnostics || []), ...(state?.diagnostics || [])]) {
      const row = document.createElement('li'); row.textContent = `${item.line ? `Line ${item.line}: ` : ''}${item.message}`; diagnostics.append(row);
    }
    const trace = document.getElementById('signal-trace');
    const skipped = Math.max(0, this.signalEvents.length - 80);
    const lines = this.signalEvents.slice(skipped).map(event =>
      `Tick ${event.tick} · ${event.program} · ${event.kind} ${event.signal || event.model || ''}: ${event.outcome}${event.value != null ? ` ${event.value}` : ''}${event.observed != null ? ` (read ${event.observed})` : ''}`);
    trace.textContent = `${skipped ? `${skipped} earlier event(s) omitted\n` : ''}${lines.join('\n')}`;
  }
  /** Validate the complete synchronized device motion before committing a tick. */
  validateDeviceTransition(beforeDevices, afterDevices, events) {
    const moves = events.filter(event => event.kind === 'MOVE_MODEL' && event.outcome === 'move');
    if (!moves.length) return;
    if (this.sceneIntegrityIssues.length) throw new Error(`Scene collision assets are incomplete: ${this.sceneIntegrityIssues.map(item => item.message).join(' | ')}`);
    const robotCollisionShapes = this.activeRobotName && this.app.localRobots.currentXml
      ? parseURDFCollisionShapes(this.app.localRobots.currentXml) : [];
    const query = createSceneDeviceCollisionQuery({ sceneModel: this.sceneModel,
      robotName: this.activeRobotName, robotCollisionShapes,
      meshGeometry: uri => this.app.localRobots.meshGeometry(uri) });
    let result;
    try { result = query.checkSweep(beforeDevices, afterDevices); }
    finally { query.dispose(); }
    if (result.status === 'clear') return;
    const move = moves.find(event => event.model === result.model) || moves[0];
    const location = `${move.program}${move.line ? ` line ${move.line}` : ''}`;
    const error = new Error(result.status === 'collision'
      ? `${location}: MOVE_MODEL ${move.model} collides with ${result.other} at ${Math.round(result.fraction * 100)}% of this tick's motion.`
      : `Synchronized MOVE_MODEL tick cannot be checked: ${result.reason || result.status}.`);
    error.code = result.status === 'collision' ? 'DEVICE_COLLISION' : 'DEVICE_COLLISION_CHECK';
    if (result.status === 'collision') { error.line = move.line; error.program = move.program; error.model = move.model; }
    throw error;
  }
  checkSignalPrograms() {
    const compiled = compileMultiProgram(this.signalProgramSource.value);
    this.signalState = null; this.signalEvents = []; this.signalCompileDiagnostics = compiled.diagnostics;
    this.renderSignalRun(compiled.ok ? `Syntax valid: ${compiled.programs.length} program(s). Ready to step or run.` : `${compiled.diagnostics.length} signal program error(s).`);
    return compiled;
  }
  resetSignalPrograms() {
    const compiled = this.checkSignalPrograms();
    if (!compiled.ok) return null;
    try {
      if (compiled.programs.some(program => program.commands.some(command => command.kind === 'MOVE_MODEL'))) this.invalidatePlan({ restoreStart: false });
      if (!this.signalInitialDevices) this.signalInitialDevices = captureSceneDevices(this.sceneModel);
      this.signalState = createMultiProgramState({ programs: compiled.programs, devices: this.signalInitialDevices });
      applySceneDevices(this.sceneModel, this.signalState);
    }
    catch (error) { this.signalCompileDiagnostics = [{ message: error.message }]; this.renderSignalRun('Signal program setup failed.'); return null; }
    this.renderSignalRun();
    return this.signalState;
  }
  stepSignalPrograms() {
    if (!this.signalState && !this.resetSignalPrograms()) return;
    try { this.advanceSignalTick(); this.renderSignalRun(); }
    catch (error) { this.signalState = { ...this.signalState, status: 'error', diagnostics: [...this.signalState.diagnostics,
      { code: error.code || 'SIGNAL_UI', line: error.line, program: error.program, model: error.model, message: error.message }] }; this.renderSignalRun(); }
  }
  runSignalPrograms() {
    if (!this.signalState && !this.resetSignalPrograms()) return;
    try {
      let count = 0;
      while (this.signalState.status === 'running' && count < 1000) { this.advanceSignalTick(); count++; }
      if (this.signalState.status === 'running') {
        const issue = { code: 'RUN_LIMIT', tick: this.signalState.tick, message: 'Program run exceeded 1000 logical ticks.' };
        this.signalState = { ...this.signalState, status: 'limit', diagnostics: [...this.signalState.diagnostics, issue] };
      }
      this.renderSignalRun();
    } catch (error) { this.signalState = { ...this.signalState, status: 'error', diagnostics: [...this.signalState.diagnostics,
      { code: error.code || 'SIGNAL_UI', line: error.line, program: error.program, model: error.model, message: error.message }] }; this.renderSignalRun(); }
  }
  advanceSignalTick() {
    const result = stepMultiProgram(this.signalState);
    this.validateDeviceTransition(this.signalState.devices, result.state.devices, result.events);
    applySceneDevices(this.sceneModel, result.state);
    this.signalState = result.state; this.signalEvents.push(...result.events);
  }
  async loadSharedExample() {
    if (!this.app.workspace.canReplaceDraft()) return;
    const paths = ['testowe/workcell/arm.urdf', 'testowe/multi_program/conveyor.sdf',
      'testowe/multi_program/combined.robot', 'testowe/multi_program/combined.mprg'];
    const files = await Promise.all(paths.map(path => readExampleText(path)));
    this.stopSharedRun(); this.projectId = null; this.includeFiles.clear(); this.motionLimits = {};
    this.motionLimitsSource.value = '{}';
    this.app.localRobots.startDocument(); this.app.localRobots.clearAssets(); this.app.localRobots.showURDF(files[0]);
    this.sdfSource.value = files[1]; this.applySDF();
    this.programSource.value = files[2]; this.signalProgramSource.value = files[3];
    this.signalState = null; this.signalInitialDevices = null; this.signalEvents = []; this.signalCompileDiagnostics = [];
    this.renderSignalRun('Shared example loaded. The conveyor waits for robot_done.');
    this.app.workspace.select('program'); this.fitWorkcell();
    await this.planCurrentProgram();
    if (!this.plan) throw new Error('The example robot trajectory could not be planned.');
    this.prepareSharedRun();
  }
  prepareSharedRun() {
    try {
      if (!this.plan || !this.player.samples) throw new Error('Plan a robot movement program before preparing a shared run.');
      const tickSeconds = Number(document.getElementById('shared-tick-seconds').value);
      if (!Number.isFinite(tickSeconds) || tickSeconds < 0.01 || tickSeconds > 1)
        throw new Error('Seconds per tick must be from 0.01 through 1.');
      this.stopSharedRun(); this.app.animform.stop(); this.app.poseTool.finish(true);
      this.player.pause(); this.player.reset();
      const compiled = this.checkSignalPrograms();
      if (!compiled.ok) throw new Error('Correct the concurrent program errors before preparing a shared run.');
      this.signalInitialDevices = captureSceneDevices(this.sceneModel);
      const schedulerState = createMultiProgramState({ programs: compiled.programs, devices: this.signalInitialDevices });
      const maxTicks = Math.max(1000, Math.ceil(this.plan.duration / tickSeconds) + 1000);
      this.sharedClock = createSharedClock({ samples: this.plan.samples, robotEvents: this.plan.events,
        schedulerState, tickSeconds, maxTicks });
      this.signalState = this.sharedClock.schedulerState; this.signalEvents = [];
      this.renderSignalRun(); this.renderSharedRun();
      return this.sharedClock;
    } catch (error) { this.sharedStatus(error.message, true); return null; }
  }
  renderSharedRun() {
    if (!this.sharedClock) return;
    const clock = this.sharedClock;
    const issue = clock.diagnostics.at(-1);
    this.sharedStatus(`Time ${clock.timeSeconds.toFixed(2)} s · robot ${Math.min(clock.timeSeconds, clock.robotDuration).toFixed(2)}/${clock.robotDuration.toFixed(2)} s · tick ${clock.schedulerState.tick} · ${clock.status}${issue ? ` · ${issue.message}` : ''}`,
      !['running', 'finished'].includes(clock.status));
  }
  applySharedResult(result) {
    const next = result.state;
    const robotTime = Math.min(next.timeSeconds, next.robotDuration);
    if (this.player.time !== robotTime) this.player.seek(robotTime);
    const moved = [...new Set(result.events.filter(event => event.kind === 'MOVE_MODEL' && event.outcome === 'move').map(event => event.model))];
    if (moved.length) applySceneDevices(this.sceneModel, { devices: Object.fromEntries(moved.map(name => [name, next.schedulerState.devices[name]])) });
    this.sharedClock = next; this.signalState = next.schedulerState;
    this.signalEvents.push(...result.events); this.renderSignalRun(); this.renderSharedRun();
    return next.status;
  }
  stepSharedRun() {
    this.pauseSharedRun();
    if (!this.sharedClock && !this.prepareSharedRun()) return;
    try {
      const result = stepSharedClock(this.sharedClock);
      this.validateDeviceTransition(this.sharedClock.schedulerState.devices, result.state.schedulerState.devices, result.events);
      this.applySharedResult(result);
    } catch (error) { this.failSharedRun(error); }
  }
  failSharedRun(error) {
    this.pauseSharedRun();
    if (this.sharedClock) this.sharedClock = { ...this.sharedClock, status: 'error',
      diagnostics: [...this.sharedClock.diagnostics, { code: error.code || 'SHARED_UI',
        line: error.line, program: error.program, message: error.message }] };
    this.renderSharedRun();
  }
  playSharedRun() {
    if (!this.sharedClock && !this.prepareSharedRun()) return;
    if (this.sharedFrame != null || this.sharedClock.status !== 'running') return;
    this.app.animform.stop(); this.app.poseTool.finish(true); this.player.pause();
    const origin = performance.now() - this.sharedClock.timeSeconds * 1000;
    const frame = now => {
      this.sharedFrame = null;
      try {
        const target = Math.max(this.sharedClock.timeSeconds, (now - origin) / 1000);
        while (this.sharedClock.status === 'running' &&
            (this.sharedClock.schedulerState.tick + 1) * this.sharedClock.tickSeconds <= target + 1e-10) {
          const result = stepSharedClock(this.sharedClock);
          this.validateDeviceTransition(this.sharedClock.schedulerState.devices, result.state.schedulerState.devices, result.events);
          this.applySharedResult(result);
        }
        if (this.sharedClock.status === 'running' && target > this.sharedClock.timeSeconds)
          this.applySharedResult(advanceSharedClockTo(this.sharedClock, target));
        if (this.sharedClock.status === 'running') this.sharedFrame = requestAnimationFrame(frame);
      } catch (error) { this.failSharedRun(error); }
    };
    this.sharedFrame = requestAnimationFrame(frame);
  }
  pauseSharedRun() {
    if (this.sharedFrame != null) cancelAnimationFrame(this.sharedFrame);
    this.sharedFrame = null;
    if (this.sharedClock) this.renderSharedRun();
  }
  resetSharedRun() {
    if (!this.plan || !this.player.samples) { this.sharedStatus('Plan a robot program before resetting a shared run.', true); return; }
    this.pauseSharedRun(); this.signalInitialDevices = null;
    this.prepareSharedRun();
  }
  async loadTriggeredExample({ robotFile = 'combined.robot', programFile = 'triggered.mprg',
    message = 'Device-first example loaded. RUN_ROBOT plans after tray_ready.' } = {}) {
    if (!this.app.workspace.canReplaceDraft()) return;
    const paths = ['testowe/workcell/arm.urdf', 'testowe/multi_program/conveyor.sdf',
      `testowe/multi_program/${robotFile}`, `testowe/multi_program/${programFile}`];
    const files = await Promise.all(paths.map(path => readExampleText(path)));
    this.stopTriggeredRun(); this.stopSharedRun(); this.projectId = null; this.includeFiles.clear(); this.motionLimits = {};
    this.motionLimitsSource.value = '{}';
    this.app.localRobots.startDocument(); this.app.localRobots.clearAssets(); this.app.localRobots.showURDF(files[0]);
    this.sdfSource.value = files[1]; this.applySDF();
    this.programSource.value = files[2]; this.signalProgramSource.value = files[3];
    this.signalState = null; this.signalInitialDevices = null; this.signalEvents = []; this.signalCompileDiagnostics = [];
    this.renderSignalRun(message);
    this.app.workspace.select('program'); this.fitWorkcell();
    this.prepareTriggeredRun();
  }
  prepareTriggeredRun() {
    try {
      const tickSeconds = Number(document.getElementById('trigger-tick-seconds').value);
      if (!Number.isFinite(tickSeconds) || tickSeconds < 0.01 || tickSeconds > 1)
        throw new Error('Seconds per tick must be from 0.01 through 1.');
      if (!this.activeRobotName || !window.robot || !window.robotjointcollection) throw new Error('Load a URDF robot before preparing a triggered run.');
      this.stopTriggeredRun(); this.stopSharedRun(); this.invalidatePlan({ restoreStart: false });
      this.app.animform.stop(); this.app.poseTool.finish(true);
      const compiledRobot = compileProgram(this.programSource.value);
      if (!compiledRobot.ok) throw new Error(`Movement source: line ${compiledRobot.diagnostics[0].line}: ${compiledRobot.diagnostics[0].message}`);
      const tool = compiledRobot.steps.find(step => step.kind === 'TOOL')?.args[0];
      if (!tool) throw new Error('Movement source needs TOOL name before RUN_ROBOT can plan.');
      window.robot.updateWorldMatrix(true, false);
      const initialRobotModel = createRobotModel({ joints: window.robotjointcollection.models,
        tipLink: tool, worldFromBase: window.robot.matrixWorld });
      const compiled = this.checkSignalPrograms();
      if (!compiled.ok) throw new Error('Correct the concurrent program errors before preparing a triggered run.');
      const devices = captureSceneDevices(this.sceneModel);
      const schedulerState = createMultiProgramState({ programs: compiled.programs, devices });
      this.triggerClock = createTriggeredClock({ schedulerState, initialQ: initialRobotModel.initial,
        tickSeconds, maxTicks: 10000 });
      this.triggerRobotSource = this.programSource.value; this.triggerCompiledRobot = compiledRobot;
      const names = window.robotjointcollection.filter(joint => joint.type !== 'fixed' && !joint.mimic).map(joint => joint.name);
      this.triggerBaseline = { world: this.sceneModel.snapshotWorld(), attachments: this.sceneModel.attachmentRecords(),
        names, q: names.map(name => window.robotjointcollection.findWhere({ name }).theta) };
      this.triggerPlayer = null; this.triggerSynced = false; this.triggerPlaying = false; this.triggerVisualTime = 0;
      this.signalState = this.triggerClock.schedulerState; this.signalEvents = [];
      this.renderSignalRun(); this.renderTriggeredRun();
      return this.triggerClock;
    } catch (error) { this.triggerStatus(error.message, true); return null; }
  }
  renderTriggeredRun() {
    if (!this.triggerClock) return;
    const clock = this.triggerClock, issue = clock.diagnostics.at(-1);
    const displayedTime = Math.max(clock.timeSeconds, this.triggerVisualTime ?? clock.timeSeconds);
    this.triggerStatus(`Time ${displayedTime.toFixed(2)} s · tick ${clock.tick} · robot ${clock.robot.status}${clock.requestCount ? ` (run ${clock.requestCount})` : ''} · ${clock.status}${issue ? ` · ${issue.line ? `Concurrent line ${issue.line}: ` : ''}${issue.message}` : ''}`,
      !['running', 'finished', 'planning'].includes(clock.status));
  }
  renderTriggeredVisual(timeSeconds) {
    const clock = this.triggerClock;
    if (!clock || clock.status !== 'running') return;
    const upper = (clock.tick + 1) * clock.tickSeconds;
    const visualTime = Math.max(this.triggerVisualTime ?? clock.timeSeconds,
      Math.max(clock.timeSeconds, Math.min(upper, timeSeconds)));
    if (this.triggerPlayer && clock.robot.startTime != null) {
      const localTime = Math.max(0, Math.min(clock.robot.duration, visualTime - clock.robot.startTime));
      if (localTime > this.triggerPlayer.time + 1e-9) this.triggerPlayer.seek(localTime);
    }
    this.triggerVisualTime = visualTime;
    this.renderTriggeredRun();
  }
  applyTriggeredResult(result) {
    let next = result.state;
    const robot = next.robot;
    if (this.triggerPlayer && robot.startTime != null) {
      const localTime = Math.max(0, Math.min(robot.duration, next.timeSeconds - robot.startTime));
      if (localTime > this.triggerPlayer.time + 1e-9) this.triggerPlayer.seek(localTime);
    }
    const moved = [...new Set(result.events.filter(event => event.kind === 'MOVE_MODEL' && event.outcome === 'move').map(event => event.model))];
    if (moved.length) applySceneDevices(this.sceneModel, { devices: Object.fromEntries(moved.map(name => [name, next.schedulerState.devices[name]])) });
    if (this.triggerPlayer && robot.status === 'done' && !this.triggerSynced) {
      next = syncTriggeredDevices(next, captureSceneDevices(this.sceneModel));
      this.triggerSynced = true;
    }
    this.triggerClock = next; this.triggerVisualTime = Math.max(this.triggerVisualTime ?? next.timeSeconds, next.timeSeconds);
    this.signalState = next.schedulerState; this.signalEvents.push(...result.events);
    this.renderSignalRun(); this.renderTriggeredRun();
  }
  async planTriggeredRobot(request, generation) {
    const controller = new AbortController(); this.triggerPlanningController = controller;
    this.triggerStatus(`Planning movement from the scene at line ${request.line}…`);
    let result;
    try {
      if (this.sceneIntegrityIssues.length) throw new Error(`Scene assets are incomplete: ${this.sceneIntegrityIssues.map(item => item.message).join(' | ')}`);
      if (this.app.collisions.issues.length) throw new Error(`Robot collision assets are incomplete: ${this.app.collisions.issues.join(' | ')}`);
      result = await planProgramInWorker(this.triggerCompiledRobot, { robotName: this.activeRobotName,
        robotRoot: window.robot, jointModels: window.robotjointcollection.models,
        robotXml: this.app.localRobots.currentXml, sceneModel: this.sceneModel,
        meshGeometry: uri => this.app.localRobots.meshGeometry(uri), motionLimits: this.motionLimits,
        kinematicConstraints: this.kinematicConstraints },
      { signal: controller.signal });
    } catch (error) { result = { status: 'error', diagnostics: [{ code: 'WORKER', message: error.message }] }; }
    if (generation !== this.triggerGeneration || this.triggerClock?.status !== 'planning') return;
    this.triggerPlanningController = null;
    if (result.status !== 'planned') {
      const item = result.diagnostics?.[0] || { code: 'ROBOT_PLAN_FAILED', message: 'Movement planning failed.' };
      this.triggerClock = rejectRobotPlan(this.triggerClock, { code: item.code,
        message: `${item.line ? `Movement line ${item.line}: ` : ''}${item.message}` });
      this.renderTriggeredRun(); return;
    }
    try {
      const player = new ProgramPlayer({ sceneModel: this.sceneModel,
        applyJointState: q => this.applyNamedJointState(result.model.jointNames, q),
        onTime: () => {
          const attachments = JSON.stringify(this.sceneModel.attachmentRecords());
          if (attachments !== this.attachmentSummary) this.renderObjects();
        } });
      player.model = result.model; player.load(result);
      this.triggerClock = acceptRobotPlan(this.triggerClock, result);
      this.triggerPlayer = player; this.triggerSynced = false;
      this.signalState = this.triggerClock.schedulerState; this.renderSignalRun(); this.renderTriggeredRun();
    } catch (error) {
      this.triggerClock = rejectRobotPlan(this.triggerClock, { code: 'ROBOT_PLAYER', message: error.message });
      this.renderTriggeredRun();
    }
  }
  async advanceTriggeredTick() {
    if (!this.triggerClock || this.triggerClock.status !== 'running') return;
    const generation = this.triggerGeneration;
    try {
      const result = stepTriggeredClock(this.triggerClock);
      this.validateDeviceTransition(this.triggerClock.schedulerState.devices, result.state.schedulerState.devices, result.events);
      this.applyTriggeredResult(result);
      if (result.request) await this.planTriggeredRobot(result.request, generation);
    } catch (error) {
      if (generation !== this.triggerGeneration || !this.triggerClock) return;
      this.triggerClock = { ...this.triggerClock, status: 'error', diagnostics: [...this.triggerClock.diagnostics,
        { code: error.code || 'TRIGGER_UI', line: error.line, program: error.program, message: error.message }] };
      this.renderTriggeredRun();
    }
  }
  async stepTriggeredRun() {
    this.pauseTriggeredRun();
    if (!this.triggerClock && !this.prepareTriggeredRun()) return;
    await this.advanceTriggeredTick();
  }
  playTriggeredRun() {
    if (!this.triggerClock && !this.prepareTriggeredRun()) return;
    if (this.triggerFrame != null || this.triggerPlaying || this.triggerClock.status !== 'running') return;
    this.triggerPlaying = true; this.app.animform.stop(); this.app.poseTool.finish(true); this.player.pause();
    const generation = this.triggerGeneration;
    let baseTime = this.triggerClock.timeSeconds;
    const offset = Math.max(0, Math.min(this.triggerClock.tickSeconds, (this.triggerVisualTime ?? baseTime) - baseTime));
    let epoch = performance.now() - offset * 1000;
    const frame = async now => {
      this.triggerFrame = null;
      if (!this.triggerPlaying || !this.triggerClock || generation !== this.triggerGeneration) return;
      try {
        const elapsed = Math.max(0, (now - epoch) / 1000);
        this.renderTriggeredVisual(baseTime + elapsed);
        if (elapsed >= this.triggerClock.tickSeconds) {
          await this.advanceTriggeredTick();
          if (!this.triggerPlaying || !this.triggerClock || generation !== this.triggerGeneration) return;
          baseTime = this.triggerClock.timeSeconds;
          epoch = performance.now();
        }
      } catch (error) {
        if (generation !== this.triggerGeneration || !this.triggerClock) return;
        this.triggerPlaying = false;
        this.triggerClock = { ...this.triggerClock, status: 'error', diagnostics: [...this.triggerClock.diagnostics,
          { code: 'TRIGGER_VISUAL', message: error.message }] };
        this.renderTriggeredRun(); return;
      }
      if (this.triggerPlaying && this.triggerClock?.status === 'running') this.triggerFrame = requestAnimationFrame(frame);
      else this.triggerPlaying = false;
    };
    this.triggerFrame = requestAnimationFrame(frame);
  }
  pauseTriggeredRun() {
    this.triggerPlaying = false;
    if (this.triggerFrame != null) cancelAnimationFrame(this.triggerFrame);
    this.triggerFrame = null;
    if (this.triggerClock) this.renderTriggeredRun();
  }
  resetTriggeredRun() {
    const baseline = this.triggerBaseline;
    if (!baseline) { this.triggerStatus('Prepare a triggered run before resetting it.', true); return; }
    this.stopTriggeredRun();
    this.sceneModel.loadWorld(baseline.world);
    this.applyNamedJointState(baseline.names, baseline.q);
    for (const attachment of baseline.attachments) this.sceneModel.attach(attachment.object, attachment.frame, { keepWorldPose: true });
    this.renderObjects(); this.fitWorkcell();
    this.prepareTriggeredRun();
  }
  async openProject(buffer) {
    const project = unpackProject(buffer);
    if (project.robots.length !== 1) throw new Error('This workcell release needs exactly one URDF robot per project.');
    const local = this.app.localRobots;
    this.validateProjectAttachments(project);
    if (!this.app.workspace.canReplaceDraft()) return false;
    this.invalidatePlan({ restoreStart: false });
    this.pendingRobotMount = null;
    if (this.activeRobotName && this.sceneModel.robotMountRecord(this.activeRobotName))
      this.sceneModel.unmountRobotBase(this.activeRobotName);
    this.projectId = null;
    this.kinematicConstraints = project.kinematicConstraints ?? null;
    this.closedLoopModel = null;
    this.includeFiles = new Map((project.includes || []).map(item => [item.name, item.text]));
    local.startDocument(); local.clearAssets();
    for (const asset of project.assets) local.assets.set(asset.name, asset.bytes.buffer.slice(asset.bytes.byteOffset, asset.bytes.byteOffset + asset.bytes.byteLength));
    this.motionLimits = project.motionLimits;
    this.motionLimitsSource.value = JSON.stringify(this.motionLimits, null, 2);
    this.programSource.value = project.program;
    this.signalProgramSource.value = project.signalPrograms || '';
    this.signalState = null; this.signalInitialDevices = null; this.signalEvents = []; this.signalCompileDiagnostics = []; this.renderSignalRun('Signal programs restored. Check or run to begin.');
    this.sdfSource.value = project.worldSdf;
    this.applySDF();
    local.showURDF(project.robots[0].urdf);
    this.restoreProjectRobotState(project.robotState);
    if (project.robotMount) this.sceneModel.mountRobotBase(this.activeRobotName, project.robotMount.frame,
      { keepWorldPose: false, localPose: project.robotMount.localPose });
    for (const attachment of project.attachments) this.sceneModel.attach(attachment.object, attachment.frame, { keepWorldPose: true });
    this.refreshRobotBaseFrames(); this.renderObjects();
    this.app.workspace.select('workcell'); this.fitWorkcell();
    this.status(`Opened project ${project.name}.`);
    return true;
  }
  validateProjectAttachments(project) {
    const includes = new Map(project.includes.map(item => [item.name, item.text]));
    const parsed = parseSDF(project.worldSdf, { readInclude: uri => this.readInclude(uri, includes) });
    const errors = parsed.diagnostics.filter(item => item.severity === 'error');
    if (errors.length) throw new Error(`Project world is invalid: ${errors.map(item => item.message).join(' | ')}`);
    const models = new Map(parsed.world.models.map(model => [model.name, model]));
    const modelFrames = new Map();
    for (const model of parsed.world.models) {
      modelFrames.set(`model/${model.name}`, model.name);
      for (const link of model.links) modelFrames.set(`model/${model.name}/link/${link.name}`, model.name);
    }
    const robotDocument = this.app.localRobots.validate(project.robots[0].urdf);
    const robotName = robotDocument.documentElement.getAttribute('name') || 'robot';
    if (project.robots[0].name !== robotName) throw new Error('Project robot manifest name does not match its URDF.');
    if (project.kinematicConstraints) validateFourBarProjectState({ descriptor: project.kinematicConstraints,
      robotDocument, robotState: project.robotState });
    else validateRobotStateForURDF(project.robotState, robotDocument);
    const robotFrames = new Set([`robot/${robotName}`]);
    for (const link of robotDocument.querySelectorAll('robot > link')) robotFrames.add(`robot/${robotName}/link/${link.getAttribute('name')}`);
    const parents = new Map();
    for (const attachment of project.attachments) {
      if (!models.has(attachment.object)) throw new Error(`Project attachment object ${attachment.object} is absent from the world.`);
      if (modelFrames.has(attachment.frame)) {
        const parent = modelFrames.get(attachment.frame);
        if (parent === attachment.object) throw new Error(`Project attachment cycle at ${attachment.object}.`);
        parents.set(attachment.object, parent);
      } else if (!robotFrames.has(attachment.frame)) throw new Error(`Project attachment frame ${attachment.frame} is unavailable.`);
    }
    for (const child of parents.keys()) {
      const seen = new Set(); let name = child;
      while (parents.has(name)) {
        if (seen.has(name)) throw new Error(`Project attachment cycle at ${name}.`);
        seen.add(name); name = parents.get(name);
      }
    }
    if (project.robotMount) {
      if (project.robotMount.robot !== robotName || !modelFrames.has(project.robotMount.frame))
        throw new Error(`Project robot base frame ${project.robotMount.frame} is unavailable for ${robotName}.`);
      const attachmentByObject = new Map(project.attachments.map(item => [item.object, item.frame]));
      let carrier = modelFrames.get(project.robotMount.frame);
      const seen = new Set();
      while (carrier) {
        if (seen.has(carrier)) throw new Error(`Project robot base attachment cycle at ${carrier}.`);
        seen.add(carrier);
        const frame = attachmentByObject.get(carrier);
        if (frame?.startsWith('robot/')) throw new Error('Project robot base cannot be mounted on a model attached to the robot.');
        carrier = modelFrames.get(frame) || null;
      }
    }
  }
  restoreProjectRobotState(state) {
    if (!state) return;
    if (this.closedLoopModel) {
      this.applyNamedJointState(state.jointNames, state.positions);
      return;
    }
    for (let index = 0; index < state.jointNames.length; index++) {
      const name = state.jointNames[index], value = state.positions[index];
      const joint = window.robotjointcollection?.findWhere({ name });
      if (!joint || !joint.movejoint(value) || Math.abs(joint.theta - value) > 1e-8) throw new Error(`Cannot restore project joint ${name}.`);
      this.app.robotjointmanipall.jointsdict[name]?.jointval();
    }
    window.robot.updateMatrixWorld(true);
  }
  async loadFourBarExample() {
    if (!this.app.workspace.canReplaceDraft()) return;
    const folder = 'testowe/four_bar/';
    const [urdf, world, program, descriptorText, stateText] = await Promise.all(
      ['robot.urdf', 'world.sdf', 'program.robot', 'kinematic-constraints.json', 'robot-state.json']
        .map(name => readExampleText(folder + name)));
    const descriptor = normalizeKinematicConstraints(JSON.parse(descriptorText));
    const state = JSON.parse(stateText);
    validateFourBarProjectState({ descriptor, robotDocument: this.app.localRobots.validate(urdf), robotState: state });
    this.projectId = null; this.includeFiles.clear(); this.motionLimits = {};
    this.motionLimitsSource.value = '{}';
    this.kinematicConstraints = descriptor; this.closedLoopModel = null;
    this.app.localRobots.startDocument(); this.app.localRobots.clearAssets();
    this.app.localRobots.showURDF(urdf);
    if (!this.closedLoopModel) throw new Error(`Four-bar constraint could not be applied: ${this.lastClosedLoopError || 'unknown reason'}.`);
    this.restoreProjectRobotState(state);
    this.sdfSource.value = world; this.programSource.value = program;
    this.signalProgramSource.value = ''; this.signalState = null; this.signalInitialDevices = null;
    this.signalEvents = []; this.signalCompileDiagnostics = []; this.renderSignalRun();
    this.applySDF(); this.app.setStandardView('top'); this.fitWorkcell(); this.app.workspace.select('workcell');
    this.status('Closed four-bar loaded in top view: one input angle drives the coupler and output. Move the input slider, or plan its example program.');
  }
  async loadDemo(folder = 'workcell', robotFile = 'arm.urdf', loadedMessage = 'Pick-and-place example loaded. Open Program, then choose Plan path.', programFile = 'program.txt') {
    if (!this.app.workspace.canReplaceDraft()) return false;
    const files = await Promise.all([robotFile, 'world.sdf', programFile]
      .map(name => readExampleText(`testowe/${folder}/${name}`)));
    this.projectId = null; this.includeFiles.clear(); this.motionLimits = {}; this.kinematicConstraints = null; this.closedLoopModel = null;
    this.motionLimitsSource.value = '{}';
    this.app.localRobots.startDocument(); this.app.localRobots.clearAssets();
    this.app.localRobots.showURDF(files[0]);
    this.sdfSource.value = files[1]; this.programSource.value = files[2];
    this.signalProgramSource.value = ''; this.signalState = null; this.signalInitialDevices = null; this.signalEvents = []; this.signalCompileDiagnostics = []; this.renderSignalRun();
    this.applySDF();
    if (folder === 'workcell') this.applyNamedJointState(
      ['base_yaw', 'shoulder_pitch', 'elbow_pitch', 'wrist_roll', 'wrist_pitch', 'wrist_final'], [0, -0.3, 0.6, 0.2, -0.3, 0.2]);
    this.fitWorkcell();
    this.app.workspace.select('workcell');
    this.status(loadedMessage);
    return true;
  }
  async loadTeachingLesson() {
    if (!this.app.workspace.canReplaceDraft()) return;
    const urdf = await readExampleText('testowe/workcell/arm.urdf');
    this.stopSharedRun(); this.stopTriggeredRun(); this.projectId = null;
    this.includeFiles.clear(); this.motionLimits = {}; this.motionLimitsSource.value = '{}';
    this.kinematicConstraints = null; this.closedLoopModel = null;
    this.app.localRobots.startDocument(); this.app.localRobots.clearAssets(); this.app.localRobots.showURDF(urdf);
    this.sdfSource.value = '<sdf version="1.10"><world name="two_pose_lesson"/></sdf>'; this.applySDF();
    const names = ['base_yaw', 'shoulder_pitch', 'elbow_pitch', 'wrist_roll', 'wrist_pitch', 'wrist_final'];
    const q = [0.2, -0.5, 0.8, 0.3, -0.4, 0.2];
    this.applyNamedJointState(names, q); this.teachingStart = { names, q };
    this.programSource.value = 'ROBOT classroom_six_axis_arm\nTOOL tcp_link\n';
    this.signalProgramSource.value = ''; this.signalState = null; this.signalEvents = []; this.renderSignalRun();
    document.getElementById('lesson-steps').hidden = false;
    document.getElementById('lesson-return').hidden = false;
    document.getElementById('lesson-singularity-exercise').hidden = false;
    document.getElementById('lesson-instructions').textContent = 'Teach A, jog to B, and teach B. The robot starts bent so you can explore Cartesian jogging before investigating singular configurations.';
    document.getElementById('program-source-details').open = false;
    document.getElementById('program-pendant-details').open = true;
    document.getElementById('program-pose-details').open = false;
    document.getElementById('program-concurrent-details').open = false;
    document.getElementById('pendant-frame').value = 'joint'; this.updatePendantMode();
    this.app.workspace.select('program'); this.fitWorkcell();
    if (innerWidth >= 1000) {
      document.getElementById('pendant-detach').click();
      const floating = document.getElementById('floating-pendant');
      floating.style.left = `${Math.min(innerWidth - 430, document.getElementById('controldiv').getBoundingClientRect().right + 12)}px`;
    }
    document.getElementById('panel-program').scrollTop = 0;
    this.programStatus('Teaching lesson ready. First record A with Teach joint pose.');
  }
  createProjectZip() {
    if (!this.app.localRobots.currentXml) throw new Error('Load a URDF robot before exporting a workcell.');
    const worldSdf = serializeSDF(this.sceneModel.snapshotWorld());
    const assets = [...this.app.localRobots.assets].map(([name, bytes]) => ({ name, bytes }));
    const independent = this.closedLoopModel
      ? [window.robotjointcollection.findWhere({ name: this.closedLoopModel.jointNames[0] })]
      : window.robotjointcollection?.filter(joint => joint.type !== 'fixed' && !joint.mimic) || [];
    const robotState = { jointNames: independent.map(joint => joint.name), positions: independent.map(joint => joint.theta) };
    return packProject({ name: this.sceneModel.world.name, worldSdf, robots: [{ name: this.activeRobotName || 'robot', urdf: this.app.localRobots.currentXml }], assets, attachments: this.sceneModel.attachmentRecords(), robotState, robotMount: this.sceneModel.robotMountRecord(this.activeRobotName), kinematicConstraints: this.kinematicConstraints, program: this.programSource.value, signalPrograms: this.signalProgramSource.value, motionLimits: this.motionLimits, includes: [...this.includeFiles].map(([name, text]) => ({ name, text })) });
  }
  saveProject() {
    const zip = this.createProjectZip();
    const url = URL.createObjectURL(new Blob([zip], { type: 'application/zip' }));
    const link = document.createElement('a'); link.href = url; link.download = `${this.sceneModel.world.name || 'workcell'}.zip`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.status('Project ZIP downloaded.');
  }
  async refreshProjects(selected = '') {
    const records = await this.projectStore.list();
    const library = document.getElementById('project-library');
    library.replaceChildren(new Option('Choose a saved workcell', ''));
    records.sort((a, b) => b.updated - a.updated).forEach(record => library.add(new Option(record.name, record.id)));
    library.value = selected;
  }
  async saveLocalProject() {
    const zip = this.createProjectZip();
    const name = this.sceneModel.world.name || 'workcell';
    const id = this.projectId || crypto.randomUUID();
    await this.projectStore.put({ id, name, updated: Date.now(), zip: zip.buffer.slice(zip.byteOffset, zip.byteOffset + zip.byteLength) });
    this.projectId = id; await this.refreshProjects(id); this.status(`Saved ${name} in this browser.`);
  }
  async openLocalProject() {
    const id = document.getElementById('project-library').value;
    if (!id) throw new Error('Choose a saved workcell first.');
    const record = await this.projectStore.get(id);
    if (!record) throw new Error('That saved workcell is no longer available.');
    if (await this.openProject(record.zip)) this.projectId = id;
  }
  async deleteLocalProject() {
    const id = document.getElementById('project-library').value;
    if (!id) throw new Error('Choose a saved workcell first.');
    await this.projectStore.delete(id);
    if (this.projectId === id) this.projectId = null;
    await this.refreshProjects(); this.status('Saved workcell deleted.');
  }
}
