"""Render the browser-captured TCP top view around the PTP waypoint."""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

root = Path(__file__).resolve().parents[1]
trace = json.loads((root / 'artifacts/zone_ptp_browser.json').read_text())
fig, ax = plt.subplots(figsize=(7, 5), dpi=180)
for key, color, label in [('stopped', '#c85835', 'ZONE 0: exact stop'),
                           ('blended', '#087ca7', 'ZONE 0.07 m: flyby')]:
    points = trace[key]['path']
    ax.plot([point['x'] for point in points], [point['y'] for point in points],
            color=color, linewidth=2.2, label=label)
    corner = trace[key]['point']['q']
    ax.scatter(corner[0], corner[1], color=color, s=46, zorder=5)
ax.scatter(.4, 0, color='#1b263b', marker='x', s=95, linewidths=2.2,
           label='Programmed waypoint P')
ax.set_xlim(.33, .425)
ax.set_ylim(-.012, .065)
ax.set_aspect('equal', adjustable='box')
ax.set_xlabel('World TCP x (m)')
ax.set_ylabel('World TCP y (m)')
ax.set_title('PTP corner in Chromium: exact stop and bounded ZONE flyby')
ax.grid(color='#d9e1e8', linewidth=.7)
ax.legend(loc='upper left', framealpha=.96)
fig.tight_layout()
fig.savefig(root / 'artifacts/zone_ptp_topdown.png')
