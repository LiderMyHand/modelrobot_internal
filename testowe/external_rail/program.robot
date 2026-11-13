# The unmounted arm reaches x <= 0.5 m. This world target needs the rail.
ROBOT rail_arm
TOOL tcp_link
POSE far world 0.85 0 0.1 Q 0 0 0 1
MOVEJ far
JOINTS bent rail_slide=0.45 shoulder=0.4 elbow=-0.4
MOVEJ bent
