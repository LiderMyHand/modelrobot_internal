# Command-time robot planning after device motion — design review

Date: 2026-11-13. This is an architecture review of the current code, not an implementation claim. I inspected the typed concurrent parser and scheduler, `shared-clock.js`, `ProgramPlayer`, the planning Worker client and snapshot, and `WorkcellUI`.

## Required behavior

Add one concurrent-program command, `RUN_ROBOT`, referring to the movement program in the existing Program editor. A typical two-program source is:

```text
PROGRAM conveyor
MOVE_MODEL tray X 0.65 TICKS 4
SET tray_ready 1
END

PROGRAM arm
WAIT_SET tray_ready TIMEOUT 20
RUN_ROBOT
WAIT_SET robot_done TIMEOUT 80
END
```

Freeze the movement-program source when a triggered run is prepared. The robot must remain at its current joint state while the tray moves. At the `RUN_ROBOT` dispatch boundary, apply all accepted device poses from that tick, snapshot the **current** scene and joint positions, and plan the movement program in the existing browser Worker. If planning succeeds, start its timed samples at that boundary. If it fails, leave the robot and scene at the dispatch state and show both the `RUN_ROBOT` source line and the planner's movement-program diagnostic.

`snapshotProgramContext()` already reads live `joint.theta`, model/world matrices, collision frames, and attachments. That makes it the correct Worker boundary after device motion. `planCurrentProgram()` is unsuitable as the entry point: it calls `invalidatePlan()`, which stops the shared run, and may restore an earlier player scene. Expose a separate planning function that compiles the frozen movement source and calls `planProgramInWorker(compiled, currentContext, {signal})` without resetting the scene. Its result is consumed by a **new** `ProgramPlayer` for each accepted robot request. `ProgramPlayer.load()` resets an existing player before loading, so reusing the current player can erase the device's postmove scene.

## Clock and scheduler contract

At fixed tick duration $\Delta t$, scheduler tick $k$ reads the shared signal map at $t_k=k\Delta t$ and commits at $t_{k+1}$. `RUN_ROBOT` is a typed scheduler command with no signal name. The language agent has implemented it as a once-only request event when `stepMultiProgram(state,{allowRobotRequest:true})` is used; standalone scheduler calls return `ROBOT_RUNTIME_REQUIRED` rather than pretending to move the robot. The request advances that program's counter once. Two requests in one tick produce an atomic conflict; a request while another robot plan is active should fail with `ROBOT_BUSY`. A device may move earlier in the same accepted dispatch tick: apply its committed pose first, then take the planning snapshot at tick end. During the asynchronous Worker call, simulation time does **not** advance; Pause/Reset can abort the Worker. Once planning finishes, its local time zero is the dispatch boundary and subsequent shared ticks continue.

`robot_done` is read-only and starts at 0. A new accepted request sets it to 0; it becomes 1 at the first tick boundary on or after the planned endpoint. `WAIT_SET robot_done` observes the value from its tick-start snapshot. An untimed wait for `robot_done` must not be declared deadlocked while a request is pending or a robot plan is active; an explicit timeout still counts elapsed **simulation** ticks. If no request can ever occur, a bounded run or a real dependency analysis should diagnose that rather than leaving an infinite browser loop. Source `SET robot_done ...` must be rejected before execution.

```mermaid
sequenceDiagram
  participant D as Device program
  participant S as Tick scheduler
  participant W as Planning Worker
  participant P as New robot player
  D->>S: MOVE_MODEL tray, then SET tray_ready
  S->>S: arm WAIT_SET tray_ready
  S->>S: arm RUN_ROBOT request at tick end
  S->>W: snapshot current q + moved scene; plan source
  Note over S,W: Simulation time frozen; request abortable
  W-->>S: collision-checked timed samples or diagnostic
  S->>P: load fresh plan at dispatch scene
  loop Each accepted shared time step
    S->>P: seek(local robot time)
    S->>S: advance signals and waits
  end
  P-->>S: endpoint reached
  S->>S: robot_done = 1 at next tick boundary
```

