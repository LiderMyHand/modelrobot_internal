# Verified browser workcell program

Date: 2026-11-13. The runnable fixture consists of [`testowe/workcell/arm.urdf`](../testowe/workcell/arm.urdf), [`world.sdf`](../testowe/workcell/world.sdf), and [`program.txt`](../testowe/workcell/program.txt). The repeatable browser probe is [`notes/scripts/find_demo_program.cjs`](scripts/find_demo_program.cjs); its JSON evidence is [`notes/artifacts/demo_program_search.json`](artifacts/demo_program_search.json), with [planned view](artifacts/demo_program_search.png) and [placed-object view](artifacts/demo_program_placed.png). It loads the real standalone app and invokes its actual `WorkcellUI.planCurrentProgram()` and `ProgramPlayer.seek()`. It does not substitute a separate analytic calculation for the workcell planner.

## Program path

The program selects `classroom_six_axis_arm` and `tcp_link`. `MOVEJ pick` moves the TCP to (0.355, 0.16, 0.78) m beside the box. `GRAB pick_box` attaches the box to the TCP without changing its world pose. `MOVEC via place_approach` carries it along a circular TCP path through (0.60, 0.11, 1.12) m to (0.775, −0.16, 0.95) m, over the red obstacle. `MOVEL place` lowers to (0.775, −0.16, 0.80) m. `RELEASE pick_box` leaves the box on the green destination pad.

All pose orientations are the identity quaternion `(0,0,0,1)`, so this is a full-pose path with fixed TCP orientation. The box starts at (0.42, 0.16, 0.765) m. Its TCP-relative offset at grasp is approximately (+0.065, 0, −0.015) m; after release the measured box centre is (0.839917, −0.159991, 0.785023) m, placing its 0.08 m cube bottom at about 0.745 m, the destination pad top. A reset returns the box centre to (0.42, 0.16, 0.765) m.

## Actual planner and playback result

The browser Worker planner reported `Planned 3 move(s)` with no command diagnostics or JavaScript page errors. It generated 3 moves and 3,281 timed samples over 31.3918615 s: PTP 6.5411411 s, CIRC 23.8404698 s, and LIN 1.0102505 s. None reported an internal stop. GRAB occurs at 6.5411411 s; RELEASE occurs at 31.3918615 s. The playback probe confirms one attachment after GRAB, no attachment after RELEASE, `finished` at the end, and correct reset. The only workcell import warning is that dynamic physics for the pickable box is ignored; the box is moved kinematically.

The current `GRAB` preflight requires the TCP to be within 0.040 m of the object's collision surface. In the successful move, the measured TCP was (0.3549963, 0.1600081, 0.7800026) m and the distance to the axis-aligned 0.08 m box surface was 0.0250037 m. As a negative control, the same program with `MOVEJ pick` removed was rejected by the Worker planner at GRAB: `0.516 m from the TCP; bring the TCP within 0.040 m of its collision surface`. This checks that the successful fixture really exercises the proximity rule. The archived JSON contains both results; `node --test tests/workcell-demo.test.cjs` repeats the Chromium check. The regression uses a free local port so parallel test runs do not compete for a fixed port.

This verifies the current browser implementation on this fixture. The planner's sampled/adaptive collision validation is educational rather than a continuous safety certificate. The screenshot shows a blue TCP path and the box on the pad, but the JSON playback positions and event state are the stronger evidence for the scene interaction.
