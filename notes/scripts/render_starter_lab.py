from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
root = Path(__file__).resolve().parents[1] / 'artifacts' / 'starter_lab_pl' / 'render'
paths = sorted(root.glob('page-*.png'))
sheet = Image.new('RGB', (900, 3 * 440), 'white')
for i, path in enumerate(paths):
    page = Image.open(path).convert('RGB')
    page.thumbnail((290, 410))
    x, y = (i % 3) * 300, (i // 3) * 440
    sheet.paste(page, (x, y+20))
    ImageDraw.Draw(sheet).text((x+10, y+3), f'Strona {i+1}', fill='black')
sheet.save(root / 'contact.png')
