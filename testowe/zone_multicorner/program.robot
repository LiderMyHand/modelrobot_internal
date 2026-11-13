# Three consecutive Cartesian lines with two position and yaw flybys.
# Set ZONE 0 to stop at both nominal corners.
ROBOT orientation_gantry
TOOL tcp_link
POSE corner_a world 0.35 0 0 AA 0 0 1 0.4
POSE corner_b world 0.35 0.15 0 AA 0 0 1 0.8
POSE finish world 0.60 0.15 0 AA 0 0 1 1.2
ZONE 0.06
MOVEL corner_a
MOVEL corner_b
MOVEL finish
