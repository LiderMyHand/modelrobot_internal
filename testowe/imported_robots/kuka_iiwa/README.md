# KUKA LBR iiwa import fixture

This is the real seven-axis LBR iiwa model distributed with Bullet/PyBullet, originally generated from the ROS `rtkg/lbr_iiwa` description. It is an external model import fixture, not the app's synthetic classroom arm.

- Upstream repository: https://github.com/bulletphysics/bullet3
- Pinned revision: `d3afe76132fc76b0f9b2359cbaef47a3766e7fbb`
- Original file: `examples/pybullet/gym/pybullet_data/kuka_iiwa/model.urdf`
- Original model project: https://github.com/rtkg/lbr_iiwa
- License: BSD 2-Clause; full notice is preserved in `source.urdf`, `robot.urdf`, and `LICENSE.txt`.
- `provenance.json` contains exact source URLs and mesh SHA-256 checksums.

`source.urdf` is the untouched upstream expanded URDF. Its visuals refer to OBJ files, unsupported by the current app's local STL loader. `robot.urdf` changes only those eight visual filenames from `.obj` to the matching upstream `.stl` collision mesh. Joint hierarchy, frame origins, axes, limits, masses, inertias, and collision mesh references remain unchanged. The rendered surfaces therefore show the collision model, with less detail than the original OBJ visuals. No invented primitive robot substitutes for the source model.

To open it, select `robot.urdf` and all eight files in `meshes` together in Files → URDF and STL files, or select this folder. `notes/scripts/archive_kuka_iiwa.py` reproduces the archive. `notes/scripts/check_kuka_iiwa_browser.cjs` verifies local import and pendant jogging.

The upstream URDF sets every joint velocity limit to 10 rad/s, and effort limits to 300. These are the supplied simulation description values; they are not presented as current manufacturer ratings. The app's manual jog cap and chosen slow teaching inputs apply separately.
