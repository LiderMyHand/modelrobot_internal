"""Independent standard-library URDF FK reference; no application imports."""
import json
import math
import sys
import xml.etree.ElementTree as ET

def eye():
    return [[float(i == j) for j in range(4)] for i in range(4)]

def multiply(a, b):
    return [[sum(a[i][k] * b[k][j] for k in range(4)) for j in range(4)] for i in range(4)]

def rotation(axis, angle):
    x, y, z = axis
    length = math.sqrt(x*x + y*y + z*z)
    x, y, z = x / length, y / length, z / length
    c, s, d = math.cos(angle), math.sin(angle), 1 - math.cos(angle)
    return [[c+x*x*d, x*y*d-z*s, x*z*d+y*s, 0],
            [y*x*d+z*s, c+y*y*d, y*z*d-x*s, 0],
            [z*x*d-y*s, z*y*d+x*s, c+z*z*d, 0], [0, 0, 0, 1]]

q = json.loads(sys.argv[1]) if len(sys.argv) > 1 else [.2, .4, -.2, -1.1, .3, .8, .2]
root = ET.parse('testowe/imported_robots/kuka_iiwa/source.urdf').getroot()
transform = eye()
for i, angle in enumerate(q):
    joint = root.find(f"joint[@name='lbr_iiwa_joint_{i + 1}']")
    origin = joint.find('origin')
    xyz = [float(value) for value in origin.get('xyz', '0 0 0').split()]
    r, p, y = [float(value) for value in origin.get('rpy', '0 0 0').split()]
    local = multiply(multiply(rotation([0, 0, 1], y), rotation([0, 1, 0], p)), rotation([1, 0, 0], r))
    for row in range(3):
        local[row][3] = xyz[row]
    axis = [float(value) for value in joint.find('axis').get('xyz').split()]
    transform = multiply(transform, multiply(local, rotation(axis, angle)))
print(json.dumps({'matrix_column_major': [transform[i][j] for j in range(4) for i in range(4)]}))
