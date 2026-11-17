# Independent Astra review — educational robotics and pendant limits

Date: 2026-11-13. Scope: `frontend/planning/velocity-ik.js`, `jacobian-health.js`, `robot-model.js`, `frontend/motion-limits.js`, `frontend/workcell-ui.js`, `standalone.html`, the roadmap, and the education/workflow/state/pendant reviews. Initially read-only; after the numerical finding, the parent delegated the isolated jog integration repair described below. This is a source and executable numerical review, not an additional browser acceptance run. The parent agent is implementing further repairs concurrently; findings below describe the inspected one-Euler-step implementation, not an assertion that a later repair retains them.

## Overall assessment

The core frame conventions are sound. The Jacobian uses world-expressed TCP-origin linear and angular velocity; expressing a twist in the tool frame rotates both three-vectors at the same origin, correctly requiring no lever-arm translation term. The tool link can be any supported serial-chain tip; prismatic axes and a transformed robot base are handled consistently. A failed pendant solve or collision check does not commit its approximate joint state.

The recent educational repairs are substantive: a complete clean lesson, bent starting configuration, visible teaching-start reset, current-displayed-state planning, distinct persistent kinematic and plan state, separate program TOOL context, and recovery affordances. These correct the earlier semantic problems rather than only adding prose. The largest remaining mathematical weakness is turning an accurate *instantaneous* velocity solve into a potentially large finite Cartesian jog without checking its realized Cartesian motion.

## Prioritized findings

### P1 — A successful instantaneous solve can produce a substantially wrong finite Cartesian step

**Proven numerical defect in the inspected finite-step behavior.** `solveVelocity` evaluates the Jacobian once and returns `nextQ = q + dt*qdot`. `jogPendant` checks collision states along that straight joint segment, then applies its endpoint. It never compares endpoint FK with the requested Cartesian displacement/orientation. The displayed residual is the starting-pose velocity residual, not the finite-motion error.

`notes/scripts/check_astra_numerics.mjs` constructs a normal full-rank six-revolute serial chain using the same model convention as the existing velocity tests. At an allowed +Z request of 0.2 m/s for 0.25 s, with 2 rad/s joint bounds, the solver reports `solved`, translation residual 5.04e-7 m/s, angular residual 5.97e-7 rad/s, and `regular` health. The desired displacement is (0, 0, 50) mm. Endpoint FK is **(−3.77, +14.22, +25.61) mm**, with **28.48 mm endpoint error and 1.80° unintended rotation**. All starting and ending joints remain within the declared bounds. This probe proves the kinematic defect; it does not establish that this synthetic posture passes a particular scene's collisions.

**Repair:** integrate Cartesian requests in sufficiently small adaptive substeps with Jacobian updates, or solve/check an explicit incremental pose target. Validate the resulting FK motion, retain collision checks for each accepted substep, and reject or reduce the whole increment if declared Cartesian accuracy cannot be met. Reducing the input speed helps but is not a substitute for an error criterion. Show actual displacement as well as a local velocity residual. Regression: a large permitted jog on a bent 6R chain must preserve the commanded axis and orientation within declared tolerances.

### P1 — Speed-limit handling creates an avoidable stop/go cliff

**Proven behavior; primarily usability and task design.** The bounded solver returns a plausible best effort but the pendant rejects every status other than `solved`. A pure one-axis prismatic example at q=0.9999 m, upper=1 m, request=0.03 m/s, dt=0.1 s returns a bounded 0.001 m/s and nextQ=1 m, but the pendant applies nothing. Joint mode also rejects an entire increment that would slightly cross a position limit. The student must guess a smaller speed/duration to approach a bound. The message conflates velocity saturation and positional travel exhaustion, although those require different recovery.

**Repair:** distinguish rate and position constraints in the result. For a rate-limited *reachable direction*, reduce one common Cartesian speed scale and resolve/check it; report requested and applied speed plus the limiting joint. Do not simply apply arbitrary bounded DLS output: its residual can include motion in an unwanted Cartesian direction. For joint mode, a final clipped increment may stop exactly at a bound, with an explicit “joint limit reached” status and no overshoot. A zero available step must stop repetition. Approaching an outward position limit is not a singularity, and lowering speed cannot help once it is reached.

### P1 for general imported robots — The pendant cannot directly jog J7 and later axes

**Proven source limitation.** Joint names are collected for the complete TCP chain, but `updatePendantMode`, the HTML keypad, and `jogPendantJoint` allow only indices 0–5. The local imported KUKA iiwa file contains seven revolute axes. The existing rail-plus-six-axis teaching scenario also contains seven active axes. Their last joint can participate in Cartesian IK and programs but has no corresponding joint-mode recovery key.

