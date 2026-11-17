# Official Universal Robots UR5 browser trial — 2026-11-13

## Source and archived files

Primary source: [UniversalRobots/Universal_Robots_ROS2_Description](https://github.com/UniversalRobots/Universal_Robots_ROS2_Description), `jazzy` branch, pinned commit `3852128295499b52f38f82171f5ff3f21ecdfa22`. This is the vendor's ROS 2 description package. Its README identifies UR5 description and meshes as BSD-3-Clause (the specially restricted newer model meshes are not used here).

Archive: `notes/artifacts/official_ur5/` contains the original URDF/Xacro inputs, UR5 configuration, seven collision STLs, README and LICENSE under `vendor/`; `expanded_vendor.urdf` is the expanded unadapted description. `provenance.json` records the source and adaptations.

The browser supports STL, but the vendor's visual meshes use DAE. Therefore `browser/robot.urdf` deliberately uses the vendor's collision STL surfaces as both visuals and collision geometry and rewrites mesh URIs to local relative paths. The original joint/frame chain, origins, limits, inertias, and collision meshes are preserved. This is an actual vendor UR5 kinematic model with simplified displayed surfaces, not a new primitive robot relabeled UR5. Default factory kinematic parameters are used; no physical robot's calibration is supplied.

Reproduce preparation with `notes/scripts/prepare_official_ur5.py /path/to/vendor/checkout` in Python with `xacro` and `PyYAML` installed. For the browser, select `browser/robot.urdf` and all seven `browser/meshes/*.stl` files together in Files → Open local files.

For the simplest student entry, open **Workcell → Open project ZIP → `notes/artifacts/official_ur5/ur5_teaching.workcell.zip`**. This archive was created with `ui.createProjectZip()` from the actual browser after successful joint/World/Tool jogging and teaching/playback. It contains all seven local STL assets, the adapted URDF, empty SDF world, the validated bent starting configuration, and a working two-target program with matching `ROBOT official_ur5` / `TOOL tool0` headers. The browser trial reopens it through the project file input and asserts exact joint-state/program restoration, seven assets, and zero collision-asset issues. `ur5_project_reopened.png` was inspected after this round trip. The complete import/jog/teach/plan/play/export/reopen regression passed in 23.4 seconds.

The teaching part records joint target A through the actual pendant button, performs a small positive Joint1 jog to B, and records B through the button. It explicitly restores the displayed joints to A, clicks Plan path, verifies that the first planned sample equals A, clicks Play, waits for `finished`, and verifies the final joints equal B within `1e-8` radians. Reset restores A before ZIP export, so the archive reopens at the documented movement start. `browser_trial.json` includes the complete taught source, A/B values, planned start/end/duration, and final playback values. This exercises a real imported model's full programming route, not only direct solver calls.

## Actual import and jogging

`notes/scripts/check_official_ur5_browser.cjs` starts an isolated HTTP server and Chromium, imports files through the file input, selects `tool0`, and applies a documented initial six-joint configuration `[-0.4, -1, 1.4, -1.5, -1.2, 0.3]` rad. It then clicks the pendant's joint +J1, World +Z, and Tool +X controls. All three move the robot and run the existing sampled collision checks. World +Z requests 3 mm and achieves approximately 3.002 mm; the small second-order difference comes from integrating a differential velocity solve for a finite step. Tool +X likewise changes the joint chain while retaining orientation to the velocity solver's tolerance. This trial does not certify complete-workspace IK or continuous collision safety.

Evidence: `browser_trial.json`, `ur5_browser.png`, and `trial_stdout.log` in the archive. The screenshot was visually inspected after import: all arm solids render as the vendor's simplified triangular surfaces. `tests/official-ur5-browser.test.cjs` passed (10.5 s), asserting all seven imported mesh normals are finite and nonzero, all three jog modes change joints, and no browser errors or collision asset issues occur.

The unadapted vendor URDF is also imported first. The application explicitly reports seven unsupported DAE visual meshes; its collision STL assets resolve. This is a supported-format limitation, not a missing robot solver. That failure is recorded rather than hidden.

## Real import defect found and repaired

The vendor STL files for shoulder, upper arm, forearm, and all three wrists store zero facet normals on every triangle; base STL has valid normals. `mesh_normals.json` records counts directly from binary STL bytes. Before repair, STLLoader preserved the zero normals and six of the robot's seven meshes rendered nearly black (`ur5_browser_before_normals.png`).

`frontend/local-robots.js` now validates imported normal arrays and recomputes triangle normals from vertex winding if normals are absent, mismatched, nonfinite, or zero. This is applied in the common STL parsing path, so preview and cached collision geometry share consistent geometry. Positions, triangle topology, source files, and mesh scale are unchanged. The real UR5 browser regression checks recovered normals and the inspected post-repair screenshot demonstrates the visible result.

## Further integration work suggested

- Provide a documented Xacro expansion/import preparation route; raw ROS description packages are not flat URDF files.
- Support DAE or GLTF conversion if faithful colored vendor visual meshes are needed. The current STL adaptation is clear and functional but visually faceted.
- A robot-specific nonsingular starting configuration and selected tool frame help students begin; vendor zero joint states can be singular and should not be presented as universally ready for Cartesian control.
- Async saved-robot status can briefly show the prior robot's save message during import. Active robot/world state must remain the authoritative identity display.
