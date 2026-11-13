# T21 sequential `RUN_ROBOT` review — 2026-11-13

Read-only review of `frontend/triggered-clock.js`, the browser controller in `frontend/workcell-ui.js`, the two-request fixture and probe, screenshots, and JSON trace. I ran `node --test tests/triggered-clock.test.cjs tests/triggered-robot-browser.test.cjs` (**15/15 passed**) and `node --test tests/two-request-browser.test.cjs` (**1/1 passed**). No browser page errors were recorded. I inspected the between-requests, second-plan, and final screenshots.

## Confirmed behavior

- The clock accepts multiple requests in sequence. Its first `robot_done` becomes 1 after the first endpoint; the second `RUN_ROBOT` clears it to 0 at its commit boundary. The second plan starts with the first plan's final joint vector. A request during an active robot trajectory returns source-located `ROBOT_BUSY` without committing that tick. Two requests in one scheduler tick return atomic `ROBOT_REQUEST_CONFLICT`.
- The browser probe captured two actual Worker requests: `(tray X, base yaw) = (0.50 m, 0 rad)` and `(0.65 m, 0.05 rad)`. The second request uses a new `ProgramPlayer`, with an `initialWorld` snapshot whose tray X is 0.65 m. The frozen movement source is replanned at each request from the then-current scene and joints.
- The trace has the first request at tick 3, an intervening tray position 0.575 m at tick 17 while `robot_done=1`, and the second request at tick 19 with `robot_done=0`. At tick 34 the run is finished with `robot_done=1`, `cycle_done=1`, tray X 0.65 m, and base yaw 0.05 rad. Reset returns tick zero, tray X 0.20 m, and base yaw zero. The screenshots agree with those static poses, though the yaw changes are visually subtle.

## Evidence and semantic limits

- **No implementation blocker found.** The browser probe does not yet sample a nonzero intermediate yaw *during the second trajectory*. The fixture begins and ends that trajectory at 0.05 rad, so its current screenshots and final assertion would also pass if the second player did not visibly animate. The core test does assert an intermediate second-plan joint value; one browser midpoint assertion would close the visual evidence gap.
- `robot_done` is a single level signal, read from tick-start state. In a different multi-program script, a `WAIT_SET robot_done` in another program on the same tick as the second `RUN_ROBOT` could consume the previous run's 1 before the request clears it at tick end. The sequential fixture avoids this by issuing the second wait in a later tick. Programs needing cross-program attribution should handshake around re-arming or use per-request completion epochs in a future design.
- Device motion remains prohibited during an active robot trajectory. The two-request fixture moves the tray only between plans. Its passing result does not establish moving-obstacle planning or device-sweep collision validation.

## Follow-up: second-run motion proof

The Chromium probe now records `secondMid` at tick 22 (time **2.2 s**) with base yaw **−0.040306 rad**, while the second run is `moving`, tray X remains **0.65 m**, and `robot_done=0`. This differs from the second run's start and end yaw of **0.05 rad**, so it closes the previous browser-motion evidence gap. The new `two_request_second_motion.png` screenshot is consistent with the numeric trace. I reran `node --test tests/two-request-browser.test.cjs`; it passed. The tick-start level-signal race above is also accurately disclosed in `notes/2026-11-13_multi_request_browser.md` and `notes/2026-11-13_multi_request_clock.md`; it is a scripting synchronization condition, not a contradiction in the current sequential fixture.
