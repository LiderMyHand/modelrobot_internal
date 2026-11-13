# Constrained four-bar integration

## Representation and control

The fixture at `testowe/four_bar/` is a valid URDF **tree** cut at one revolute pin. The optional project entry `kinematic-constraints.json` declares the planar four-bar branch, three joint names, and the two endpoint links. This is a local extension, not standard URDF loop syntax. The independent coordinate is the input angle `theta`; the coupler and output joint values are solved from circle intersection at every state.

The Worker receives the descriptor in its serializable planning snapshot. `frontend/four-bar-plan.js` dispatches constrained programs separately from the serial planner. `MOVEJ` accepts a `JOINTS` target naming only the driver, or a full TCP pose on the one-dimensional mechanism manifold. PTP search, collision queries, timing, ROS-style trajectory export, and `ProgramPlayer` samples all use `[theta]`. The browser's `applyNamedJointState` expands `[theta]` to `[theta, phi-theta, psi]` on every playback seek, including times between stored samples. The path preview uses `fourBarPose` rather than serial-chain FK.

The collision adapter passes the expanded three-joint state to the existing URDF/SDF collision scene. Each PTP edge samples the driver by at most 0.005 rad and each expanded joint by at most 0.02 rad between adjacent checks. The same expansion guards timed samples. This is a sampled collision check; it does not claim continuous collision detection.

The declared cut pin links `C_left` and `C_right` form one intentional closure contact pair in robot self-collision checks. That exact pair is exempted; the parent bars and all scene collisions remain checked. A unit fixture gives both tip links overlapping small spheres and verifies the constrained planner accepts the closed pin.

All three joint velocity and acceleration limits affect timing. `timeParameterize` first generates a smooth driver trace; a global time scale is then increased until the passive velocities and accelerations, computed by the closure chain rule, satisfy their URDF/project limits at timed samples. This is conservative for the checked samples, with no physical dynamics or contact model.

The saved project stores only the independent driver position in `robot-state.json` and the branch/topology descriptor in `kinematic-constraints.json`. Import validates the descriptor, URDF topology and geometry, limits, and saved state before replacing the active scene. The rendered input slider drives closure; passive sliders are disabled. The legacy drag pose tool is disabled for this constrained robot because its serial CCD update would break closure. The movement pose panel remains available for constrained full-pose IK.

## Orientation convention

Pose targets are position plus normalized `xyzw` quaternion internally. The mini language accepts `Q qx qy qz qw` and `AA ax ay az angle` (radians), converting both to the same rotation. IK compares quaternions through a shortest rotation-vector residual; LIN/CIRC use quaternion SLERP. A pose does not encode extra full turns. The four-bar's branch and input angle are joint/mechanism state, separate from the TCP quaternion.

## Deliberate command boundary

This first constrained path supports `ROBOT`, one `TOOL` at a closure endpoint, `MOVEJ`, `PAUSE`, `GRAB`, `RELEASE`, and `ZONE 0`. `MOVEL`, `MOVEC`, welding, and positive-ZONE blending return source-located diagnostics for a constrained four-bar. A generic Cartesian line or circle is generally off the one-dimensional four-bar manifold. The existing serial-robot implementations of these commands remain available.

## Verification

`tests/four-bar.test.cjs` checks closure, branch, joint limits, passive derivatives, and full-pose IK. `tests/four-bar-plan.test.cjs` verifies direct/Worker agreement, driver-only trajectory, closure of all timed states and between-sample interpolation, plus invalid targets. Project/ZIP and Chromium evidence are recorded in the portable and review notes and under `notes/artifacts/`.

No on-screen closure residual marker is shown yet. Normal UI and planner paths always derive the passive values from the independent input; the Chromium test measures the two rendered endpoint world positions directly.
