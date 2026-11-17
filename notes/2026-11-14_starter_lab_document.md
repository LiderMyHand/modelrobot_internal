# Polish MyModelRobot starter laboratory guide

The user requested a standalone Polish LaTeX/PDF exercise guide, inspired pedagogically by the linked PŁ laboratory instruction, and explicitly requested application repairs if valid exercises fail. The delivered guide teaches only MyModelRobot; it contains no comparison chapter or requirement to know EASY-ROB. The inspiration is acknowledged briefly in the final references.

## Deliverables

- `notes/artifacts/starter_lab_pl/mymodelrobot_cwiczenia.pdf`: nine A4 pages.
- `notes/artifacts/starter_lab_pl/main.tex`: editable source with original TikZ diagrams and current application screenshots.
- `notes/artifacts/mymodelrobot_cwiczenia_pakiet.zip`: portable source, figures, PDF, exercise source files, four ready project ZIPs, model license notices, build script, README and SHA-256 manifest.
- Archived inspiration: `references/stanowisko_c_easy_rob_2026.pdf` from the user-provided URL. Its 24 pages were read through extracted text. The packet does not redistribute that PDF.

## Scope

Seven numbered exercises cover Joint/World/Tool, two-pose teaching, LIN/CIRC geometry, restricted/singular posture and speed feedback, pick-and-place, obstacle diagnosis, and project persistence with optional KUKA/UR5. The first six form the basic approximately90-minute session. Each has purpose, procedure, acceptance criterion and conceptual question. A final quick reference and proposed20-point assessment rubric help the instructor. UI labels follow the EN interface while prose is Polish. Units are metres/radians, quaternion order xyzw; a wrap in a printed long JOINTS command is explicitly distinguished from a logical source newline.

## Executed checks and application repair

The classroom, KUKA and UR5 teaching paths reuse the current verified browser workflows. An independent exercise agent implemented `notes/scripts/check_starter_lab_paths.cjs` and executed the exact new triangle/arc sequence and via-height variant, Plan and Play. Both succeed. A static box at the required circular via causes state-validation rejection with robot state unchanged; reloading the example restores a valid plan. Moving GRAB before the pick approach passes syntax but correctly fails grasp-distance preflight (0.483m versus0.040m requirement). The valid pick-and-place replans successfully.

This exposed an application diagnostic defect: `ik-pose.js` returned status collision with the vague reason `disallowed configuration`. The reason now explicitly identifies rejection by collision/state validation, without changing the solver or tolerances. A regression asserts status and message; planner/collision tests pass22/22. Details, screenshots and complete log: `notes/2026-11-14_starter_lab_paths_validation.md` and `notes/artifacts/starter_lab_pl/validation.log`.

## Build and visual QA

`bash notes/scripts/build_starter_lab.sh` runs pdfLaTeX twice. Poppler renders were inspected across all nine pages, with individual checks of command tables, code, geometry diagrams, screenshots and page footer. Overflow in two initial tables was repaired; the final build has no overfull boxes or unresolved references. Polish glyph extraction is correct. `python3 notes/scripts/package_starter_lab.py` extracts the bundle into a separate temporary directory, rebuilds using only relative local assets, and verifies nine pages, identical extracted text and key content. Rendering helper: `notes/scripts/render_starter_lab.py`.

No remote was pushed for this documentation/diagnostic repair.
