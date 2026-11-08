#!/bin/sh
''''exec python3 "$0" "$@" # '''
"""Build dictionary.js (the built-in dictionary) from dictionary.txt.

  python3 tools/build_dictionary.py           write dictionary.js
  python3 tools/build_dictionary.py --check   exit 1 if dictionary.js is out of date

Why a .js file at all: when index.html is opened straight from disk (file://) a browser refuses to read
a neighbouring .txt, but it does load a neighbouring <script>. So the text is wrapped into a JavaScript string.
Edit dictionary.txt, then run this script.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
txt = open(os.path.join(ROOT, 'dictionary.txt'), encoding='utf-8-sig').read().replace('\r\n', '\n').replace('\r', '\n')
body = json.dumps(txt, ensure_ascii=False).replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
out = '/* Built-in RU-EN dictionary (generated from dictionary.txt by tools/build_dictionary.py) */\nvar BUILTIN_DICTIONARY = ' + body + ';\n'
path = os.path.join(ROOT, 'dictionary.js')
if '--check' in sys.argv:
    if not os.path.isfile(path) or open(path, encoding='utf-8').read() != out:
        sys.exit('dictionary.js is out of date - run: python3 tools/build_dictionary.py')
    print('dictionary.js is up to date')
else:
    open(path, 'w', encoding='utf-8', newline='\n').write(out)
    print('wrote dictionary.js (%d lines)' % txt.count('\n'))
