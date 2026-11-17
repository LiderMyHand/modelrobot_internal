# Exercise 3: straight segments and an arc, metres/radians.
ROBOT seam_cartesian
TOOL tcp_link
POSE a world 0.15 0 0 Q 0 0 0 1
POSE v world 0.35 0.14 0 Q 0 0 0 1
POSE b world 0.55 0 0 Q 0 0 0 1
MOVEJ a
MOVEL v
MOVEL b
MOVEL a
PAUSE 0.5
MOVEC v b
MOVEL a
