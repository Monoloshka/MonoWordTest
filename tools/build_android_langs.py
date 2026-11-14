#!/bin/sh
''''exec python3 "$0" "$@" # '''
"""Android only: make languages/*.json built-in.

  python3 tools/build_android_langs.py <app-assets-dir>

Writes <dir>/native-langs.js (window.MWT_NATIVE_LANGS = {...}) and adds a <script> tag for it to <dir>/index.html
(right before the main script). The same MWT_NATIVE_LANGS hook is used by the Flatpak build, so the page treats these
languages as built-in: they are not removed by "Remove imported languages", and importing the same language again
shows it as "Name (1)".
"""
import glob, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dest = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
langs = {}
for f in sorted(glob.glob(os.path.join(ROOT, 'languages', '*.json'))):
    if os.path.basename(f) == 'template.json':
        continue
    data = json.load(open(f, encoding='utf-8-sig'))
    for code, L in data.items():
        if isinstance(L, dict) and isinstance(L.get('strings'), dict) and code not in langs:
            langs[code] = L
if not langs:
    sys.exit('no languages found')
text = json.dumps(langs, ensure_ascii=False).replace('</', '<\\/')
open(os.path.join(dest, 'native-langs.js'), 'w', encoding='utf-8', newline='\n').write('window.MWT_NATIVE_LANGS = ' + text + ';\n')
idx = os.path.join(dest, 'index.html')
html = open(idx, encoding='utf-8').read()
marker = '<script>\n/* MonoWordTest - plain ES5'
if marker not in html:
    sys.exit('index.html: main script marker not found')
if 'native-langs.js' not in html:
    html = html.replace(marker, '<script src="native-langs.js" charset="utf-8"></script>\n' + marker, 1)
    open(idx, 'w', encoding='utf-8', newline='\n').write(html)
print('built-in languages:', ', '.join(sorted(langs)))
