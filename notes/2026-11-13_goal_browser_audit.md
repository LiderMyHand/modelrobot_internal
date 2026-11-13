# Original workcell browser acceptance audit

Date: 2026-11-13. Scope: independently rerun the original student scenario in the current `modelrobot_internal` worktree. This note checks the visible browser behavior and export path; it does not treat the roadmap's status column as proof.

## Chromium evidence

`node notes/scripts/find_demo_program.cjs --check` passed with output in `notes/artifacts/goal_demo_check.json`. It loaded the six-axis URDF and SDF world, planned three moves in the browser Worker, and returned ordered `PTP`, `CIRC`, `LIN` plans with 2,295 timed samples over 11.995 s. The events are `GRAB pick_box` at 6.541 s and `RELEASE pick_box` at 11.995 s. After GRAB, the scene reports the box attached to `robot/classroom_six_axis_arm/link/tcp_link`; at the end it is detached near `(0.840,-0.160,0.785)` m. Reset restores `(0.420,0.160,0.765)` m. A deliberately remote GRAB fails with its source line and measured 0.516 m TCP-to-surface distance.

`notes/scripts/check_workcell_project.cjs` was rerun after updating a stale expected status string. I added assertions for the robot/world/object set, circular source, GRAB/RELEASE and carried box motion, trajectory content, Worker use, ZIP reopen, and zero page errors. A new suite gate, `tests/workcell-acceptance-browser.test.cjs`, runs this end-to-end check and passes 1/1. The latest run is in `notes/artifacts/goal_project_check.json`. It proves:

- The Workcell example button loads `classroom_six_axis_arm`, `pick_place_classroom`, and four SDF models.
- The box moves from `(0.420,0.160,0.765)` m to about `(0.760,0.011,1.097)` m while attached, then is released near the destination pad. The rendered carry state is visible in `notes/artifacts/browser_demo_carry.png`, which I inspected.
- `joint_trajectory.json` has world frame, six named joints, 2,295 points, position/velocity/acceleration arrays, nanosecond time fields, and zero endpoint derivatives.
- A downloaded 2,595-byte project ZIP reopens through the file input with the same robot, world name, four objects, and full movement source. The script waits for the explicit `Opened project pick_place_classroom.` status before asserting.
- The Worker bundle was requested and Chromium logged no page errors.

`node notes/scripts/check_manual_handoff.cjs` also passed. It blocks all nonlocal requests and still plans/replays from a local static server; `notes/artifacts/goal_offline_check.log` records zero external requests and zero page errors.

## Literal no-server launch

I separately opened `file:///media/duzy/robot_easy/modelrobot_internal/standalone.html` in ordinary Chromium with `node notes/scripts/check_file_launch.cjs`. It **did not initialize**: startup XHR for `testowe/pi_robot_urdf.xml?v=arm-collisions-20261106` was blocked by the browser's file-origin CORS policy. The exact request failure and page error are in `notes/artifacts/file_launch_default.json`. This is a current limitation if “without a server” means double-clicking the HTML file.

With Chromium's `--allow-file-access-from-files` flag, the same direct file launch loaded the URDF/SDF and planned the PTP/CIRC/LIN program in its Worker with 2,295 samples and no errors; `notes/artifacts/file_launch_allow.json`. This is a diagnostic experiment, not a normal user configuration. A local static server needs no Internet connection and satisfies offline browser use, but ordinary file opening currently fails.

## Commands and artifacts

```text
node notes/scripts/find_demo_program.cjs --check
node notes/scripts/check_manual_handoff.cjs
node --test tests/workcell-acceptance-browser.test.cjs
node notes/scripts/check_file_launch.cjs
node notes/scripts/check_file_launch.cjs --allow-file
```

The browser scripts are under `notes/scripts/`; JSON, screenshots, and logs are under `notes/artifacts/` as required by `AGENTS.md`. No app source or remote was changed by this audit.
