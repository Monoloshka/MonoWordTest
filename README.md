# MonoWordTest

A tiny translation-guessing game. Load a `.txt` file where every line looks like

```
word - translation
```

(the separator is **space, hyphen, space**; a bare `-` inside a word is not a separator),
choose how many answer options you want (2-10) and guess. A wrong answer turns red, the right one
turns green, and after 5 seconds a new round starts - until you press **Close**.
A built-in Russian <-> English dictionary (`dictionary.txt`, embedded via `dictionary.js`) is included.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The whole app (HTML + CSS + plain ES5 JavaScript, no dependencies) |
| `translations.js` | UI languages. Add or edit translations here |
| `ads.js` | **Generated** embedded ad banners (see below) |
| `ads/`, `tools/build_ads.py` | Ad source images + list, and the script that builds `ads.js` |
| `dictionary.js` / `dictionary.txt` | Built-in dictionary (JS string for `file://` use / plain text) |
| `claude-badge.svg` | 88x31 vector badge (also inlined in `index.html`) |

## Languages

The UI language is chosen from the system/browser locale (`navigator.languages`); if it is unknown
the app falls back to English. Users can override it in the dropdown (flag emoji + name); the choice is remembered.
Included: English, Русский, Українська, Қазақша, Deutsch, Français, Español.
Any string missing from a translation falls back to English individually.

**Add a language:** open `translations.js`, copy any block, change the code / `name` / `flag`, and translate
only the right-hand side of each `'English text': 'translation'` line. `{n}` is a number placeholder - keep it.
Note: Windows does not draw flag emoji (it shows letters such as "RU" instead); Android, macOS, Linux and iOS do.

## Theme

Auto (follows the system dark/light setting), Light or Dark - selectable in the top bar and remembered.

## Ad banners (menu screen only)

* Banner images are **embedded in the app** (as data URIs inside `ads.js`); nothing is fetched from the internet,
  and there is no user-visible setting for them.
* Shown at the bottom centre of the start screen, in the page flow (never over the UI), hidden during the game.
  Every time the start screen appears a random banner is chosen again (never the same one twice in a row).
* Click/tap opens the banner's link in the browser. **Press and hold (~0.6 s) copies the link** instead.
* A small "Ad" label (translated) is shown above the banner.

**Add / remove an ad:** put the image (`.svg .png .jpg .gif .webp`) into `ads/`, add or delete a line in
`ads/ads.txt` (`file | https://link | alt text`), then run `python3 tools/build_ads.py` and rebuild your app.
The two included banners are samples pointing to example.com - replace them. If `ads.txt` has no entries the ad area is not shown.

(Embedded means "not a setting", not tamper-proof: anyone can unpack an APK/asar and edit the files.)

## Robustness

Lines without ` - `, empty lines, lines with an empty side and garbage are skipped silently.
Files are read as UTF-8 and re-read as Windows-1251 if invalid UTF-8 is detected.
If the file has fewer distinct answers than requested, the round uses as many as exist.

## Running

Open `index.html` in a browser. Keep the `.js` files next to it.

## Packaging (one codebase, separate build per target)

The app is a static web page, so every target below is a thin wrapper around the same files.
These wrappers are **not included and not tested**; they are the standard routes:

| Target | Route |
|--------|-------|
| Android `.apk` | Capacitor or Cordova (WebView); or PWA/TWA via Bubblewrap |
| Windows `.exe` / `.msi`, macOS `.app` / `.pkg`, Linux `.deb` `.rpm` AppImage Flatpak Snap, AUR, Nix | Tauri, Electron or NW.js; x86_64 and ARM/aarch64 come from the wrapper's target options |
| Windows XP / Vista | NW.js 0.14.x (Chromium 49) is the last line that ran on them |
| Windows 95 / 98 / Me / 2000 | No modern web runtime exists. A native port (e.g. Free Pascal / Lazarus) would be needed |

If a wrapper opens `target="_blank"` links inside the app window, route the banner and badge links to the
system browser (Tauri: `shell.open`, Electron: `shell.openExternal`, Capacitor: `Browser.open`).
The Claude badge is an unofficial vector approximation; check Anthropic's brand guidelines before publishing.

## Desktop / Android builds (GitHub Actions)

`.github/workflows/build.yml` builds standalone apps (an optional alternative to the browser).
Run it from the Actions tab ("Run workflow") or push a tag such as `v1.0.0` to also publish all files to a GitHub Release.
Before publishing, replace `YOUR-NAME` / `you@example.com` in `package.json` and keep `version` equal to the tag.
Commit the generated `ads.js` (run `python3 tools/build_ads.py` after changing ads).

| Output | Runs on | Notes |
|--------|---------|-------|
| `...-win10-11-{x64,ia32,arm64}-portable.exe` | Windows 10/11, Wine, Proton, PortProton | Single file, no installer (Electron 33) |
| `...-win7-8-8.1-{x64,ia32}-portable.exe` | Windows 7/8/8.1, Wine, Proton, PortProton | Single file, no installer (Electron 22) |
| `...-win-x64.msi` | Windows 10/11 | Installer package |
| `...-winxp-vista-ia32.zip` | Windows XP/Vista | NW.js 0.14.7, experimental, a folder (not one file) |
| `...-mac-*.zip` (contains the `.app`), `.dmg`, `.pkg` | macOS, Intel + Apple Silicon | Unsigned: first launch needs right-click -> Open |
| `...-linux-*.AppImage`, `.deb`, `.rpm`, `.pacman`, `.tar.gz` | Linux x64 / arm64 (aarch64) | AppImage is a single file |
| `.snap`, `.flatpak` | Linux | Experimental |
| `...-android.apk` | Android | Debug-signed (installable; not for Google Play) |
| `...-web.zip` | Any browser, incl. ReactOS and Win 9x/2000 with an old browser | Plain files |

Not built by CI: AUR (`packaging/aur/PKGBUILD` template), Nix (`packaging/nix/default.nix` template), `.tazpkg`.
Windows 95/98/Me/2000 have no modern runtime: use the web zip in an old browser, or a native port.
Wine/Proton: the exe detects Wine and turns off GPU acceleration and the Chromium sandbox automatically.
None of these CI builds have been run yet; expect to fix small things on the first run (experimental jobs are allowed to fail without stopping the rest).
