# Shared-clock integration review — 2026-11-13

## Verdict and evidence

Read-only review found no remaining blocker after two issues identified below were fixed. I ran `node --test tests/shared-clock.test.cjs tests/shared-clock-browser.test.cjs tests/multi-program-scheduler.test.cjs`: **17/17 passed**. I inspected [robot mid-run](artifacts/shared_robot_mid.png), [device mid-run](artifacts/shared_device_mid.png), and [finished](artifacts/shared_final.png) Chromium screenshots plus the [state trace](artifacts/shared_clock.json). The browser shows robot joint motion at 0.30 s while tray X stays 0.20 m; after `robot_done`, the robot holds its endpoint and tray X reaches 0.3125 m at 1.00 s and 0.65 m at 1.50 s. Pause freezes time, Reset restores robot and tray, an early device command fails at source line without moving either, and ZIP reopen restores program sources and final scene pose without resuming the clock. No page error was recorded.

## Timing and ownership checks

- `frontend/shared-clock.js` samples the preplanned robot q at arbitrary simulation time and commits scheduler commands at integer tick boundaries. `robot_done` is reserved and read-only. For a robot ending between boundaries, it becomes one at the next boundary; a WAIT observes it in the following scheduler tick. Timed waits continue to count logical ticks, while an untimed WAIT on pending `robot_done` does not deadlock prematurely.
- A `MOVE_MODEL` whose tick starts before the robot plan ends returns `UNSAFE_DEVICE_TIMING` without committing that tick. A model touched by the robot plan's GRAB/RELEASE/WELD_JOIN events cannot also be driven by a device command in the same shared run. These conservative rules prevent robot/device overlap against a fixed planner collision snapshot; they do not check device sweeps after the robot stops.
- `WorkcellUI` pauses the standalone robot player before shared playback and applies its timed robot pose through `ProgramPlayer.seek`. It only applies device poses for `MOVE_MODEL` events, so it does not overwrite a robot-carried model. Shared Play uses animation frames; Step advances one logical tick; Pause cancels the frame; Reset restores the plan's start scene and scheduler state.
- Ordinary robot controls, ordinary signal controls, signal source edits/examples, new SDF/robot loading, and plan invalidation now stop shared playback and clear its owned signal state. A standalone `MOVE_MODEL` run then invalidates the old robot plan. The updated browser regression covers shared→signal Run, shared→ordinary robot Step→signal Run, and source edit during shared mode.
- The panel and [core note](2026-11-13_shared_clock_core.md) clearly state that the robot trajectory is preplanned and device motion is permitted only afterward. They do not claim concurrent robot/device collision checking or online replanning. `tickSeconds` is a teaching simulation-time setting, not a physical controller rate.

## Issues found and resolved during review

1. If signal programs had already finished and robot duration was between tick boundaries, the combined clock initially ended at the robot endpoint with `robot_done=0` forever. The core now stays live until the next boundary; a regression covers robot end at 0.25 s with 0.1 s ticks.
2. Standalone signal controls could reuse the shared scheduler state and move a device while the robot's planned path remained active. Stopping shared mode now clears its scheduler ownership, and source-change paths also stop the clock. Chromium regressions cover direct and two-step handoff sequences.

## Scope limits

- A shared run needs a completed robot plan first. It coordinates that fixed plan with signal and device programs; it does not start robot moves from a concurrent program or replan against a moving conveyor.
- A `MOVE_MODEL` after robot completion remains kinematic and has no acceleration, swept collision, force, or contact simulation. Device time is quantized to logical ticks, while robot q is interpolated from planned samples.
- The UI originally capped concurrent execution at 1000 ticks. After this review, the root agent changed the cap to at least the robot plan's tick span plus 1000 ticks, so a long plan can reach `robot_done` even with a short tick setting. The full build and 127/127 suite passed after that change; the run remains bounded.
