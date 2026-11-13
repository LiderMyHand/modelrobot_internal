# Program and Workcell UX review (2026-11-13)

Scope: first-time path through the bundled pick-and-place workcell and six-axis teach pendant. Read `standalone.html`, `css/additional.css`, and `frontend/workcell-ui.js`; inspected `notes/artifacts/teach_pendant_joint.png`. No application code changed in this review.

## Findings

1. **Program errors are below the fold.** `#program-status` and `#program-diagnostics` come after the full direct-pose form, the full teach pendant, and a `#program-source` textarea with a 210 px minimum height. The Program panel alone scrolls; a planning error can be written correctly and remain invisible. Pendant errors appear below six keypad rows and several settings, which can also be offscreen. `#workcell-status` is similarly after the full SDF source textarea.
2. **Four workflows compete in one Program tab.** Direct pose, teach pendant, movement source/planning/playback, and three concurrent/device simulation sections are all expanded. The concurrent sections each have their own example loaders and run controls. In the available screenshot, the pendant alone consumes more than a viewport, hiding movement playback below it.
3. **Several controls replace different scopes of data without saying so.** Files → Open robot loads a URDF, Workcell → Load pick-and-place loads a URDF + SDF + movement program, Workcell → Open project ZIP loads the complete project, Workcell → SDF world file loads only the world, Program → Load conveyor scene + program also replaces a scene and signal program, and Program → Load shared-run/device-first examples replace robot/scene/program inputs. This makes it hard to predict what survives each load.
4. **The status does not identify the active source.** The viewer name shows the URDF robot name, but the workcell/project identity and whether collision geometry was validated are not near Program controls. `base_link` is a common name in both the bundled classroom arm (which has collision geometry) and the default Pi robot (which lacks it), so an error with that link name alone does not identify the active document.

## Minimal changes recommended

- Put a persistent, concise error/status banner at the top of the left panel or the viewer; include the active robot name and the action that failed. Keep local details beside each control. On failure, scroll/focus the relevant status if the control stays in a long section.
- Make the default Program path **Teach / Plan / Play**. Keep the pendant and movement program reachable at the top; use collapsible sections for direct pose entry, concurrent signals, shared timed run, and command-time run. Open an advanced section automatically when its example is loaded or when it contains errors.
- Move all "load example" operations that replace robot/scene to Workcell's examples area, or label them explicitly "Replace workcell with ..." if they must stay in Program. Present Workcell file operations as two clearly named modes: **Open a complete workcell** (ZIP/browser save) and **Edit the current workcell** (URDF in Files; SDF world here). Keep the existing formats and capabilities.
- Show the active robot and workcell names and a one-line workflow hint: **Load a workcell → jog/teach → plan → play → save**. A pick-and-place example should expose this route without requiring the user to understand signal clocks.

## Code locations

- `standalone.html`: `#panel-workcell`, `#panel-program`, `#program-status`, `#pendant-status`, signal/shared/trigger example controls.
- `frontend/workcell-ui.js`: `status`, `programStatus`, `pendantStatus`, `loadDemo`, `loadSharedExample`, `loadTriggeredExample`.
- `css/additional.css`: `.workspace-panel` scrolls, `#program-source` and `#signal-program-source` have 210 px minimum height, `#teach-pendant` is a large inline block.