**Repair:** page the six physical key rows or render joint-mode rows for every independent chain joint; retain exactly six Cartesian task rows. Display the actual joint name and type. Regression: import a seven-axis serial robot, jog the seventh joint using visible controls, and verify only the intended independent joint changes.

### P2 — Percent of URDF velocity is not a consistent teaching increment

**Proven arithmetic and imported-file evidence, not a claim about hardware ratings.** The imported `testowe/imported_robots/kuka_iiwa/robot.urdf` declares 10 rad/s for each joint. The default 20% and 0.1 s gives **0.2 rad / 11.46° per click**. The allowed 100%, 0.25 s gives 2.5 rad, which exceeds the current 100-sample collision-edge budget and is rejected. Both are unsurprising mathematically but make the same pendant feel very different across imported robots. The current six-axis classroom fixture hides this issue by using modest limits.

**Repair:** show resolved speed, units and increment beside the override; use a sensible angular/linear step cap or a separate small-increment mode for teaching. Keep simulation defaults and project overrides identifiable as such. Add a test with a realistic imported description whose declared velocity is high. Do not silently reinterpret the URDF value as a certified rating or invent a universal robot speed limit.

### P2 — Joint-bound input validation is weaker than its error message suggests

**Proven API corner case.** Position bounds are converted into next-step velocity bounds, and an initial out-of-range q is rejected only when those intervals do not overlap the rate interval. For a prismatic joint [0,1], q=1.000001, zero twist, dt=.1, limit=.25, the solver returns `solved`, qdot≈−1e-5 and nextQ=1. This silently moves on a nominal zero request instead of rejecting the invalid initial configuration. The ordinary UI generally prevents such a state, so this is lower priority than the visible jogging issues.

**Repair:** explicitly validate initial q against position limits, with a documented numerical tolerance, before solving. If an intentional recovery-from-invalid-state mode is desired, make it distinct from normal velocity IK. Test both a tiny tolerated roundoff excess and a materially invalid starting state.

## Correct limitations to retain and explain

- Jacobian rank and conditioning are configuration diagnostics, not feasibility guarantees for a finite move. Rank below `min(6,n)` can be structural for a planar or constrained imported mechanism; it does not prove an isolated singular configuration. The revised “reduced independent TCP motion” wording is appropriate.
- The default 0.25 m characteristic length and 0.02 singular-value ratio define an educational warning scale. They are not universal near-singularity boundaries. Mixed revolute/prismatic columns are explicitly normalized, so the diagnostic is dimensionally declared rather than silently mixing metres and radians.
- The bounded solver permanently clamps activated variables; it is a heuristic and does not establish a global constrained least-squares optimum for a redundant chain. A false failure is preferable to applying a direction-changing approximation, but this remains a robustness limitation for arbitrary imported robots.
- Hold repeats discrete kinematic increments, with an initial delay and browser timer scheduling. It is not an acceleration-controlled servo. Existing copy calls it repeated steps; do not present instantaneous speed limits as a wall-clock motor-speed guarantee.
- Collision checks remain sampled. A fixed angular sample increment is not a geometry-independent bound on swept clearance: long imported links can move farther between samples. This review found no continuous collision certificate and makes no such claim.
- TCP chains containing mimic joints or unsupported joint types fail explicitly; the review does not establish general graph/closed-loop IK support. The separate four-bar path is an explicit special mechanism.

## Use cases and acceptance criteria

| Use case | Learning objective | Acceptance evidence to add or retain |
|---|---|---|
| Teach A/B and replay | Destinations differ from the run's initial state | Visible first-lesson path, explicit reset to teaching start, planning preserves displayed state, successful playback and portable project export |
| World versus Tool jogging | Coordinate expression changes direction while TCP orientation remains controlled | Rotate the TCP, jog identical axes in both frames, compare realized finite FK displacement rather than only starting Jacobian residual |
| Approach a joint bound | Distinguish travel exhaustion from a singular posture | Direction-preserving slow approach or final joint clipped step; exact bound reached; further outward motion blocked; inward motion still works |
| Encounter a rate limit | Understand requested versus feasible motion speed | Slower same-direction jog, named limiting axis, applied rate visible, no accidental sideways or angular motion |
| Seven-axis imported arm | Understand redundancy and posture recovery | All seven joints individually reachable in the pendant; full-pose jog verified at a bent posture; source/project reopen preserves its state |
| Singularity lesson | Distinguish local loss of motion from ordinary limits | Persistent diagnostic, unchanged state on impossible direction, explicit Joint recovery, repeat the original request after changing posture |
| Compare PTP/LIN/CIRC | Relate interpolation choice to TCP geometry | Separate lesson after basic teaching; disclose that a finite velocity jog is not itself a LIN trajectory |

