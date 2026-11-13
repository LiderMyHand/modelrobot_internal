# Orientation-changing Cartesian ZONE pairs

Date: 2026-11-13. This extends the [constant-orientation Cartesian pair](2026-11-13_cartesian_zone_core.md) in the browser workcell. It defines our own `ZONE r` behavior; EASY-ROB's numeric ZONE law remains unknown. `ZONE r` is a **world-position** deviation ball of radius `r` metres around the skipped waypoint. It is not an angular tolerance. The exact-stop default, pair eligibility, event barriers, CIRC via retention, and three-command rejection remain as before.

## Frames and rotation convention

Each pose quaternion maps TCP coordinates to world coordinates (Three.js `[x,y,z,w]`). LIN orientation is shortest-arc SLERP from start to end. CIRC orientation is shortest-arc SLERP from start to via, then via to end. The transition chooses the shortest relative rotation between its cut **endpoint** orientations: if their quaternion dot product is negative, it negates one quaternion before taking the logarithm. At an exact 180-degree tie, the input quaternion sign resolves the branch deterministically. Endpoint tangent constraints can make the whole transition longer than the endpoint geodesic; “shortest arc” refers to the relative endpoint branch, not every intermediate segment.

```mermaid
flowchart LR
  A[Exact inbound LIN/CIRC pose path] --> B[Entry pose A: position and body angular rate]
  B --> C[Position Bézier + SO(3) rotation-vector transition]
  C --> D[Exit pose B: position and body angular rate]
  D --> E[Exact outbound LIN/CIRC pose path]
  V[Inbound/outbound CIRC via poses] -. remain exact required samples .-> A
  V -. remain exact required samples .-> E
```

Let $q_A,q_B$ be unit quaternions representing the cut orientations, $h=d_{\mathrm{in}}+d_{\mathrm{out}}$ the transition's path-coordinate span, and $\omega_A,\omega_B\in\mathbb R^3$ the **body-frame** angular derivatives of the retained paths per metre of that coordinate. Define $\Delta=\log(q_A^{-1}q_B)$ as a rotation vector on the shortest endpoint branch and $q(u)=q_A\exp(\phi(u))$, $0\le u\le1$. A cubic rotation-vector Bézier curve has controls

\[
C_0=0,\quad C_1=\tfrac{h}{3}\omega_A,\quad
C_2=\Delta-\tfrac{h}{3}J_r(\Delta)^{-1}\omega_B,\quad C_3=\Delta.
\]

Here $J_r$ is the SO(3) right Jacobian, satisfying $\omega_{\mathrm{body}}=J_r(\phi)\,d\phi/d\ell$. These controls make orientation and body angular derivative continuous at both cuts in the shared affine path coordinate. The existing fifth-degree position curve remains C2 at its cuts. The planned orientation transition is C1; angular acceleration continuity is not asserted. CIRC via orientations and positions are exact required samples outside the cuts. If the original CIRC's two SLERP angular rates differ at its via, that original angular-rate jump is retained rather than altered.

## Rate bound and feasibility

The derivative of the cubic rotation-vector curve lies in the convex hull of its three derivative controls $3(C_{i+1}-C_i)$. The SO(3) right Jacobian has operator norm at most one, so their maximum norm divided by $h$ bounds transition body angular rate per metre. We also include the exact LIN/CIRC segment rates. The global quintic clock has $\max ds/dt=1.875/T$, so

\[
\|\omega(t)\|\le 1.875\,L\,\omega_{\ell,\max}/T,
\]

where $L$ is the pair's path-coordinate length. `planCartesianZonePair` raises its minimum duration until this conservative bound is at most `planningOptions.cartesianZone.maxAngularSpeed` (default `1` rad/s). A nonpositive or nonfinite cap is invalid. The returned `maxAngularSpeedBound` is this bound, not a measured peak; `orientationTransitionAngle` is the shortest relative cut rotation angle in radians. Slower angular caps may increase cycle time. Joint velocity and acceleration checks still govern the same timed pair.

The planner samples the declared 6D TCP path, runs seeded IK, checks position and orientation FK residuals, collision states and adaptive joint edges, and retries denser samples if timed joint interpolation misses the reference. Entry, logical boundary, exit, and CIRC via fractions are retained exactly. An infeasible orientation, obstacle, limit, or geometry residual causes a source-line `ZONE_INFEASIBLE` or `ZONE_COLLISION`; it does not silently substitute a stop. The ball bound applies continuously to the **declared position curve**. Collision and joint/FK checks remain sampled or adaptive, not a continuous certificate. **2026-11-13 amendment:** browser playback uses derivative-matched quintic joint interpolation; see `notes/2026-11-13_smooth_playback.md`.

## Verification

`node --test tests/planning-cartesian-zone.test.cjs tests/program-cartesian-zone.test.cjs` covers shortest-branch sign invariance, noncommuting body-rate matching, exact retained path and via orientations, angular and joint limits, slower-cap retiming, timed required fractions, unreachable orientation diagnostics, and direct/Worker agreement. The source is in `frontend/planning/orientation.js`, `paths.js`, `cartesian-zone.js`, and `program-plan.js`.
