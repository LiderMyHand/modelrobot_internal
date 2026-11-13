# Each RUN_ROBOT replans this source against the then-current scene and joints.
ROBOT classroom_six_axis_arm
TOOL tcp_link
JOINTS turn base_yaw=-0.15 shoulder_pitch=0 elbow_pitch=0 wrist_roll=0 wrist_pitch=0 wrist_final=0
JOINTS finish base_yaw=0.05 shoulder_pitch=0 elbow_pitch=0 wrist_roll=0 wrist_pitch=0 wrist_final=0
MOVEJ turn
MOVEJ finish
