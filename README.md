# MonoWordTest

A tiny translation-guessing game. Load a `.txt` file where every line looks like

```
word - translation
```

(the separator is **space, hyphen, space**; a bare `-` inside a word is ignored as a separator),
choose how many answer options you want (2-10), and guess the translation.
Wrong answer turns red, the right one turns green, and after 5 seconds a new round starts.
It repeats until you press **Close**.

A built-in Russian <-> English dictionary (`dictionary.txt`, embedded via `dictionary.js`) is included.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The whole app (HTML + CSS + plain ES5 JavaScript, no dependencies) |
| `dictionary.js` | Built-in dictionary as a JS string (works from `file://`) |
| `dictionary.txt` | Same dictionary as plain text, usable with the Browse button |
| `claude-badge.svg` | 88x31 vector badge (also inlined in `index.html`) |

## Robustness

Lines without ` - `, empty lines, lines with an empty side and garbage are skipped silently.
Files are read as UTF-8 and re-read as Windows-1251 if invalid UTF-8 is detected.
If the file has fewer distinct answers than requested, the round uses as many as exist.

## Running

Just open `index.html` in any browser. Keep `dictionary.js` next to it (optional).

## Packaging (one codebase, separate build per target)

The app is a static web page, so every target below is a thin wrapper around the same files.
These wrappers are **not included and not tested here**; they are the standard routes:

| Target | Route |
|--------|-------|
| Android `.apk` | Capacitor or Cordova (WebView); or PWA/TWA via Bubblewrap |
| Windows `.exe` / `.msi`, macOS `.app` / `.pkg`, Linux `.deb` `.rpm` AppImage Flatpak Snap, AUR, Nix | Tauri, Electron or NW.js; x86_64 and ARM/aarch64 builds come from the wrapper's target options |
| Windows XP / Vista | NW.js 0.14.x (Chromium 49) is the last line that ran on them |
| Windows 95 / 98 / Me / 2000 | No modern web runtime exists. The JS is ES5, but `FileReader` needs a newer browser. A native port (e.g. Free Pascal / Lazarus) would be needed |

Note: if a wrapper opens `target="_blank"` links inside the app window, route the badge link to the
system browser (Tauri: `shell.open`, Electron: `shell.openExternal`, Capacitor: `Browser.open`).

The Claude badge is an unofficial vector approximation; check Anthropic's brand guidelines before publishing.
