# Kinematic device-motion review — 2026-11-13

## Verdict and evidence

Read-only review found no blocker in the narrow T18 `MOVE_MODEL` integration. I ran `node --test tests/multi-program-language.test.cjs tests/multi-program-scheduler.test.cjs tests/device-motion.test.cjs tests/device-motion-browser.test.cjs`: **19/19 passed**. I inspected the Chromium [mid-move](artifacts/device_motion_mid.png) and [final](artifacts/device_motion_final.png) screenshots and [pose trace](artifacts/device_motion.json). The tray's SDF world X is 0.2000 m initially, 0.3125 m after the first of four movement ticks, 0.6500 m at completion, 0.2000 m after Reset, and 0.6500 m after reopening the completed-scene ZIP. Y, Z, orientation, and the static conveyor remain unchanged; there were no page errors.

## Correctness checks

- `frontend/multi-program-language.js` parses `MOVE_MODEL model X|Y|Z absolute-world-coordinate TICKS n` into a distinct typed command with a one-based source line. Its finite-decimal and positive-safe-integer checks reject expression-like coordinates and malformed ticks without evaluating text.
- `frontend/multi-program-scheduler.js` holds a move on its program counter for exactly `n` logical ticks, starting from the device coordinate at dispatch. A following SET runs on the next tick. Same-model commands from two programs in one tick return an atomic `DEVICE_WRITE_CONFLICT` with both source locations; different model names can advance together. In-progress motion counts as progress, so an unrelated WAIT does not cause a false deadlock.
- `frontend/device-motion.js` captures only detached `<static>false</static>` SDF models. It validates the whole target map before changing any object, converts absolute world XYZ to the object's parent-local position, and preserves orientation. A unit test covers a rotated parent and rejected static/attached models.
- `WorkcellUI` invalidates a stale robot plan before starting a device program, applies each scheduler tick to the scene, and caches the run's initial device poses for Reset. Applying a new SDF, opening a ZIP, loading a demo, or editing source clears the signal state. Source editing intentionally makes the current scene pose the next baseline; the UI says this. ZIP saves the current SDF pose and editable signal source, then reopens with no scheduler tick or in-flight move, which the browser test verifies.
- The panel says a model moves kinematically along one world axis over logical ticks and that robot motion remains in the separate movement program. [Implementation note](2026-11-13_device_motion.md) explicitly excludes acceleration, collision checking for device sweeps, real-time duration, contact dynamics, and physical I/O. These claims match the code.

## Limits and useful follow-up

- **Run** loops up to 1000 logical ticks synchronously on the UI thread. It applies each intermediate pose internally, but the browser generally paints only after the loop; **Step tick** is the control that visibly demonstrates intermediate positions. This is consistent with the stated absence of a tick-to-seconds clock, but the interface should not be described as real-time animated conveyor playback.
- Browser evidence covers one movable tray, Reset, and completed-scene ZIP reopen. Unit tests cover conflict, static/attached rejection, and rotated-parent transforms. A future integration test should exercise multiple movable models and scene replacement while a move is in progress if those become teaching scenarios.
- A ZIP archives the final SDF position and source, not the current scheduler PC, tick, signals, or moving state. Re-running an absolute `MOVE_MODEL` after reopening a completed-scene ZIP can therefore be a zero-displacement move; this is documented and does not break the saved scene.
