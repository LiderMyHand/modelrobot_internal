"""Archive Bullet's BSD-licensed expanded KUKA iiwa URDF and STL meshes."""
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

def fetch(url):
    return urlopen(Request(url, headers={"User-Agent": "modelrobot-educational-review"})).read()

target = Path('testowe/imported_robots/kuka_iiwa')
target.mkdir(parents=True, exist_ok=True)
revision = 'd3afe76132fc76b0f9b2359cbaef47a3766e7fbb'
base = f'https://raw.githubusercontent.com/bulletphysics/bullet3/{revision}/examples/pybullet/gym/pybullet_data/kuka_iiwa/'
source = fetch(base + 'model.urdf')
(target / 'source.urdf').write_bytes(source)
license_url = 'https://raw.githubusercontent.com/rtkg/lbr_iiwa/master/license.dat'
(target / 'LICENSE.txt').write_bytes(fetch(license_url))
root = ET.fromstring(source)
paths = sorted({mesh.get('filename') for mesh in root.findall('.//collision/geometry/mesh')})
manifest = {'repository': 'https://github.com/bulletphysics/bullet3', 'revision': revision,
            'source_url': base + 'model.urdf', 'license': 'BSD-2-Clause (full notice embedded in source.urdf)',
            'source_sha256': hashlib.sha256(source).hexdigest(),
            'original_license_url': license_url,
            'files': []}
for path in paths:
    data = fetch(base + path)
    destination = target / path
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(data)
    manifest['files'].append({'path': path, 'url': base + path, 'sha256': hashlib.sha256(data).hexdigest()})
# The app supports STL, while the original visual elements use OBJ. Retain the
# upstream collision STL surfaces as visuals without altering kinematics.
browser = source.decode()
for i in range(8):
    browser = browser.replace(f'meshes/link_{i}.obj', f'meshes/link_{i}.stl')
(target / 'robot.urdf').write_text(browser)
manifest['browser_sha256'] = hashlib.sha256(browser.encode()).hexdigest()
manifest['browser_adaptation'] = 'Visual OBJ filenames changed to matching upstream collision STL filenames only.'
(target / 'provenance.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({'revision': revision, 'mesh_count': len(paths), 'target': str(target)}))
