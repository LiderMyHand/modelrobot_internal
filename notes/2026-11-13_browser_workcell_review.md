# Browser workcell review — 2026-11-13

## Scope and result

Read-only review of the SDF scene, full-pose IK, PTP/LIN/CIRC planner, synchronous collision scene, Worker snapshot, program player, and portable project flow. No high-priority blocker remains in the reviewed first-release scope. The demo and all 69 tests pass after the phone dock regression was fixed.

## Browser evidence

- Built both browser bundles with `npm run build`; `npm test` passed **69/69**.
- Chromium loaded the classroom `arm.urdf` and `world.sdf` with 8 links, 7 joints, and 4 scene objects. The robot and table are clearly visible in `notes/artifacts/browser_arm_scene.png`.
- PTP with a joint target and a 6D pose target, LIN to an FK-derived pose, and CIRC through FK-derived via/end poses all planned through the fetched `scripts/planning-worker.bundle.js`. PTP took 3.19 s of trajectory time, LIN 2.28 s, CIRC 0.63 s; browser planning calls each completed in under 200 ms for these small cases. Screenshots: `browser_movej_midpoint.png`, `browser_lin_midpoint.png`, `browser_circ_midpoint.png`.
- CIRC Play reached the final yaw near 0.2 rad and Reset returned to zero; Step advanced one timed sample. The UI controls and blue path preview rendered correctly.
- Equivalent `POSE ... Q 0 0 sin(0.1) cos(0.1)` and `POSE ... AA 0 0 1 0.2` inputs produced the same LIN duration, sample count, and endpoint joint vector within floating-point roundoff.
- A remote `GRAB pick_box` was correctly rejected with a line-numbered diagnostic: the object surface was 0.460 m from the TCP, above the 0.040 m threshold.
- The demo button loaded the classroom arm, world, and pick/CIRC/LIN/place source. Its Worker plan had 3 moves, 2 attachment events, 31.39 s duration, and 3281 timed samples. During browser seeking, the box was attached after GRAB, moved to `(0.660, 0.114, 1.104)` during transfer, released at `(0.840, -0.160, 0.785)`, and returned to its original pose after Reset. See `browser_demo_carry.png`.
- Downloaded `joint_trajectory.json` contained six joint names, world frame, positions/velocities/accelerations, and nanosecond time fields; first and last derivatives were zero. Downloaded project ZIP reopened through the file input and preserved robot, four scene objects, world name, and full program.
- No Chromium page errors in these flows.

## Regression found and resolved

The existing phone touch test failed after a content swipe: Chromium delivered pointer/touch events to `#joints-dock` but suppressed the synthetic click while inertial scrolling continued. `Workspace.select('joints')` therefore never ran. A touch pointer-up handler fixed this; the isolated test and full suite now pass. `notes/scripts/diagnose_phone_dock.cjs` reproduces the event sequence.

## Limits to keep explicit

- Collision checking samples joint edges and timed points; it is not a continuous swept-volume proof. Triangle geometry uses a 1 µm contact tolerance. Robot links visible without explicit URDF collision geometry fail planner preflight.
- Full-pose IK uses an in-repository damped least-squares solver for this release, behind an interface that can later accept an external solver. This differs from the earlier proposed external `closed-chain-ik` choice.
- SDF handling is a documented static/kinematic subset; dynamic physics, arbitrary frames, and unsupported model constructs are diagnosed rather than simulated. The workcell release plans one active URDF robot.
- Browser planning is offline through a Worker. Very large geometry/long paths can still incur snapshot transfer and memory costs, even though UI motion playback is responsive on the classroom fixture.

## Reproduction scripts

`notes/scripts/capture_browser.cjs` captures baseline and SDF/arm scene views. `notes/scripts/check_workcell_motion.cjs` exercises MOVEJ, LIN, CIRC, and GRAB diagnostics. `notes/scripts/check_workcell_project.cjs` exercises demo loading, attachment events, trajectory download, and ZIP roundtrip.

## Direct TCP and weld follow-up

- The new direct TCP form reads a selected link's world pose and writes an editable MOVEJ or MOVEL program. Chromium verified an axis-angle target with full 6D IK. A handoff issue was found: replanning from an intermediate displayed pose initially reset the old program before taking the new snapshot. The direct-pose path now preserves current robot and scene state; the regression verifies the next plan starts at yaw 0.2 rad and returns to home. Manual joint control invalidates playback and allows replanning from its new joint state. Both focused browser tests pass.
- Offline font scan found no external font import or URL. The manual-handoff browser test recorded zero external requests.
- Weld fixture `testowe/weld/` plans a PTP approach followed by CIRC and LIN seam moves in a browser Worker. Focused weld tests pass 4/4. The process export contains world-frame `WELD_ON`/`WELD_OFF` events, 940 circular and 299 linear timed TCP samples, and matching start/end times. Top-view screenshots `notes/artifacts/weld_top_review.png` and `weld_top_seam_only.png` show the orange seam alongside the blue TCP path. The seam preview renders a 3 mm radius tube centred on the exported TCP path for visibility; the process coordinates remain unchanged.
- Weld is a process-path annotation with sampled surface-distance preflight, not a thermal, force, or material-joining simulation.
- Manual pose-tool handoff was also checked at the midpoint of a planned move in Chromium after its current-state fix. Clicking the rendered forearm kept base yaw at 0.1 rad, cleared the old plan, and placed the target marker exactly at the clicked forearm centre `(0.53730, 0.05391, 0.95)`. See `notes/scripts/check_pose_handoff_review.cjs`.

## Weld join and orientation follow-up

- Focused planner and Chromium fixture tests passed 9/9 after the permanence guards. `WELD JOIN child parent` emits a timed event; a later GRAB carries the joined pair, and RELEASE of the parent leaves the child joined. Reset restores the original, unjoined scene. The browser test downloaded and reopened ZIP projects during carry (child → parent → robot) and after release (child → parent), verifying relations, world positions, and program text. `notes/artifacts/weld_join_carried.png` shows the assembly and visible orange seam with no page error; `notes/scripts/check_weld_join.cjs` reproduces the sequence.
- The planner rejects rejoining an already joined child (`WELD_ALREADY_JOINED`) and rejects direct GRAB/RELEASE of that child (`GRAB_JOINED`, `RELEASE_JOINED`). Collision checks exclude internal joined contact while retaining outside obstacle checks; model-parent cycles are rejected. No high-priority blocker was found. The `WELD_ALREADY_JOINED` wording should drop its suggestion to “release” the child, since that command is prohibited.
- Both the direct TCP form and DSL use `Q qx qy qz qw` or `AA ax ay az angle` in radians. They normalize quaternions and AA axes; a zero angle with zero axis maps to identity, while a nonzero angle with zero axis is rejected. At π, the axis sign is inherently ambiguous, so equivalent inputs may display different axis signs. Parser and browser tests cover Q/AA endpoint equivalence; a dedicated π boundary regression is still useful.
- Seam samples are checked against the named weld object's collision surface, and JOIN checks proximity to both objects at its event point. The implementation does not prove that every seam sample traces a shared interface between both objects.
