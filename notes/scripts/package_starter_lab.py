from pathlib import Path
import hashlib, json, subprocess, tempfile, shutil, zipfile

repo = Path(__file__).resolve().parents[2]
doc = repo / 'notes/artifacts/starter_lab_pl'
relative = [Path('main.tex'), Path('build.sh'), Path('README.md'), Path('mymodelrobot_cwiczenia.pdf')]
for folder in ('assets', 'licenses', 'projekty'):
    relative.extend(p.relative_to(doc) for p in sorted((doc / folder).rglob('*')) if p.is_file())
relative.extend(p.relative_to(doc) for p in sorted((doc / 'examples').glob('*.robot')))
relative.extend(p.relative_to(doc) for p in sorted((doc / 'examples').glob('*.sdf')))
manifest = {'build': 'bash build.sh', 'pdf': 'mymodelrobot_cwiczenia.pdf',
            'tool': subprocess.check_output(['pdflatex', '--version'], text=True).splitlines()[0],
            'files': {str(p): hashlib.sha256((doc / p).read_bytes()).hexdigest() for p in relative}}
(doc / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
relative.append(Path('manifest.json'))
archive = doc.parent / 'mymodelrobot_cwiczenia_pakiet.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in relative:
        z.write(doc / p, Path('mymodelrobot_cwiczenia') / p)
with tempfile.TemporaryDirectory(prefix='mymodelrobot_lab_build_') as tmp:
    with zipfile.ZipFile(archive) as z: z.extractall(tmp)
    isolated = Path(tmp) / 'mymodelrobot_cwiczenia'
    subprocess.run(['bash', 'build.sh'], cwd=isolated, stdout=subprocess.DEVNULL, check=True)
    info = subprocess.check_output(['pdfinfo', str(isolated / 'mymodelrobot_cwiczenia.pdf')], text=True)
    if 'Pages:           9' not in info:
        raise RuntimeError('Unexpected page count after portable rebuild')
    text = subprocess.check_output(['pdftotext', str(isolated / 'mymodelrobot_cwiczenia.pdf'), '-'], text=True)
    original_text = subprocess.check_output(['pdftotext', str(doc / 'mymodelrobot_cwiczenia.pdf'), '-'], text=True)
    if text != original_text:
        raise RuntimeError('Portable rebuild changed extracted document text')
    for expected in ('MyModelRobot', 'MOVEC', 'Reset to teaching start', 'collision/state validation'):
        if expected not in text:
            raise RuntimeError(f'Missing expected text in portable build: {expected}')
print(f'Portable rebuild passed (9 pages): {archive}')
