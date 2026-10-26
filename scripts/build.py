"""Build only the explicit public account release; no private/local files are copied."""
from pathlib import Path
import json, shutil
ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'auth-manifest.json').read_text())
output = ROOT / '_site'
if output.exists(): shutil.rmtree(output)
output.mkdir()
for relative in ['index.html', 'auth-manifest.json', *manifest['consumerFiles']]:
    source = ROOT / relative
    if source.resolve().parent != ROOT and ROOT not in source.resolve().parents:
        raise ValueError('Release path outside repository')
    target = output / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
(output / '.nojekyll').touch()
print(f'Built account release: {output}')