## Executed evidence

- `node --test tests/velocity-ik.test.cjs tests/jacobian-health.test.cjs tests/motion-limits.test.cjs`: **12 passed, 0 failed** on the reviewed version.
- `node notes/scripts/check_astra_numerics.mjs`: deterministic 1200-posture search; 852 solved pure-translation requests; worst example and near/outside-bound probes saved in `notes/artifacts/astra_numerics.json`.
- These passing unit tests prove the current local Jacobian and bound behavior. They do not cover the large finite-step error above, an imported seventh pendant key, or direction-preserving automatic speed reduction. Those should be targeted regressions for the next repair.

## Follow-up: finite jog repair implemented by this reviewer

At the parent's explicit request, added pure `frontend/planning/jog-integration.js` and `tests/jog-integration.test.cjs`. The helper `integrateJogVelocity(model,q,twist,options)` calls the parent's direction-preserving `solveJogVelocity` at intervals of at most 10 ms and recomputes FK/Jacobian after each accepted state. It halves a substep if realized FK exceeds the local linear/Euler and angular/exponential reference tolerance. The absolute tolerance is proportional to substep duration, plus 2% of requested translation/rotation, so adaptive subdivision does not multiply a fixed absolute allowance indefinitely.

The helper returns `samples` including the original configuration and each accepted configuration, with parallel `sampleTimes`. The UI must collision-check this actual joint polyline, not merely its start-to-end chord. All solver or integration failures return the original `nextQ` and initial-only samples; no partial integration may be applied. Integration itself has no UI or collision side effects.

`qdot` is the duration-averaged joint rate. `achieved`, `effectiveRequested`, and `residual` are time-weighted averages of the instantaneous velocity solves in the requested frame; in tool mode that expression frame moves with the TCP. They are explicitly **not** endpoint pose residuals. `speedScale` reports the minimum accepted scale and `averageSpeedScale` its duration average. Per-substep maximum FK errors are returned separately. This remains discrete kinematic control with local numerical error checks, not an exact LIN trajectory or a global continuous-accuracy certificate.

The original 0.25 s counterexample now fails atomically when it approaches a locally unavailable rate near a singular posture; it no longer jumps through that region. A 0.2 s request from the same posture succeeds with a mean speed scale of 0.425 and **0.364 mm endpoint position error** relative to its slowed desired displacement. The tests also verify each substep's joint rate bounds, direction-preserving speed backoff, atomic failure after internal progress, rotated-base tool translation, left-composed world angular rotation at a nonidentity TCP orientation, and rejection of an out-of-bounds starting state.

`node --test tests/jog-integration.test.cjs tests/velocity-ik.test.cjs tests/jacobian-health.test.cjs`: **17 passed, 0 failed**. The parent separately reports J7 paging, angular/prismatic manual-speed caps and explicit initial-bound validation; browser acceptance and UI integration are owned by the parent. The findings above are retained as the evidence for those repairs rather than silently removed.

### Browser regression diagnosis and verification

The first UI-integrated run exposed a floating-point endpoint defect in the new integrator. The exact classroom fixture at q=(0.23, −0.5, 0.8, 0.3, −0.4, 0.2), requesting World +Z at 0.03 m/s for 0.1 s, completed ten valid steps but accumulated time as `0.09999999999999999`. It then attempted a 1.4e-17 s residual step with an FK error tolerance below machine resolution and reported an accuracy failure. A new regression test parses the actual classroom URDF and reproduced `failedAtTime=0.09999999999999999` before the fix.

Repaired final-step selection to consume the remaining duration when it differs from 10 ms only by floating-point roundoff. Replaced `acos(dot)` orientation error with the relative quaternion's `2*atan2(vector_norm,abs(w))`, avoiding the former square-root-of-machine-epsilon small-angle noise floor. Physical tolerances were not relaxed. The fixture test now completes exactly ten steps, verifies World +Z endpoint error below 10 µm, and successfully follows it with Tool +X.

After `npm run build`, `node --test tests/teach-pendant-browser.test.cjs` passed **1/1** in Chromium (18.1 s), proving the fix in the integrated UI bundle, including world/tool jogging and teaching. The numerical suite above now passes **18/18** with the new fixture regression. No application source outside the delegated integration helper was changed by this reviewer for this fix.
