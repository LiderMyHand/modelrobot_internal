# Independent workflow and state review — 2026-11-13

Scope: `standalone.html`, `frontend/workcell-ui.js`, roadmap, and the recorded pick-and-place browser screenshot. This is a source and visual review; no application files were edited.

## Findings in priority order

1. **There is no coherent first program path.** Startup loads the Pi viewer example, which the app itself says lacks planning collision geometry, and initially shows the URDF editor. Program then presents raw text and a collapsed pendant, without an action that creates a blank program for the selected robot. A learner must infer that Workcell replaces the robot and scene, open a finished demonstration, decide how to discard it, open the pendant, jog, and understand that teaching appends to the existing demonstration. Repair: expose a short Start/Teach/Plan/Run route with distinct **Try pick-and-place demonstration** and **Create my movement** actions. Creating a movement should generate the active ROBOT/TOOL header and an explicit starting target, then open the pendant. Name what each next action does.

2. **The current robot condition, current action result, and plan validity share one message.** `programStatus()` receives syntax success, pose read success, jog failure, planning results, player pause, and completion. A syntax check can replace an actionable motion error without changing the robot pose. Mode selection replaces pendant feedback with instructions. This is a state model problem, not just lack of color. Repair: keep persistent separate displays for (a) robot control condition and recovery, (b) program/plan state such as Edited/Planning/Ready/Running/Paused/Finished, and (c) the latest action outcome. A successful syntax check must never imply that a trajectory is feasible.

3. **A taught sequence has no explained starting configuration.** Jogging invalidates the plan and preserves the displayed pose. Teaching appends MOVEJ targets. Planning then snapshots the current pose. If students teach A then B while ending at B, the plan starts at B and first moves back to A. This can be mathematically correct but surprising, particularly around obstacles and after GRAB/RELEASE. Repair: explicitly show “Planning starts from the current displayed pose,” provide a deliberate **Set program start / Return to start** control or record a starter joint target, and preserve that contract during teach/edit/replan. Avoid silently moving the robot on Plan.

4. **The TCP selector has two apparent meanings.** `pose-target-link` configures pendant/direct-pose operations, whereas program motion uses the source's TOOL command. Changing the selector calls `readCurrentTCP()` and refreshes pendant joints but does not change TOOL in the source. Teaching then rejects a mismatch. Repair: label the selector **Jog/teach TCP**, display the program's TOOL beside it, and offer a deliberate source update; alternatively use one synchronized active tool model with a clear program-change state.

5. **Singularity recovery is invisible in the primary workflow.** A velocity-IK failure is shown as a transient sentence, while the robot still looks ordinary. A student cannot distinguish a direction that is unavailable at the current pose from missing collision geometry, a joint limit, or a program syntax error. Repair: persistent severity and cause category, an explanation that singularity is configuration/direction dependent, and an action such as **Switch to Joint mode**. A near-singular warning must be based on a defined Jacobian diagnostic; a residual alone does not prove singularity. Keep technical residuals in expandable diagnostics.

6. **The visible Collisions toggle has unclear scope.** The viewer checkbox enables advisory warnings; pendant and planned motion still enforce collision checks independently. The UI can suggest that toggling Collisions controls motion blocking. Repair: rename it **Show collision warnings**, and state beside motion readiness that planning checks explicit collision geometry regardless of the display toggle.

7. **Progressive disclosure is only a partial improvement.** The current screenshot is shorter, but the first surface still foregrounds raw source, target quaternion data, exports, and all legacy tabs. Exports are secondary to teaching. Repair: make the normal workspace a task view with a brief lesson card, pendant/targets, program editor, then Plan/Run; place data exports, URDF editing, manual SDF, and concurrent clocks in advanced tools. Retain the legacy functions without presenting each as an equal first step.

## Educational use cases worth keeping distinct

- **Frame lesson:** jog the same physical TCP in Joint, World, and Tool modes; show the selected axes and compare observed motion.
- **Teach a sequence:** make a new program, record a start and two waypoints, plan, step, replay, then save the whole workcell.
- **Path lesson:** compare MOVEJ, MOVEL, and MOVEC between documented reachable targets; visualize the TCP path and explicitly explain why LIN/CIRC can fail while PTP succeeds.
- **Constraint lesson:** approach a joint limit or singular pose, observe the diagnostic, and recover with joint jogging. Do not call every solver failure a singularity.
- **Advanced cell lesson:** add GRAB/RELEASE, then devices/concurrent signals after the single-robot sequence is understood.

The core math and strict collision-geometry contract are useful teaching choices. The fundamental mistakes found here are the absence of a guided starting workflow and the merging of persistent state with transient messages. A wholesale solver replacement is not supported by this review.

## Suggested acceptance check for repairs

A fresh browser student can choose a valid teaching arm, create a new movement without editing ROBOT/TOOL syntax, jog and teach two targets, understand where replay starts, see a blocked or infeasible jog with a concrete recovery action, and obtain a planned path and playback without opening advanced controls. A syntax success must leave any unresolved robot-condition warning visible. Verify this in the browser at a normal laptop viewport.

## Repair verification support

After the application moved trajectory/process exports into a collapsed tools disclosure, `notes/scripts/check_workcell_project.cjs`, `check_weld_fixture.cjs`, and `check_weld_review.cjs` now explicitly open the export button's ancestor `details` before clicking. This preserves real visible-button download coverage rather than bypassing the UI with a direct download method. `node --test tests/weld-fixture.test.cjs tests/workcell-acceptance-browser.test.cjs` passed 2/2 on the revised layout (17.6 seconds), including CIRC/LIN weld JSON and circular pick/place trajectory/project ZIP exports. No application files were edited for this support task.

After planning was corrected to start from the current displayed pose, the stopped/blended comparison scripts (`check_cartesian_zone_browser.cjs`, `check_orientation_zone_browser.cjs`, `check_multicorner_zone_browser.cjs`, `check_zone_blend.cjs`) explicitly call `player.reset()` before changing the program source and replanning. Thus both zone settings still compare identical starts without relying on Plan to rewind the scene. Assertions are unchanged. The pick-place UI script uses `#program-pendant-details > summary` to select the outer disclosure after adding a nested diagnostics disclosure. The five corresponding browser tests passed 5/5 (32.0 seconds).
