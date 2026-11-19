// electron-builder afterPack hook (Linux only).
// Chromium decides about its sandbox at process start. Turning it off later from main.js (appendSwitch) leaves it half
// enabled: child processes then fail with "Creating shared memory ... failed: No such process", the window stays blank,
// and running as root aborts at once. So the real binary is renamed to "monowordtest.bin" and "monowordtest" becomes a tiny
// launcher that starts it with --no-sandbox from the very beginning (works for AppImage, deb, rpm, pacman, tar.gz, snap, flatpak).
const fs = require('fs');
const path = require('path');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'linux') return;
  const name = context.packager.executableName;            // "monowordtest"
  const bin = path.join(context.appOutDir, name);
  const real = bin + '.bin';
  if (!fs.existsSync(bin) || fs.existsSync(real)) return;
  fs.renameSync(bin, real);
  fs.writeFileSync(bin,
    '#!/bin/sh\n' +
    'HERE="$(dirname "$(readlink -f "$0")")"\n' +
    '# Chromium prints harmless warnings (VA-API, histograms ...); only fatal messages are shown. MWT_VERBOSE=1 shows everything.\n' +
    'if [ -n "$MWT_VERBOSE" ]; then set -- "$@"; else set -- --log-level=3 "$@"; fi\n' +
    'exec "$HERE/' + name + '.bin" --no-sandbox "$@"\n', { mode: 0o755 });
  fs.chmodSync(bin, 0o755);
};