The scheduler transition should remain pure and tentative. Before applying any tick to the live scene, inspect its events. Reject a `MOVE_MODEL` if a robot plan is active for any part of that tick; return a line-located `UNSAFE_DEVICE_TIMING` without committing that tick. This preserves the fixed-scene collision assumption of the just-planned path. A request while a model move is still in progress may be accepted at a boundary only if no further model samples will occur during the robot plan; otherwise the next tick fails. A preflight check can identify that situation earlier. Device sweeps while the robot is stationary still lack collision validation; that remains an explicit limitation.

## Browser ownership and reset

The triggered controller should own one RAF loop and one AbortController for an in-flight Worker. On source, SDF, URDF, manual robot control, or project replacement: cancel RAF, abort planning, invalidate the run generation, and ignore any later Worker result. Do not allow the ordinary robot player or independent signal lab to advance simultaneously. Step advances one scheduler tick or, while robot is between tick boundaries, one defined time increment; Pause retains all counters and poses. A programmatic planning request can be paused in wall time without advancing simulation time.

Capture a whole-run baseline before tick zero: SDF world poses, attachment records, independent robot joint positions, and the initial scheduler state. Reset aborts work, discards the per-request player, restores this baseline, and restarts at tick zero. Resetting only `ProgramPlayer` is wrong because its `initialWorld` is the **postdevice** scene at robot dispatch. Project ZIP should continue to save the current SDF/URDF/joint positions and both source programs, not a running controller checkpoint. Reopen at the archived physical pose with the triggered program idle.

## Suggested interfaces

- Parser/scheduler: accept `{kind:'RUN_ROBOT',line}`; use `allowRobotRequest:true` only from the triggered controller and reject it in the standalone signal lab. Reject concurrent duplicate robot requests atomically. Reserve `robot_done` against SET. Pass `externalPendingSignals:['robot_done']` while Worker planning or robot motion can complete the wait; keep the default scheduler behavior backward compatible for the signal lab and T-19 shared clock.
- New orchestration module: `createTriggeredRun({schedulerState,tickSeconds,initialQ,initialWorld,initialAttachments})`, `advanceTriggeredRunTo(run,targetSeconds)` for pure committed ticks until a `RUN_ROBOT` request or active plan boundary, and `resumeTriggeredRunWithPlan(run,plan)` after Worker planning. Return `{state,events,request?,diagnostics}` so UI can start/await Worker separately. A smaller imperative controller is acceptable if it still has one explicit owner of time and a testable transition boundary.
- UI planning helper: `planMovementAtCurrentScene({source,signal})` should compile and call the Worker using current `robotRoot`, `jointModels`, `sceneModel`, `meshGeometry`, and limits. It should not call `invalidatePlan()` or reuse `this.player.load()`.
- Dedicated robot player: create a new `ProgramPlayer` after each accepted plan. Its joint setter needs the planned model's `jointNames` explicitly; the current `WorkcellUI.applyJointState()` infers names from `this.plan` or the ordinary player, which may be stale. Avoid global model inference during triggered playback.

## Verification gates

1. Parser/scheduler tests: valid `RUN_ROBOT`, wrong arguments, source line; two same-tick requests conflict without committing other writes; `SET robot_done` rejected; wait pending/timeout semantics.
2. Worker/browser integration: move tray first, observe its changed world transform, issue `RUN_ROBOT`, and assert the Worker's snapshot starts at that transform and the displayed robot's current q. A collision at the moved tray's new location should fail planning at the `RUN_ROBOT` line while leaving scene/q unchanged.
3. Timing: robot remains still through device ticks; then reaches a nonzero intermediate q; `robot_done` rises at the proper boundary and a waiting program completes. Pause/Step/Reset should replay the same device and robot poses.
4. Safety: a device command during robot motion is rejected before the tick changes either actor; concurrent duplicate robot requests fail atomically; abort/reset while Worker planning ignores the stale result.
5. Chromium visual proof and ZIP: screenshots of device-before-robot, robot-mid, final, and after reset; numeric pose/q trace and page-error check; ZIP reopen preserves current physical poses and sources without resuming execution.

This path completes signal-triggered **single-robot** planning after a kinematic device move. It does not solve simultaneous moving-obstacle planning, device sweep collisions, closed-loop kinematics, external axes, or multi-robot execution.
