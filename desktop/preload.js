'use strict';
/* Hands the gettext catalogues (read by the main process) to the page. If anything fails the page
   simply stays with English and the imported language files. */
const { contextBridge, ipcRenderer } = require('electron');
try {
  const langs = ipcRenderer.sendSync('mwt-langs');
  if (langs) { contextBridge.exposeInMainWorld('MWT_NATIVE_LANGS', langs); }
} catch (_) { /* ignore */ }
