'use strict';
/* Electron wrapper: just hosts index.html. Compatible with Electron 22 (Win 7/8/8.1) up to current. */
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const { execFileSync } = require('child_process');

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

function isWeb(url) { return /^https?:\/\//i.test(url); }

function createWindow() {
  const win = new BrowserWindow({
    width: 960, height: 680, minWidth: 360, minHeight: 480,
    show: false,
    autoHideMenuBar: true,
    title: 'MonoWordTest',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false }
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
}

app.whenReady().then(() => {
  if (process.platform !== 'darwin') { Menu.setApplicationMenu(null); }
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) { createWindow(); } });
});

/* The in-app "Close" button calls window.close() -> quit. */
app.on('window-all-closed', () => app.quit());
