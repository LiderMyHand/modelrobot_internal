"""Archive vendor UR5 inputs and expand Xacro; run with xacro + PyYAML installed.

Usage: python prepare_official_ur5.py /path/to/Universal_Robots_ROS2_Description
The vendor checkout must contain urdf/, config/ur5/, meshes/ur5/collision/.
"""
from pathlib import Path
import copy
import json
import shutil
import subprocess
import struct
import sys
import tempfile
import xml.etree.ElementTree as ET
import xacro

source = Path(sys.argv[1]).resolve()
root = Path(__file__).resolve().parents[2]
out = root / 'notes/artifacts/official_ur5'
out.mkdir(parents=True, exist_ok=True)
for rel in ['urdf', 'config/ur5', 'meshes/ur5/collision']:
    shutil.copytree(source / rel, out / 'vendor' / rel, dirs_exist_ok=True)
for name in ['LICENSE', 'README.md']:
    shutil.copy2(source / name, out / 'vendor' / name)
commit = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
with tempfile.TemporaryDirectory(prefix='ur5_xacro_') as tmp:
    expanded_source = Path(tmp)
    shutil.copytree(out / 'vendor', expanded_source, dirs_exist_ok=True)
    for file in expanded_source.glob('urdf/**/*.xacro'):
        file.write_text(file.read_text().replace('$(find ur_description)', str(expanded_source)))
    document = xacro.process_file(str(expanded_source / 'urdf/ur.urdf.xacro'), mappings={
        'ur_type': 'ur5', 'name': 'official_ur5', 'smart_panel': 'false'})
    (out / 'expanded_vendor.urdf').write_text(document.toprettyxml(indent='  '))
robot = ET.fromstring((out / 'expanded_vendor.urdf').read_text())
for link in robot.findall('link'):
    collision = link.find('collision')
    for visual in link.findall('visual'):
        if collision is None:
            raise RuntimeError(f'Visual without collision: {link.get("name")}')
        visual.clear()
        for name in ['origin', 'geometry']:
            child = collision.find(name)
            if child is not None:
                visual.append(copy.deepcopy(child))
        material = ET.SubElement(visual, 'material', {'name': 'vendor_collision_surface'})
        ET.SubElement(material, 'color', {'rgba': '0.55 0.65 0.72 1'})
for mesh in robot.findall('.//mesh'):
    original = mesh.get('filename')
    name = Path(original).name
    mesh.set('filename', f'meshes/{name}')
    mesh_path = source / 'meshes/ur5/collision' / name
    (out / 'browser/meshes').mkdir(parents=True, exist_ok=True)
    shutil.copy2(mesh_path, out / 'browser/meshes' / name)
ET.indent(robot)
ET.ElementTree(robot).write(out / 'browser/robot.urdf', encoding='utf-8', xml_declaration=True)
(out / 'provenance.json').write_text(json.dumps({
    'repository': 'https://github.com/UniversalRobots/Universal_Robots_ROS2_Description',
    'branch': 'jazzy', 'commit': commit, 'model': 'ur5', 'license': 'BSD-3-Clause',
    'adaptation': 'Vendor collision STL geometry is also used as visible geometry. Kinematics, limits, collision geometry, inertias, and frame chain are preserved. Mesh URIs become local relative paths. No real-robot calibration is supplied.'}, indent=2) + '\n')
normals = []
for file in sorted((out / 'browser/meshes').glob('*.stl')):
    data = file.read_bytes()
    count = struct.unpack_from('<I', data, 80)[0]
    zeros = sum(all(value == 0 for value in struct.unpack_from('<3f', data, 84 + index * 50)) for index in range(count))
    normals.append({'file': file.name, 'triangles': count, 'zero_facet_normals': zeros})
(out / 'mesh_normals.json').write_text(json.dumps(normals, indent=2) + '\n')
print(out)
