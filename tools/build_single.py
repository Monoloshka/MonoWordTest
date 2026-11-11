#!/bin/sh
''''exec python3 "$0" "$@" # '''
"""Build MonoWordTest.html: the whole program in ONE file (no neighbouring files needed), so it can be opened
from any folder, from a sandboxed browser (Flatpak/Snap Firefox) or e-mailed around.

  python3 tools/build_single.py            write MonoWordTest.html
  python3 tools/build_single.py --check    exit 1 if MonoWordTest.html is out of date

It inlines ads.js, about.js, sounds.js (the .mp3 files become data URIs), dictionary.js and the spreadsheet
library. Run the other build tools first (build_ads / build_about / build_sounds / build_dictionary).
Language files are NOT inside: the app is English-only until the user imports languages/*.json.
"""
import base64, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(rel):
    return open(os.path.join(ROOT, rel), encoding='utf-8').read()


def safe_js(text, name):
    if re.search(r'</script', text, re.I):
        sys.exit('%s contains "</script" and cannot be inlined' % name)
    return text


def sounds_inline():
    text = read('sounds.js')
    m = re.search(r'var MWT_SOUNDS = (\{.*?\});', text, re.S)
    mapping = json.loads(m.group(1))
    for ev, rel in mapping.items():
        data = base64.b64encode(open(os.path.join(ROOT, rel), 'rb').read()).decode('ascii')
        mapping[ev] = 'data:audio/mpeg;base64,' + data
    return '/* sounds (mp3 embedded) */\nvar MWT_SOUNDS = ' + json.dumps(mapping) + ';\n'


def build():
    html = read('index.html')
    inline = {'ads.js': lambda: read('ads.js'), 'about.js': lambda: read('about.js'),
              'sounds.js': sounds_inline, 'dictionary.js': lambda: read('dictionary.js')}
    for name, fn in inline.items():
        tag = '<script src="%s" charset="utf-8"></script>' % name
        if tag not in html:
            sys.exit('index.html: missing %s' % tag)
        html = html.replace(tag, '<script>\n' + safe_js(fn(), name) + '</script>')
    xlsx = safe_js(read('vendor/xlsx.full.min.js'), 'xlsx.full.min.js')
    marker = '<script>\n/* MonoWordTest - plain ES5'
    if marker not in html:
        sys.exit('index.html: main script marker not found')
    html = html.replace(marker, '<script type="text/plain" id="mwt-xlsx">' + xlsx + '</script>\n' + marker, 1)
    return html


if __name__ == '__main__':
    out = build()
    path = os.path.join(ROOT, 'MonoWordTest.html')
    if '--check' in sys.argv:
        if not os.path.isfile(path) or open(path, encoding='utf-8').read() != out:
            sys.exit('MonoWordTest.html is out of date - run: python3 tools/build_single.py')
        print('MonoWordTest.html is up to date')
    else:
        open(path, 'w', encoding='utf-8', newline='\n').write(out)
        print('wrote MonoWordTest.html (%.2f MB)' % (len(out.encode('utf-8')) / 1048576.0))
