# T20 command-time robot run review — 2026-11-13

## Scope and result

Read-only review of `RUN_ROBOT` parsing, concurrent scheduler, `triggered-clock.js`, `WorkcellUI` Worker and playback ownership, the device-first fixture, Chromium probe, screenshots, and JSON trace. **No release blocker found in the reviewed single-robot, fixed-scene path.**

I ran `node --test tests/triggered-clock.test.cjs tests/triggered-robot-browser.test.cjs tests/multi-program-language.test.cjs tests/multi-program-scheduler.test.cjs`: **31/31 passed**. I inspected `notes/artifacts/trigger_device_mid.png`, `trigger_robot_mid.png`, `trigger_final.png`, and `triggered_robot.json`. Chromium reported no page errors.

## What the evidence establishes

- The parser yields a typed, source-located `RUN_ROBOT` with no arguments. Standalone signal execution rejects it; the triggered runtime requires exactly one command and reserves `robot_done` against writes. The scheduler reads signals at tick start, commits at tick end, and rejects simultaneous robot requests or model writers atomically.
- The command-time clock freezes at the `RUN_ROBOT` tick boundary. A model move accepted in that tick appears in the scheduler state before the browser calls the Worker. The Worker snapshot in the probe has tray world X **0.65 m**, after the device moved it from **0.20 m**. A separate browser run proves the snapshot contains manually set base yaw **0.05 rad** rather than the home state.
- A fresh `ProgramPlayer` receives the Worker result. The robot stays at yaw zero through tray delivery, starts at simulation time **0.7 s**, moves on later ticks, and ends at **−0.15 rad**. The completion signal rises at the first tick boundary after the plan endpoint; the waiting program then sets `cycle_done`. Pause held the displayed pose and counters.
- Failure of the robot plan leaves the delivered tray at X **0.65 m** and the arm at its dispatch pose, with the `RUN_ROBOT` line and movement-source line in the diagnostic. A model move overlapping an active robot trajectory fails before that tick commits. Reset restores the original tray and joint state. A deliberately delayed Worker reply after Reset did not resume the discarded run. The ZIP reopened with the final physical poses and both source programs, with no running clock.
- The three screenshots show the expected tray, arm, and final poses without an obvious rendering defect. Their projections are subtle, so the numeric browser trace is the stronger motion evidence.

## Remaining limits and review observations

- The original browser controller called `createTriggeredClock` without `initialQ`, leaving the core's start-joint equality guard inactive. **Follow-up after this review:** the root agent now derives `initialQ` in the movement program's TCP chain order at Prepare and passes it to the clock. The changed-start Chromium probe asserts that 0.05 rad was captured and the Worker planned from the same joint state; the targeted browser test passed after the change.
- The feature intentionally rejects any `MOVE_MODEL` tick that overlaps the robot trajectory. Device sweeps while the arm is idle are not collision checked, and there is no simultaneous moving-obstacle planning. The UI text and core note describe this boundary.
- Attachment synchronization after GRAB, RELEASE, and WELD_JOIN has pure-clock tests; the new Chromium fixture has no attachment event. `captureSceneDevices` excludes attached models, and `syncTriggeredDevices` rebases detached model origins after robot completion. An end-to-end attach/release fixture would strengthen coverage before claiming that combination is browser-proven.
- One `RUN_ROBOT` per triggered run and one URDF robot are enforced. Project ZIP stores physical pose and source, not an in-progress controller checkpoint; the browser probe checks that reopen is idle.

## Follow-up: delivered workpiece and joint-start guard

I reviewed `testowe/multi_program/delivered_world.sdf`, `delivered.mprg`, `delivered.robot`, `notes/scripts/check_delivered_workpiece.cjs`, its browser test, JSON trace, and three screenshots. I reran `node --test tests/delivered-workpiece-browser.test.cjs tests/triggered-clock.test.cjs`: **11/11 passed**. This supersedes the two coverage observations above: the browser now tests GRAB/carry/RELEASE, and the UI now supplies `createRobotModel(...).initial` as `initialQ` for the core start-joint comparison. The selected tool is the first `TOOL` in the frozen movement source, matching the planner's first model construction; a later different tool is rejected by the planner.

At tick 1 the loose box is at X **0.255 m**, while the robot is idle. The four delivery ticks bring it to X **0.42 m**. `RUN_ROBOT` starts the Worker plan at simulation time **0.7 s** with the box at (0.42, 0.16, 0.765) m in the Worker snapshot. Its planned local GRAB and RELEASE event times are **6.541141 s** and **11.994723 s**. At global time **7.3 s** the box is attached to `robot/classroom_six_axis_arm/link/tcp_link`, and both `attachmentRecords()` and the Workcell object list show that relationship. It travels over 0.1 m while attached. At finish, it is detached at approximately (0.839917, −0.159991, 0.785023) m, consistent with the destination pad top; `robot_done=1` and `cycle_done=1`. Reset restores the original detached box pose (0.20, 0.16, 0.765) m and home robot joints. Chromium logged no page errors.

The delivery, carry, and placement screenshots match those numeric states. The Workcell object list update is supported by `ProgramPlayer`'s triggered `onTime` callback, which rerenders only when attachment records change. No blocker found in this follow-up. Device transport remains a direct kinematic pose change without collision checking along the device sweep or physical conveyor/contact simulation; the fixture note states this limit accurately.
