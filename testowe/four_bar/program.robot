# The state saved in robot-state.json is the closed θ=0.6 rad configuration.
# Only input is commanded; coupler and output are solved passive joints.
ROBOT four_bar
TOOL C_left
JOINTS open input=1.1
JOINTS close input=0.45
JOINTS middle input=0.8
MOVEJ open
MOVEJ close
MOVEJ middle
