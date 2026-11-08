#!/bin/sh
''''exec python3 "$0" "$@" # '''
"""Regenerate every generated file in the right order:  python3 tools/build_all.py
(ads.js, about.js, sounds.js, dictionary.js, po/*.po, and finally the one-file MonoWordTest.html)."""
import os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
for tool in ('build_ads.py', 'build_about.py', 'build_sounds.py', 'build_dictionary.py', 'make_po.py', 'build_single.py'):
    print('>>', tool)
    if subprocess.call([sys.executable, os.path.join(here, tool)]) != 0:
        sys.exit('%s failed' % tool)
print('all generated files are up to date')
