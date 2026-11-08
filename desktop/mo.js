'use strict';
/* Minimal gettext .mo reader + loader for the Flatpak locale directory. No dependencies. */
const fs = require('fs');
const path = require('path');

const DOMAIN = 'monowordtest';

/* .mo file -> { msgid: msgstr }. The header entry has the empty msgid. */
function parseMo(buf) {
  const magic = buf.readUInt32LE(0);
  let le;
  if (magic === 0x950412de) { le = true; } else if (magic === 0xde120495) { le = false; } else { throw new Error('not a .mo file'); }
  const rd = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const n = rd(8), origTable = rd(12), transTable = rd(16);
  const out = {};
  for (let i = 0; i < n; i++) {
    const ol = rd(origTable + i * 8), op = rd(origTable + i * 8 + 4);
    const tl = rd(transTable + i * 8), tp = rd(transTable + i * 8 + 4);
    out[buf.toString('utf8', op, op + ol)] = buf.toString('utf8', tp, tp + tl);
  }
  return out;
}

/* <localeDir>/<lang>/LC_MESSAGES/monowordtest.mo  ->  { code: { name, flag, strings } }, or null when nothing is usable */
function loadLangs(localeDir) {
  const langs = {};
  let dirs = [];
  try { dirs = fs.readdirSync(localeDir); } catch (_) { return null; }
  for (const d of dirs) {
    try {
      const file = path.join(localeDir, d, 'LC_MESSAGES', DOMAIN + '.mo');
      if (!fs.existsSync(file)) { continue; }
      const entries = parseMo(fs.readFileSync(file));
      const head = entries[''] || '';
      delete entries[''];
      const code = d.replace(/_/g, '-').toLowerCase();
      const field = (n) => { const m = new RegExp('^' + n + ':\\s*(.*)$', 'm').exec(head); return m ? m[1].trim() : ''; };
      langs[code] = { name: field('X-MWT-Name') || code, flag: field('X-MWT-Flag'), strings: entries };
    } catch (_) { /* a broken catalogue is skipped; the page falls back to English if nothing is left */ }
  }
  return Object.keys(langs).length ? langs : null;
}

module.exports = { parseMo, loadLangs };
