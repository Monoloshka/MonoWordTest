#!/bin/sh
''''exec python3 "$0" "$@" # '''
"""Build build/icon.ico from build/icon.png with exactly these sizes: 16, 32, 48 and 256 pixels.

  python3 tools/make_ico.py [input.png] [output.ico]

16/32/48 are stored as classic 32-bit BMP entries (readable by Windows XP and every newer Windows);
256 is stored as PNG (the Vista+ way, keeps the file small). Needs Pillow:  pip install pillow
"""
import io, os, struct, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'build', 'icon.png')
dst = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'build', 'icon.ico')
SIZES = (16, 32, 48, 256)

base = Image.open(src).convert('RGBA')
side = max(base.size)
square = Image.new('RGBA', (side, side), (0, 0, 0, 0))          # never stretch a non-square picture
square.paste(base, ((side - base.width) // 2, (side - base.height) // 2))

def bmp_entry(img):
    w, h = img.size
    px = img.load()
    rows = []
    for y in range(h - 1, -1, -1):                              # BMP rows go bottom-up, pixels are BGRA
        rows.append(b''.join(struct.pack('4B', px[x, y][2], px[x, y][1], px[x, y][0], px[x, y][3]) for x in range(w)))
    xor = b''.join(rows)
    and_row = ((w + 31) // 32) * 4                              # 1-bit AND mask, all zero (alpha channel does the work)
    mask = b'\x00' * (and_row * h)
    header = struct.pack('<IiiHHIIiiII', 40, w, h * 2, 1, 32, 0, len(xor) + len(mask), 0, 0, 0, 0)
    return header + xor + mask

entries = []
for n in SIZES:
    img = square.resize((n, n), Image.LANCZOS)
    if n >= 256:
        buf = io.BytesIO(); img.save(buf, 'PNG', optimize=True); data = buf.getvalue()
    else:
        data = bmp_entry(img)
    entries.append((n, data))

out = struct.pack('<HHH', 0, 1, len(entries))
offset = 6 + 16 * len(entries)
for n, data in entries:
    out += struct.pack('<BBBBHHII', 0 if n >= 256 else n, 0 if n >= 256 else n, 0, 0, 1, 32, len(data), offset)
    offset += len(data)
out += b''.join(d for _, d in entries)
with open(dst, 'wb') as f:
    f.write(out)
print('wrote %s (%d bytes): %s' % (os.path.relpath(dst, ROOT), len(out), ', '.join('%dx%d' % (n, n) for n in SIZES)))
