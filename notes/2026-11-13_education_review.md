# Educational workflow review (2026-11-13)

Independent source review of `standalone.html`, `frontend/workcell-ui.js`, `frontend/planning/velocity-ik.js`, startup in `coffee/scene.litcoffee`, and the pick-and-place example. No application code changed by this reviewer.

## Findings to repair first

1. **P1: The first screen teaches the wrong entry point.** Startup selects the URDF editor and autoloads Pi, although Pi lacks the complete collision geometry required by the new Program workflow. A student interested in programming first sees robot source XML, then an unavailable planning path. The Workcell examples are a later tab. Give Program/Workcell a visible Start lesson action, and make the default lesson a planning-capable arm. If legacy Pi startup remains for viewer exercises, the initial view must state its purpose and offer a one-click route to a movement lesson.

2. **P1: There is no first-program routine.** Program shows an entire text language before a student has taught one point. The existing pick-and-place example mixes target coordinates, quaternion notation, joint-space travel, circular interpolation, straight interpolation, and attachment in fourteen uncommented command lines. Add a small explicit progression: load arm → new taught program → choose Joint/World/Tool → jog → record two targets → Plan → Play → Save project. Keep raw source available, but let the learner reach a working two-point motion without first learning POSE syntax. A New taught program action should retain the loaded robot/world and create the ROBOT/TOOL header.

3. **P1: A transient sentence is standing in for several different states.** `programStatus` is overwritten by pose reading, jogging, syntax checking, planning and playback. It cannot communicate whether the current plan is absent, invalidated, planning, ready, playing, paused or blocked while also keeping the last actionable error. Present persistent plan/playback state separately from the latest action result. Label the current robot pose and the program's planning start state; explicit mode changes should not erase a blocked-motion explanation.

4. **P1: Singular jog errors need a recovery instruction.** The solver's `Requested TCP twist is outside the local Jacobian range at this configuration` is technically useful to a developer but not an introduction to singularities. A rejected requested direction should say that the robot stayed still and give a concrete recovery: switch to Joint mode, bend the elbow or wrist away from alignment, then retry Cartesian jogging. Do not label every failure as singularity: joint-rate/position limits and collision failures are different lessons. Keep requested direction, failure category, and suggested next action visible together. The current rank output detects rank loss, not a calibrated near-singularity margin; avoid claiming a near-singularity gauge until the numerical diagnostic supports that statement.

5. **P1: Teaching lacks a visible start-pose contract.** `teachPendantTarget` appends the current pose as a destination. `planCurrentProgram` plans from the robot's displayed state, unless it is restoring a prior trajectory start. After jogging to A, recording A, jogging to B and recording B, the robot is at B when Plan is clicked: it first returns to A, then moves to B. That can be valid, but students may think A was stored as the initial state. State the contract beside teaching and planning, or capture an explicit program start when a new taught program is created. Show how Reset, manual jog and replanning affect that start. This is a semantics issue, not only layout.

6. **P2: Collision display and motion validation look like one switch.** The viewer checkbox says Collisions, while pendant/program motion checks collision geometry regardless of that checkbox. Rename it to Show overlap warnings or equivalent and state beside the motion state that planning/jog collision checks stay active. This distinction matters when a student switches off a visual overlay and still sees blocked motion.

7. **P2: Direct pose entry replaces the entire program.** The button says Replace program, but it sits alongside teaching, which appends. Beginners may lose their recorded sequence while exploring an alternative way to enter a target. Prefer an Add pose target action for the ordinary teaching route; retain Replace program as a distinct advanced action. At minimum preserve a recoverable prior source and explain the effect at the button.

8. **P2: State labels should use student-level units and words.** The successful jog reports twist residuals in scientific notation and the feedback dumps all joint values into one line. Lead with direction and actual step, e.g. Tool +X, moved 3 mm; place numerical residuals under diagnostics. State metres/radians beside the editor and translation/rotation units beside jog controls. Keep quaternion/axis-angle detail in the pose tool rather than the first workflow.

## Teaching use cases and boundaries

