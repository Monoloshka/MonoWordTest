"""Make SVG files safe to show through <img> (data URIs). Shared by build_about.py and build_ads.py.

An SVG used as a picture needs the xmlns declaration (icons copied from web pages often lack it) and
either a viewBox or numeric width/height to be scaled. Pictures cannot load external files, so references
to http(s) images, fonts or @import are reported. Returns (fixed bytes, list of warnings)."""
import re


def fix_svg(raw, name):
    warns = []
    try:
        text = raw.decode('utf-8-sig')
    except UnicodeDecodeError:
        text = raw.decode('latin-1')
        warns.append('%s: not UTF-8, decoded as Latin-1' % name)
    m = re.search(r'<svg\b[^>]*>', text, re.I | re.S)
    if not m:
        warns.append('%s: no <svg> element found - this file will not show' % name)
        return text.encode('utf-8'), warns
    tag = m.group(0)
    new = tag
    if not re.search(r'\bxmlns\s*=', tag):
        new = new.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"', 1)
        warns.append('%s: added missing xmlns (without it browsers do not draw an SVG used as a picture)' % name)
    if re.search(r'\bxlink:', text) and not re.search(r'xmlns:xlink\s*=', new):
        new = new.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"', 1)
    if not re.search(r'\bviewBox\s*=', new):
        w = re.search(r'\bwidth\s*=\s*["\']?\s*([0-9.]+)\s*(?:px)?\s*["\']', new)
        h = re.search(r'\bheight\s*=\s*["\']?\s*([0-9.]+)\s*(?:px)?\s*["\']', new)
        if w and h:
            new = new.replace('<svg', '<svg viewBox="0 0 %s %s"' % (w.group(1), h.group(1)), 1)
            warns.append('%s: added missing viewBox so it scales' % name)
        else:
            warns.append('%s: has no viewBox and no width/height - it may show cut off or not at all' % name)
    text = text.replace(tag, new, 1)
    if re.search(r'(?:xlink:)?href\s*=\s*["\']https?://', text, re.I) or re.search(r'@import|url\(\s*["\']?https?://', text, re.I):
        warns.append('%s: refers to an external file (image/font/CSS) - a picture cannot load it' % name)
    if re.search(r'<foreignObject|<script', text, re.I):
        warns.append('%s: contains foreignObject/script - not rendered inside a picture' % name)
    if re.search(r'currentColor', text):
        warns.append('%s: uses currentColor - shown black (the dark theme gives icons a light backdrop)' % name)
    return text.encode('utf-8'), warns
