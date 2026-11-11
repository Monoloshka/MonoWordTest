#!/bin/sh
''''exec python3 "$0" "$@" # '''
"""Derive every icon size from ONE source file: build/icon.png (square PNG, 1024 px recommended).

  python3 tools/make_icons.py                      -> build/icons/NxN.png   (Linux / Flatpak / deb / rpm / AppImage)
  python3 tools/make_icons.py --android <res dir>  -> Android launcher icons (legacy + round + adaptive)

Needs Pillow (pip install pillow / apt install python3-pil)."""
import argparse, os, sys
from collections import Counter
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'build', 'icon.png')
LINUX_SIZES = [16, 24, 32, 48, 64, 128, 256, 512]       # Flatpak ignores anything above 512
LEGACY = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
FOREGROUND = {'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432}   # 108 dp adaptive layer


def load():
    if not os.path.isfile(SRC):
        sys.exit('missing %s' % SRC)
    im = Image.open(SRC).convert('RGBA')
    if im.width != im.height:
        sys.exit('build/icon.png must be square (it is %dx%d)' % im.size)
    if im.width < 512:
        print('warning: build/icon.png is only %dpx; 1024px is recommended' % im.width)
    return im


def sized(im, n):
    return im.resize((n, n), Image.LANCZOS)


def save(im, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, optimize=True)


def round_icon(im):
    n = im.width
    mask = Image.new('L', (n * 4, n * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, n * 4 - 1, n * 4 - 1), fill=255)
    mask = mask.resize((n, n), Image.LANCZOS)
    out = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out


def background_color(im):
    """Most common opaque colour in a band near the top edge of the icon (its 'tile' colour)."""
    n = im.width
    px = im.load()
    c = Counter()
    for y in range(int(n * 0.04), int(n * 0.10)):
        for x in range(int(n * 0.25), int(n * 0.75)):
            r, g, b, a = px[x, y]
            if a == 255:
                c[(r, g, b)] += 1
    return c.most_common(1)[0][0] if c else (217, 119, 87)


def linux(im):
    for s in LINUX_SIZES:
        save(sized(im, s), os.path.join(ROOT, 'build', 'icons', '%dx%d.png' % (s, s)))
    print('wrote build/icons/ (%s)' % ', '.join('%d' % s for s in LINUX_SIZES))


def android(im, res):
    for d, n in LEGACY.items():
        full = sized(im, n)
        save(full, os.path.join(res, 'mipmap-' + d, 'ic_launcher.png'))
        save(round_icon(full), os.path.join(res, 'mipmap-' + d, 'ic_launcher_round.png'))
    for d, n in FOREGROUND.items():
        layer = Image.new('RGBA', (n, n), (0, 0, 0, 0))
        inner = int(n * 0.62)                       # keep everything inside the 66% safe zone
        layer.paste(sized(im, inner), ((n - inner) // 2, (n - inner) // 2))
        save(layer, os.path.join(res, 'mipmap-' + d, 'mwt_icon_foreground.png'))
    r, g, b = background_color(im)
    xml = ('<?xml version="1.0" encoding="utf-8"?>\n'
           '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
           '    <background android:drawable="@color/mwt_icon_background"/>\n'
           '    <foreground android:drawable="@mipmap/mwt_icon_foreground"/>\n'
           '</adaptive-icon>\n')
    for name in ('ic_launcher.xml', 'ic_launcher_round.xml'):
        p = os.path.join(res, 'mipmap-anydpi-v26', name)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, 'w').write(xml)
    p = os.path.join(res, 'values', 'mwt_icon_colors.xml')
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w').write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
                       '    <color name="mwt_icon_background">#%02X%02X%02X</color>\n</resources>\n' % (r, g, b))
    print('wrote Android icons into %s (adaptive background #%02X%02X%02X)' % (res, r, g, b))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--android', metavar='RES_DIR')
    a = ap.parse_args()
    img = load()
    if a.android:
        android(img, a.android)
    else:
        linux(img)
