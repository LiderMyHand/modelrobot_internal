# Teach pendant UI references

Date: 2026-11-13. This is a design reference for the browser teaching simulator, based on manufacturer documentation. It does not imply that the app has hardware safety functions.

## Observed operator pattern

- Universal Robots' [PolyScope X Move menu](https://www.universal-robots.com/manuals/EN/HTML/SW10_10/Content/prod-usr-man/software/PolyScopeX/polyx-introduction/polyx-Move.htm) separates **Move** and **Joints** controls. Move has an Active TCP selector, a Relative To frame selector (world, base, flange, TCP), and separate Translate and Rotate controls with signed X/Y/Z or Rx/Ry/Rz buttons. Joints offers an individual control and position for each axis. The official [Move tool image](https://www.universal-robots.com/manuals/EN/HTML/SW10_10/Content/_resources/graphics/prod-polyx/PolyScopeX-Right-MoveTool.png), [translation image](https://www.universal-robots.com/manuals/EN/HTML/SW10_10/Content/_resources/graphics/prod-polyx/PolyScopeX-Right-Move-translate.png), and [joint image](https://www.universal-robots.com/manuals/EN/HTML/SW10_10/Content/_resources/graphics/prod-polyx/PolyScopeX-Right-Move-Tools-Joints.png) show the grouping. Its [earlier Move Tab manual](https://www.universal-robots.com/manuals/EN/HTML/SW5_19/Content/prod-usr-man/software/PolyScope/content/move_g5/move_tab_en.htm) explicitly describes holding an arrow to move and displays tool and joint positions together.
- ABB's official [IRB 14000 operating manual](https://library.e.abb.com/public/2116717611ac46ecba5f3bd78fa8f56a/3HAC052986%20OM%20IRB%2014000-en.pdf?x-sign=hcskHdZr8ihGuSeFsRGDmIBPPyvIu%2BgYzTjoWP1kaeoIa5m2j%2FVGpsEHV8be5Cco) shows a FlexPendant Jogging window with separate **Motion mode**, **Coordinate system**, **Tool**, **Increment**, and **Position** fields. It says manual jogging is disabled during automatic program execution. The library URL has a signed query and may expire; the document ID is `3HAC052986-001`.
- KUKA's official [Basic Robot Operation course outline](https://college.kuka.com/action?securedGetRequest_const=G-ORXY5yS5XoovAS_F4GY16HNw-SV0bccm08gLiKstw) lists individual-axis, world, tool, and base jogging as separate operator tasks. The course link may require account access.

## Design implications for this app

1. Put **Joint / World / Tool** in one prominent mode switch and keep the selected TCP visible. Joint mode should expose an axis selector or one row per joint; World and Tool should expose signed translation and rotation buttons. Avoid conflating the selected *motion mode* with the chosen *reference frame* in labels.
2. Use a visually distinct, movable/resizable control panel alongside the 3D view, with the current TCP world pose, joint values, speed/step setting, and a clear jog status. The user should see the robot while holding a button.
3. Offer teach/capture actions near jogging, producing an editable program waypoint. The browser app can use its existing DSL and planning workflow for replay.
4. Describe the simulator accurately: it has sampled collision checks and keyboard/pointer controls, but no physical enabling switch, robot controller, or certified protective stop. A red **Stop jog** control can stop a held browser jog without suggesting a hardware emergency stop.

The app can borrow this information architecture while keeping its own styling and browser-only kinematic behavior.
