# Program workflow and collision message UX (2026-11-13)

## Reported problem

The user saw `Planning collision geometry missing for visible link base_link`, while the Program panel hid status messages and offered many apparently competing load controls.

## Reproduction and diagnosis

- Chromium probe: Workcell → Load pick-and-place example, then Program → World +Z pendant jog. Active robot and loaded URDF were both `classroom_six_axis_arm`. Its `base_link` has an explicit collision box, and the jog succeeded.
- The original Program status began at viewport y≈2021, and pendant status at y≈1470, below a 900px browser viewport. The problem was clear even when the error text itself was accurate.
- The bundled `pi_robot` default has a visible `base_link` but no collision element on that link. The collision parser can therefore report that exact link name for Pi. It now includes the robot name and a repair hint.
- This does **not** establish which robot was active in the user's earlier browser tab. The Program banner now displays the active robot and SDF world whenever a status appears, so the next occurrence can be identified.

## UI changes

- Program starts with a sticky robot/world status banner, TCP selector, movement source, Plan/Play controls, and export buttons. The status stays visible while scrolling. Pendant errors are also copied into the top banner.
- Pendant, direct pose IK, and concurrent device controls are expandable sections. The pendant can still detach and dock; docking reopens its section.
- Workcell explains the two open paths: a complete ZIP/browser workcell, or manual URDF + SDF + program. Complete project controls now appear above the manual SDF editor. Advanced Program example loaders remain in the collapsed device section and explicitly say they replace parts of the scene or program.
- Files labels the Pi and similar robots as robot viewing examples, explaining that Pi lacks complete planning collision geometry. The initial Pi model remains available for the older URDF viewer and joint slider exercises; planning and pendant lessons start from a Workcell example.

## Browser evidence

- `notes/scripts/check_pick_place_ui.cjs` exercises the exact pick-and-place button, checks the loaded URDF's base collision geometry, jogs World +Z, and checks that a deliberately invalid program error appears in the visible top banner.
- `notes/artifacts/pick_place_ui_probe.json` records active robot/world names and screen coordinates.
- `notes/artifacts/pick_place_workcell.png`, `pick_place_program_before.png`, and `pick_place_program_error.png` show the workcell, compact Program path, and visible error.
- `tests/program-ux-browser.test.cjs` runs the browser probe in an isolated local server. `npm test` passed 221/221; final log is `notes/artifacts/test_program_ux_final.log`.

## Ongoing scope

The Pi robot's missing planning collisions are a property of its URDF. This UI work does not synthesize collision shapes from visuals, which would change the collision model without the author's geometry choices.
