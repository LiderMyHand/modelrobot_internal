# External KUKA model import and control review

The real KUKA LBR iiwa seven-axis serial model is archived in `testowe/imported_robots/kuka_iiwa`. Source is the Bullet project's [expanded URDF](https://github.com/bulletphysics/bullet3/blob/d3afe76132fc76b0f9b2359cbaef47a3766e7fbb/examples/pybullet/gym/pybullet_data/kuka_iiwa/model.urdf), which attributes Robert Krug and Todor Stoyanov, Örebro University, and the original [ROS description](https://github.com/rtkg/lbr_iiwa). The embedded BSD 2-Clause notice and the original project's license are archived. The fixture README and `provenance.json` record exact changes and SHA-256 checksums.

## Adaptation and loader boundary

The untouched upstream `source.urdf` uses OBJ visuals and STL collisions. The browser currently loads local STL meshes only. `robot.urdf` therefore substitutes the upstream STL filename in each visual element. This changes visual detail but not the kinematics or collision model. All seven revolute joints, axes, transforms, URDF limits and inertial data remain verbatim. This is not a manufacturer-certified current model or a demonstration of general OBJ/DAE/xacro loading.

## Browser verification

`notes/scripts/check_kuka_iiwa_browser.cjs` starts a local HTTP server and imports the actual adapted URDF plus all eight STL files through the same Files input a student uses. A bent full-rank posture is set to `[0.2, 0.4, -0.2, -1.1, 0.3, 0.8, 0.2]` radians. It checks Joint J1+, World +Z, and Tool +X pendant buttons, no missing assets, seven-entry inverse-velocity output, and no browser exceptions. It also verifies the seventh axis paging and an unachievable straight-posture axial jog stays unchanged. Screenshots and numeric trace are written under `notes/artifacts/kuka_iiwa_*`.

Final integrated-build regression `node --test tests/kuka-import-browser.test.cjs` passed (26.6 s). All eight local meshes loaded with no warnings or page errors. An independent standard-library Python reference (`notes/scripts/kuka_fk_reference.py`) parses the untouched source XML and multiplies its URDF origins and axis rotations without importing app code; the browser's rendered link-7 matrix matched it exactly at the bent posture. That posture has rank 6/6, condition number 7.2428 at the declared 0.25 m characteristic length. World/Tool velocity residual components were about 1e-9. Joint J1 and paged J7 buttons both changed the intended joint.

At all-zero joint angles, the real model has rank 3/6. A World +Z request is blocked with explicit recovery guidance and the seven joint values stay exactly unchanged. Both successful and blocked-state screenshots were visually inspected. The straight arm extended above the current bent-posture camera; the probe now refits that posture before capturing it.

The extended programming trial passed on the integrated build (27.1 s total probe). It explicitly returns to the validated bent posture A, clicks Teach joint pose, pages to J7 and jogs from 0.20 to 0.22 rad, then clicks Teach joint pose again to record B. It explicitly restores A before `planCurrentProgram({preserveCurrentState:true})`, plans two MOVEJ commands, and runs the actual Play button to the player's finished state. All seven displayed joint values match recorded B to 1e-9. Reset restores A before exporting.

`notes/artifacts/kuka_iiwa_teaching.workcell.zip` is that tested two-target project, exported via `WorkcellUI.createProjectZip()`. It includes all eight meshes, the adapted real URDF, the bent A posture `[0.2,0.4,-0.2,-1.1,0.3,0.8,0.2]` radians, an empty SDF world, and the two recorded JOINTS/MOVEJ targets with matching robot and tool headers. The test reopens this ZIP through Workcell → Open project ZIP and checks that all eight meshes, the complete exact taught program and the exact A posture return. The recipient can open the ZIP, then Plan path → Play to repeat A→B. `kuka_iiwa_ready.png` shows this reopened route.

## Findings

- Import supports a real seven-axis chain and redundant velocity IK, rather than only the synthetic classroom six-axis fixture.
- Six fixed pendant rows initially hid J7; the root agent added joint-axis paging and the final probe exercises it.
- Upstream URDF limits are 10 rad/s for every axis; those simulation values are too fast as a default pendant teaching speed. The root agent added independent manual-jog caps. The source fixture keeps upstream limits intact for honest provenance.
- STL collision visuals render coarser surfaces than OBJ and do not show the source model's visual materials/textures. The model remains useful for kinematics, singularity, redundancy and teaching tests within this declared boundary.
