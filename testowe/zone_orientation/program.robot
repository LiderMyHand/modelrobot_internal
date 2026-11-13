# A two-line Cartesian corner with simultaneous TCP yaw change.
# Change ZONE 0.07 to ZONE 0 to restore an exact stop at corner.
ROBOT orientation_gantry
TOOL tcp_link
POSE corner world 0.4 0 0 AA 0 0 1 0.5
POSE finish world 0.4 0.2 0 AA 0 0 1 1.1
ZONE 0.07
MOVEL corner
MOVEL finish
