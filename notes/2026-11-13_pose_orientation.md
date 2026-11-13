# Pose orientation contract

The workcell's target is a six-dimensional TCP pose in a named reference frame. A pose combines position in metres with a rotation mapping TCP coordinates into that frame. The DSL and direct-pose UI accept either `Q qx qy qz qw` (quaternion in xyzw order) or `AA ax ay az angle` (axis and angle in radians). Both become a unit quaternion before frame composition, IK, and PTP/LIN/CIRC planning. They do not represent different robot modes.

For a nonzero axis $a$, write $\hat a=a/\lVert a\rVert$. The conversion is

$$q_{xyzw}=\left(\hat a_x\sin(\theta/2),\hat a_y\sin(\theta/2),\hat a_z\sin(\theta/2),\cos(\theta/2)\right).$$

Thus `AA 0 0 1 1.5707963267948966` and `Q 0 0 0.7071067811865475 0.7071067811865476` specify the same 90° Z rotation. Their component values differ because the encodings are different; compare the physical rotation using $2\arccos(|q_1\cdot q_2|)$, rather than comparing the four numbers. In particular, $q$ and $-q$ denote the same orientation. At 180°, opposite axis signs can denote the same rotation. At zero angle the axis is arbitrary; the UI displays the Z axis as a stable convention. A zero axis with a nonzero angle is rejected.

For the same pose, scene, and IK seed, Q and AA enter the same solver target and should produce the same selected joint branch to numerical precision. Different seeds can select different valid joint configurations for the same TCP pose. `tests/program.test.cjs` checks numerical equivalence at zero, 90°, and 180°; `tests/planning.test.cjs` checks the same IK branch for equivalent Q/AA targets; `tests/direct-pose.test.cjs` drives an AA target in Chromium. The normalization and conversion are in `frontend/program.js`; `frontend/planning/ik-pose.js` uses the shortest rotation-vector residual.

This equivalence is for the **orientation at a pose**, not an instruction to turn through a specified angle. `MOVEL` linearly interpolates position and uses shortest-arc quaternion SLERP from start to end. `MOVEC` follows the positional arc through its via point, while orientation uses shortest-arc SLERP separately from start to via and via to end. Thus an AA endpoint of `0 0 1 4.71238898038` is the same final orientation as `0 0 1 -1.57079632679`; a LIN move to either endpoint turns through the short -90° orientation path, not +270°. A requested extra wrist revolution needs a joint-space waypoint or a future explicit winding control. At exactly 180°, opposite axis signs describe the same endpoint but select opposite equally short interpolation directions: from identity to `Q 0 0 1 0` the midpoint is +90° about Z, while `Q 0 0 -1 0` gives -90°. An intermediate pose or joint target is needed when that direction matters.

The direct-pose UI converts the displayed four values when switching Q ↔ AA. Its Chromium test now checks an AA→Q→AA round trip before planning, and checks that an invalid quaternion leaves the selector on Q with an error instead of silently reinterpreting the values.

Use AA for handwritten rotations around a clear axis. Use Q for stored/generated poses and interpolation; normalize it, and compare endpoint orientations without regard to quaternion sign. At an exact half-turn, retain an explicit waypoint when interpolation direction matters. Keep the frame name and metres/radians convention explicit in either form.
