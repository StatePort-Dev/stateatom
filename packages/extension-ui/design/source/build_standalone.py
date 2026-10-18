from pathlib import Path
import base64
p=Path(__file__).parent
s=(p/'index.html').read_text(encoding='utf-8')
for n in ['style.css','extension.css']:
 s=s.replace(f'<link rel="stylesheet" href="{n}">','<style>'+(p/n).read_text(encoding='utf-8')+'</style>')
for n in ['engine.js','app.js','extension-model.js','extension.js']:
 s=s.replace(f'<script src="{n}"></script>','<script>'+(p/n).read_text(encoding='utf-8')+'</script>')
s=s.replace('assets/stateport-mark.svg','data:image/svg+xml;base64,'+base64.b64encode((p/'assets/stateport-mark.svg').read_bytes()).decode())
(p.parent/'index.html').write_text(s,encoding='utf-8')
print(p.parent/'index.html')
