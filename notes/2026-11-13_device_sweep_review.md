# Review: precommit `MOVE_MODEL` collision sweep

Date: 2026-11-13. Scope: read-only review of `createSceneDeviceCollisionQuery` and its signal, shared, and triggered browser integration. Before the follow-up fix, I ran `node --test tests/device-swept-collision.test.cjs tests/device-sweep-browser.test.cjs tests/device-motion-browser.test.cjs tests/shared-clock-browser.test.cjs tests/triggered-robot-browser.test.cjs`: **9/9 passed**. After the fix, the focused sweep/browser pair passed **8/8**. I inspected `notes/artifacts/device_sweep_signal_blocked.png` and `notes/artifacts/device_sweep_triggered_blocked.png`, plus `notes/artifacts/device_sweep_browser.json`. The screenshots show the tray at its prior pose and a source-line error after the sweep finds the wall at 40% of the tick. No Chromium page errors were reported.

## Confirmed behavior

- The query constructs detached collision records from explicit SDF and URDF shapes, translates all moved models at common fractions, and checks relative motion. It includes a rigid SDF descendant or robot shape parented under a moved model. It does not mutate the live scene. The default is 5 mm relative translation per sample with a 2000-step cap; therefore it is a sampled collision check, not a continuous swept-volume proof.
- `workcell-ui.validateDeviceTransition` runs before `applySceneDevices` in the signal lab, shared clock, and triggered clock. Shared Play steps and validates each full tick in a loop before advancing to a fractional display time, so a long animation frame does not skip device validation. Triggered rejection leaves its logical tick uncommitted. Signal diagnostics now retain `DEVICE_COLLISION`, program, model, and source line; shared and triggered retain code/program/line.
- The query synchronizes simultaneous different-model moves. The focused unit test has two boxes crossing in opposite directions; the result identifies both. The browser test verifies the wall crossing is rejected in all three modes.

## Found and resolved: a carried object blocked an unrelated device

The first implementation iterated **every** name in the scheduler's `fromDevices` map and required each model to be detached and at the recorded start coordinate. The triggered clock retains the original device map after a robot GRAB, while `captureSceneDevices` omits the now-attached object. If the robot kept that object and a later program moved another model, the sweep rejected the unrelated move before checking collision.

I reproduced this directly with a `SceneModel`: load movable `held` at X=0 and `tray` at X=1, attach `held` to `world`, then request a sweep from `{held:[0,0,0], tray:[1,0,0]}` to `{held:[0,0,0], tray:[1.1,0,0]}`. The query throws `Device held must be a detached, nonstatic SDF model.` The same mechanism applies to a tool-held object whose scheduler coordinate is stale. This contradicts the intended sequential robot/device workflow even when the move is collision-free.

The implementation agent changed the query to validate detachment and current origin only for models whose proposed XYZ actually changes. Unchanged attached models retain their collision shapes at the live scene transform. The new unit test proves a clear unrelated move succeeds and a command directly trying to move the held model still fails. I independently checked a tray sweep from X=0 to X=1 past an unchanged tool-held box at X=0.5; it returned a collision against `model/held/link/body` at fraction 0.405. This blocked held-object case should also become a permanent regression. A full triggered browser sequence with GRAB retained through a later device move would further prove the clock integration, beyond the direct query test.

## Smaller follow-ups

- The new unit test now covers a detached device sweeping into a stationary robot link. The mounted-robot test covers the opposite arrangement.
- `sample_budget` now identifies the pair that determines sample density and returns its moving model(s). With two simultaneous moves, the UI still chooses the first event if the pair has two models; a whole-tick diagnostic would be clearer than assigning sole blame to that event.
- Constructing all collision BVHs on every device tick is potentially expensive for mesh-heavy scenes. A cached detached snapshot or Worker query would be a later performance improvement; current behavior remains bounded by the sample budget but not by shape-construction cost.
