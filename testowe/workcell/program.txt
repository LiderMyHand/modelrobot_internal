# Browser-only teaching workcell: side pick, circular transfer, and placement.
# Positions are metres in world; quaternions are xyzw. The TCP is tcp_link.
ROBOT classroom_six_axis_arm
TOOL tcp_link
POSE pick world 0.355 0.16 0.78 Q 0 0 0 1
POSE via world 0.60 0.11 1.12 Q 0 0 0 1
POSE place_approach world 0.775 -0.16 0.95 Q 0 0 0 1
POSE place world 0.775 -0.16 0.80 Q 0 0 0 1
MOVEJ pick
GRAB pick_box
MOVEC via place_approach
MOVEL place
RELEASE pick_box
