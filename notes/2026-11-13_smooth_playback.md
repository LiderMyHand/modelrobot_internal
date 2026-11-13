# Timed trajectory replay fidelity

Date: 2026-11-13. This amends the older notes that described browser replay as piecewise linear.

`frontend/planning/timing.js` computes timed samples with joint position, velocity, and acceleration. `frontend/timed-joints.js` now evaluates a quintic Hermite polynomial between each adjacent sample, matching all three quantities at both ends. `ProgramPlayer`, the shared clock, and the triggered clock retain the derivative arrays and use the same evaluator. Legacy q-only sample fixtures continue to use linear interpolation.

For a segment of duration $h$ and normalized time $u=(t-t_0)/h$, the polynomial is $q(u)=c_0+c_1u+\cdots+c_5u^5$. Its six boundary conditions are $(q,\dot q,\ddot q)$ at $t_0$ and $t_1$. Neighboring segments share the same stored boundary derivatives, so displayed motion is $C^2$ at the timed knots (up to floating-point error). The player still derives passive four-bar joint positions from the independent input after interpolation, preserving loop closure at fractional times.

The time parameterizer checks the same interpolant at 25%, 50%, and 75% of each output interval. It retimes when joint velocity or acceleration exceeds a limit there, and checks joint position, collision state/edges, and Cartesian FK residual against the reference. The four-bar planner additionally scales time using passive chain-rule velocities and accelerations at those interior fractions. These are dense sampled checks, not analytic continuous collision or extrema certificates.

The PTP `ZONE` splice validator also checks the replay polynomial at those interior fractions, including waypoint/TCP deviation, joint limits, and collision edges. Its original stopped-path comparison now evaluates that path with the same timed interpolant rather than a linear approximation.

Evidence: `tests/timed-joints.test.cjs` checks boundary position/velocity/acceleration, $C^2$ continuity, player fractional replay, and matching shared/triggered clock states. `tests/four-bar-plan.test.cjs` checks passive limits at interior replay fractions. In ordinary Chromium opened directly from `file://`, `notes/scripts/check_file_launch.cjs` clicks the classroom example, plans PTP/CIRC/LIN, seeks a non-sample time, and finds the displayed first joint equals the quintic value $0.9538714681$ rad; linear interpolation there would be $0.9538070089$ rad. The trace is `notes/artifacts/file_launch_default.json`.
