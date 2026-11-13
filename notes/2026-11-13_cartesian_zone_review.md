# Cartesian ZONE review — 2026-11-13

Read-only review of the constant-orientation LIN/CIRC pair implementation, tests, Chromium trace and screenshots, help text, and implementation notes. I ran the five focused planning/program suites plus `tests/cartesian-zone-browser.test.cjs` after the review fixes: **32/32 passed**. Chromium reported no page errors.

## Verified

- The quintic Bézier controls implement the stated entry and exit position, tangent, and curvature constraints. With the implementation's nominal travel coordinate $\xi$ and blend span $h$, derivatives $hT$ and $h^2K$ give a C2 **declared TCP position reference** at both cuts. The control-point ball check is a valid continuous sufficient bound on that reference. Positive projection of every control-polygon edge along the entry-to-exit chord is a conservative continuous forward-progress certificate.
- The composite path keeps exact nominal LIN/CIRC references outside the cuts. Its required fractions include entry, logical boundary, exit, and each inbound/outbound CIRC via. Focused tests cover all four pair types and a long arc; timed integration tests find the via positions in the output. The actual IK and playback follow these references within sampled tolerances, rather than mathematically exactly.
- Pair planning occurs before any later GRAB changes the collision scene. A blend-only obstacle yields `ZONE_COLLISION` on the ZONE source line; changing orientation, active weld, and a requested three-move Cartesian run yield typed source-line failures. I found one outbound-target source-location gap, reported it, and verified the promptly applied fix: collinear second `MOVEC` now returns `CARTESIAN_TARGET` on its own line.
- The Worker result contains plain trajectory and blend records; the nonserializable path closure stays inside planning. Direct and reconstructed Worker planning return identical samples in the focused test. The browser test uses the actual Worker, seeks `ProgramPlayer` to the logical boundary, and checks strict ROS nanosecond stamps.
- In the Chromium LIN→LIN fixture, `ZONE 0` reaches (0.399991, 0) m with zero boundary velocity in 2.647 s. `ZONE 0.07` passes (0.390155, 0.009842) m with nonzero joint velocity, a 0.052505 m **sampled realized** maximum waypoint distance, and 6.395 s duration. The screenshots show the gantry and top view, but the centimetre-scale difference is not visually decisive; the numeric trace is the stronger evidence.

## Scope and one API concern

The notes and product help accurately separate continuous containment of the **declared Bézier curve** from sampled/adaptive FK, velocity, acceleration, and collision checks on the realized trajectory. They do not claim continuous mesh-collision certification or exact spline playback. The composite parameter is nominal travel distance, not the transition's actual arclength; the implementation note describes this as a travel coordinate.

During review I found an API override that could forward `options.timing.allowInternalStops=true` into the generic segmentwise fallback, contrary to the pair's no-internal-stop contract. The planning agent fixed both timing attempts to force `allowInternalStops:false`, rejects any unexpected `timed.internalStops`, and added an override regression. I rechecked the code and focused tests; **no remaining blocker found**.
