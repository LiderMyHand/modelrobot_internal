# Browser signal lab review — 2026-11-13

## Result

Read-only review found no blocker in the signal-only lab. `node --test tests/multi-program-language.test.cjs tests/multi-program-scheduler.test.cjs tests/signal-lab-browser.test.cjs tests/project-bundle.test.cjs` passed **16/16**. I inspected [the Chromium screenshot](artifacts/signal_lab.png) and the archived [trace](artifacts/signal_lab.json). The example runs two named counters through a six-tick handshake, with both signals cleared at completion and no page error. The browser test also checks step, run, ZIP download/reopen, replay from tick zero, and a rejected JavaScript-like input.

## Code and claim checks

- `frontend/multi-program-language.js` accepts only `PROGRAM`/`END`, numeric `SET`, and three typed WAIT forms. It uses finite decimal parsing, safe positive integer timeout ticks, a restricted name pattern, and no expression evaluator. Invalid source produces one-based line diagnostics; `ok` is required before scheduling. The UI renders diagnostics and trace via `textContent`.
- `frontend/multi-program-scheduler.js` sorts program names for deterministic visitation. Waits read the start-of-tick signal snapshot; writes become visible next tick. Same-tick duplicate writes fail atomically. Untimed all-waiting states deadlock, timed waits reach logical timeout, and `runMultiProgram` has a 1000-tick UI bound.
- The panel and [implementation note](2026-11-13_signal_lab_ui.md) explicitly state that these programs do not move the robot, conveyor, scene objects, or physical I/O. There is no scheduler-to-motion adapter yet. The separate single-robot movement program remains in control of robot playback.
- `signal-programs.mrl` is an optional, fixed-path project ZIP entry. Import restores editable text without running it or restoring a prior tick, signal map, or trace. Old ZIPs open with an empty signal editor. The project ZIP test and Chromium round trip cover this path.

## Nonblocking follow-up

Runtime scheduler diagnostics for timeout, deadlock, and conflicting writes identify program/PC/signal but omit command source `line`, although typed commands and trace events already carry it. Adding the source line to those diagnostics would make the UI's runtime errors as actionable as its parser errors.

**Follow-up:** Runtime timeout, deadlock, and conflicting-write diagnostics now include source lines. The later T-18 implementation also adds typed `MOVE_MODEL` motion and a separate [review](2026-11-13_device_motion_review.md). This note records the earlier signal-only review state.
