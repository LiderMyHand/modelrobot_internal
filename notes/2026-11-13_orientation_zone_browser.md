# Browser proof of orientation-changing Cartesian ZONE — 2026-11-13

The [orientable gantry fixture](../testowe/zone_orientation/program.robot) has world-frame axis–angle targets at yaw 0.5 and 1.1 rad, with two straight TCP moves meeting at (0.4, 0, 0) m. It uses [a three-axis URDF](../testowe/zone_orientation/robot.urdf): X and Y slides plus a visible orange wrist yaw marker. Chromium loads that robot and the weld-classroom SDF plates, plans `ZONE 0` and `ZONE 0.07`, and seeks the actual `ProgramPlayer` to the logical command boundary. The parser converts the AA targets to normalized quaternions before the planner; this is the same SO(3) target representation used by Q input.

```mermaid
flowchart LR
  S[Start: yaw 0] -->|exact LIN| A[Entry cut]
  A -->|position Bézier plus SO3 C1 rotation| B[Exit cut]
  B -->|exact LIN| E[Finish: yaw 1.1 rad]
  W[Nominal corner: yaw 0.5 rad] -. skipped inside 0.07 m ball .-> A
  W -. skipped inside 0.07 m ball .-> B
```

`tests/orientation-zone-browser.test.cjs` records the following Worker-planned results. With `ZONE 0`, the command boundary is (X, Y, yaw) ≈ **(0.399991 m, 0 m, 0.49982 rad)** with zero joint velocity. With `ZONE 0.07`, the flyby boundary is ≈ **(0.390156 m, 0.009843 m, 0.522943 rad)** with nonzero slide and wrist velocities; the wrist changes orientation as it passes the corner. The maximum **sampled realized** TCP waypoint distance is **0.052501 m**, below 0.07 m. The conservative angular-speed bound is **0.5193 rad/s**, below the default **1 rad/s** cap; the blend's cut-to-cut relative orientation is **0.223125 rad**. ROS-shaped trajectory timestamps strictly increase. Chromium reported no page errors. The positive-ZONE plan took **6.499 s** versus **2.666 s** at the exact stop, reflecting the conservative first implementation.

The numeric [trace](artifacts/orientation_zone_browser.json) and top-view [exact-stop](artifacts/orientation_zone_stopped.png) and [orientation flyby](artifacts/orientation_zone_blended.png) screenshots are archived. I inspected both scene screenshots: the gantry, SDF plates, and orange wrist are rendered; the source shows AA targets and the respective ZONE value. The screenshot difference is subtle at this scale, so the sampled joint states, angular-speed metadata, and player seek are the quantitative proof. The [SO(3) method note](2026-11-13_cartesian_zone_orientation.md) states the body-rate and frame conventions.

The position curve has a continuous waypoint-ball bound, and the declared orientation splice matches body angular rate at its cuts. The realized robot trajectory, collision checks, and browser interpolation are sampled approximations; the app does not claim continuous collision certification or exact SO(3) spline playback.
