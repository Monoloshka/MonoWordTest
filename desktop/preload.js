'use strict';
const {contextBridge,ipcRenderer}=require('electron');
try{
 const langs=ipcRenderer.sendSync('mwt-langs');
 if(langs)contextBridge.exposeInMainWorld('MWT_NATIVE_LANGS',langs);
 const flags=ipcRenderer.sendSync('mwt-cli-options')||{};
 contextBridge.exposeInMainWorld('MWT_CLI',Object.assign({},flags,{
  hasOpen:true,
  getFiles:()=>ipcRenderer.invoke('mwt-open-files'),
  onFiles:callback=>ipcRenderer.on('mwt-files-ready',()=>{try{callback();}catch(_){};})
 }));
}catch(_){}