| Lesson | Supported use | What students must be told |
|---|---|---|
| Frames and jogging | Compare Joint, World and Tool actions at a rotated TCP | Tool axes rotate with TCP; Cartesian requests can be impossible in a local configuration. |
| Teach and replay | Capture named destinations, plan and replay PTP motion | A destination is not an initial pose; planning start must be explicit. |
| Path geometry | Compare PTP, LIN and CIRC on the classroom workcell | PTP may detour; LIN/CIRC preserve requested geometric paths and can fail. |
| Reachability and singularity | Observe blocked Cartesian directions and recover with joint motion | Rate limits, rank loss, joint limits and collisions are distinct causes. |
| Pick and place | GRAB/RELEASE changes rigid attachment relationships | It is kinematic scene manipulation; there is no contact/friction simulation. |
| Blending | Compare exact stops with positive ZONE | Radius is positional in metres; orientation has a separate bound. |
| Automation | Signal handshake and sequential device/robot actions | These belong in a later lesson; current device motion cannot overlap active robot motion. |

## Minimal information architecture

Make the first route Start / Teach / Run, with a small visible next action. Preserve robot and world import/edit tools as setup, source and motion details as advanced tools, and concurrent device programming as its own later lesson. Collapsing several large sections is helpful, but it does not substitute for a starting task, explicit state and a completion criterion.

Suggested first lesson completion criterion: the student records two distinct targets, previews a path connecting them, plays it, changes one target or frame, and saves a portable workcell. An automated browser acceptance should perform this sequence from the initial page using visible controls and assert that a blocked jog leaves the state unchanged and explains recovery.

## Review of proposed repair

The root implementation proposal adds Start programming, a Program lesson card, an inspectable pick-and-place demo, and a clean arm/empty-world lesson with a bent initial configuration. This is a useful minimal route. The clean lesson should open the pendant, put the next action above the source, and expose source as an optional view of the commands the student just created. Validate the bent configuration as collision-clear and useful for the lesson directions; a bent pose alone is not proof that the Jacobian has full rank.

The two-point lesson still needs an explicit start-state rule. If the lesson captures the initial state, label it Program start and restore it when previewing the newly taught sequence. If it retains current-state planning, say that planning starts at the displayed pose and that replay first travels to the first taught destination. Either is teachable; silently switching behavior after a manual jog is not.

### Short lesson copy

- **First movement:** Start a clean lesson. Record the current pose as your first target. Jog one joint or move the TCP in World or Tool coordinates. Record a second target. Plan the path, inspect its blue preview, and Play. Save the complete workcell to return later.
- **Read a robot program:** Load pick-and-place. Identify MOVEJ, MOVEC, MOVEL, GRAB and RELEASE. Predict the TCP path and the moment the workpiece becomes attached; then plan and step through the sequence.
- **Explore a blocked direction:** Move the arm toward an aligned configuration. Request a Cartesian direction that becomes unavailable. Observe the unchanged robot and the reason, switch to Joint mode to bend the arm away from alignment, and retry the same Cartesian direction.

For the first lesson, success is a visible two-point motion and a saved workcell. For the second, success is explaining why PTP can change its route while LIN/CIRC retain their path. For the third, success is distinguishing a singular direction from a joint bound or collision and choosing a recovery action.

## Follow-up review of implemented lesson

Reviewed `loadTeachingLesson`, the lesson card, persistent lifecycle/condition elements, and `notes/artifacts/learning_workflow.png`. The first route is materially clearer: Start programming is visible in the header, Teach two poses loads a clean complete workcell, the arm starts bent, the source can collapse, and the sequence says how to record and replay A/B. Keeping the source inspectable connects generated commands to the student's physical actions.

The implementation explicitly exposes a teaching-start reset. The root is relabelling it as a reset because it applies a configuration immediately rather than following a planned return path. A canceled demo load must not announce Example ready; the root is also correcting that branch.

The earlier source review found that replanning could restore an old trajectory start while copy claimed it used the displayed pose. The root reports that `planCurrentProgram` now defaults to `preserveCurrentState=true`, source edits invalidate with `restoreStart:false`, and a browser regression edits at mid-playback and checks that the displayed q remains the planning start. This resolves the relevant semantic conflict rather than merely changing the prose.

One minor educational wording improvement remains: the main banner's `Jog TCP: full local motion rank` is a mathematical diagnostic. Lead with `Cartesian motion available` and explain rank under details, or use `Six independent TCP directions available here` when rank is six. This should remain a local kinematic statement rather than a promise that every finite move is feasible.

No additional fundamental first-lesson workflow blocker was found in this follow-up review. The larger outstanding product questions are the earlier advanced pose replacement and the number of separate advanced run modes; they can be addressed after the two-point lesson has been tried by a learner.
