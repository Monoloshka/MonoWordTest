'use strict';
/* Electron wrapper: just hosts index.html. Compatible with Electron 22 (Win 7/8/8.1) up to current. */
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadLangs } = require('./mo');

/* Wine / Proton / PortProton detection (Windows build running on Linux). */
function underWine() {
  if (process.platform !== 'win32') { return false; }
  const e = process.env;
  if (e.WINEPREFIX || e.WINELOADER || e.WINEDLLPATH || e.STEAM_COMPAT_DATA_PATH || e.PROTON_VERSION) { return true; }
  try {
    execFileSync('reg', ['query', 'HKCU\\Software\\Wine'], { stdio: 'ignore', timeout: 3000, windowsHide: true });
    return true;   // the Wine registry key exists only under Wine
  } catch (_) { return false; }
}

const wine = underWine();

/* The UI is plain 2D, so the GPU is not needed. Turning it off avoids driver/Vulkan/D3D
   problems under Wine, Proton, ReactOS-like layers, VMs and very old graphics cards. */
app.disableHardwareAcceleration();
if (wine) {
  app.commandLine.appendSwitch('no-sandbox');   // Chromium's Windows sandbox does not work reliably in Wine
  app.commandLine.appendSwitch('disable-gpu');
}
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');   // AppImage / restricted user-namespace distros; app only loads its own local files
}

/* Translations: inside Flatpak they come from the standard gettext location (/app/share/locale/<lang>/LC_MESSAGES/*.mo).
   MWT_LOCALE_DIR can point elsewhere for testing. Anywhere else (or on any problem) null -> the page has English plus whatever language files the user imports. */
let nativeLangs = null;
try {
  const dir = process.env.MWT_LOCALE_DIR || (process.env.FLATPAK_ID ? '/app/share/locale' : '');
  if (dir) { nativeLangs = loadLangs(dir); }
} catch (_) { nativeLangs = null; }
ipcMain.on('mwt-langs', (event) => { event.returnValue = nativeLangs; });

function isWeb(url) { return /^https?:\/\//i.test(url); }

/* Standard Electron menu roles: Ctrl+R reload, Ctrl+Shift+R hard reload, Ctrl+Plus/Minus/0 zoom,
   Ctrl+C copy, F11 fullscreen, Ctrl+Shift+I developer tools. The bar itself stays hidden (Alt shows it). */
function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { label: 'Edit', submenu: [{ role: 'copy' }, { role: 'selectAll' }] },
    { label: 'View', submenu: [
      { role: 'reload' },
      { label: 'Reload (F5)', accelerator: 'F5', click: (_item, win) => { if (win) { win.webContents.reload(); } } },
      { role: 'forceReload' },
      { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { role: 'toggleDevTools' }
    ] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 960, height: 680, minWidth: 360, minHeight: 480,
    show: false,
    autoHideMenuBar: true,
    title: 'MonoWordTest',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, preload: path.join(__dirname, 'preload.js') }
  });
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, '..', 'index.html'));

  /* Banner / badge links open in the system browser, never inside the app window. */
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isWeb(url)) { shell.openExternal(url); }
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (isWeb(url)) { event.preventDefault(); shell.openExternal(url); }
  });

  /* Ctrl + mouse wheel zooms the page (Electron reports the request, it does not apply it by itself). */
  win.webContents.on('zoom-changed', (_event, direction) => {
    const wc = win.webContents;
    const level = wc.getZoomLevel() + (direction === 'in' ? 0.5 : -0.5);
    wc.setZoomLevel(Math.max(-3, Math.min(5, level)));
  });

  /* Right-click on selected text: the engine's own "Copy" (and Cut/Paste in input fields). */
  win.webContents.on('context-menu', (_event, params) => {
    const items = [];
    if (params.isEditable) { items.push({ role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { type: 'separator' }, { role: 'selectAll' }); }
    else if (params.selectionText) { items.push({ role: 'copy' }); }
    if (items.length) { Menu.buildFromTemplate(items).popup({ window: win }); }
  });
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) { createWindow(); } });
});

/* The in-app "Exit" button calls window.close() -> quit. */
app.on('window-all-closed', () => app.quit());
