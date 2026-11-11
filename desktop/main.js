'use strict';
const {app,BrowserWindow,Menu,ipcMain,shell}=require('electron');
const path=require('path'),fs=require('fs');
const {execFileSync}=require('child_process');
const {loadLangs}=require('./mo');
const {parseArgs,cleanFontName,helpText,readLanguage}=require('./cli');
const {createLogger}=require('./logger');
const {loadTargets}=require('./loader');

function underWine(){
 if(process.platform!=='win32')return false;
 const e=process.env;
 if(e.WINEPREFIX||e.WINELOADER||e.WINEDLLPATH||e.STEAM_COMPAT_DATA_PATH||e.PROTON_VERSION)return true;
 try{execFileSync('reg',['query','HKCU\\Software\\Wine'],{stdio:'ignore',timeout:3000,windowsHide:true});return true;}catch(_){return false;}
}
const wine=underWine();
app.disableHardwareAcceleration();
if(wine){app.commandLine.appendSwitch('no-sandbox');app.commandLine.appendSwitch('disable-gpu');}
if(process.platform==='linux')app.commandLine.appendSwitch('no-sandbox');

const version=require('../package.json').version;
function argsFromProcess(){return process.argv.slice(app.isPackaged?1:2);}
let parsed=parseArgs(argsFromProcess());
if(parsed.opts.help){fs.writeSync(1,helpText(version));process.exit(0);}
if(parsed.opts.version){fs.writeSync(1,'MonoWordTest '+version+'\n');process.exit(0);}
if(parsed.errors.length){fs.writeSync(2,parsed.errors.map(x=>'monowordtest: '+x).join('\n')+'\nTry --help for usage.\n');process.exit(2);}
const lock=app.requestSingleInstanceLock();
if(!lock){app.quit();}
const log=createLogger({file:parsed.opts.log,tty:!!process.stderr.isTTY});
let nativeLangs=null,language={code:parsed.opts.lang,text:null},openedFiles=[],mainWindow=null;
try{const dir=process.env.MWT_LOCALE_DIR||(process.env.FLATPAK_ID?'/app/share/locale':'');if(dir)nativeLangs=loadLangs(dir);}catch(e){log.warn('locale load failed:',e.message);}
try{language=readLanguage(parsed.opts.lang);}catch(e){log.warn('--lang:',e.message);language={code:null,text:null};}
ipcMain.on('mwt-langs',event=>{event.returnValue=nativeLangs;});
ipcMain.on('mwt-cli-options',event=>{event.returnValue={noimage:parsed.opts.noimage,nosound:parsed.opts.nosound,nokeyboard:parsed.opts.nokeyboard,nomouse:parsed.opts.nomouse,font:cleanFontName(parsed.opts.font),lang:language.code,langText:language.text,initialOpen:parsed.opts.open.length>0};});
ipcMain.handle('mwt-open-files',()=>{
 const out=openedFiles;openedFiles=[];
 return out.map(f=>({name:f.name,rel:f.rel,data:Uint8Array.from(f.data)}));
});
async function collectTargets(targets){
 if(!targets||!targets.length)return;
 const result=await loadTargets(targets,{noimage:parsed.opts.noimage});
 openedFiles=openedFiles.concat(result.files);
 for(const p of result.problems)log.warn('--open:',p);
 log.info('loaded',result.files.length,'file(s) for the page');
 if(mainWindow&&!mainWindow.isDestroyed())mainWindow.webContents.send('mwt-files-ready');
}
function isWeb(url){return /^https?:\/\//i.test(url);}
function createWindow(){
 const win=new BrowserWindow({
  width:960,height:680,minWidth:360,minHeight:480,show:false,autoHideMenuBar:true,title:'MonoWordTest',
  icon:path.join(__dirname,'..','build','icon.png'),
  webPreferences:{contextIsolation:true,nodeIntegration:false,devTools:false,preload:path.join(__dirname,'preload.js')}
 });
 mainWindow=win;
 win.once('ready-to-show',()=>win.show());
 win.loadFile(path.join(__dirname,'..','index.html'));
 win.webContents.setWindowOpenHandler(({url})=>{
  if(isWeb(url))shell.openExternal(url);else log.warn('blocked window.open to',url);
  return {action:'deny'};
 });
 win.webContents.on('will-navigate',(event,url)=>{
  if(isWeb(url)){event.preventDefault();shell.openExternal(url);return;}
  if(url!==win.webContents.getURL()){event.preventDefault();log.warn('blocked navigation to',url);}
 });
 win.webContents.on('will-attach-webview',event=>event.preventDefault());
 win.webContents.on('before-input-event',(event,input)=>{
  const key=String(input.key||'').toLowerCase();
  const devtools=(input.control||input.meta)&&(input.shift)&&['i','j','c'].includes(key)||key==='f12';
  if(devtools){event.preventDefault();log.debug('blocked developer-tools shortcut');return;}
  const reload=(key==='f5'||((input.control||input.meta)&&key==='r'))&&input.type==='keyDown';
  if(reload){
   event.preventDefault();
   const now=Date.now();
   if(input.isAutoRepeat||now-(win.__mwtLastReload||0)<700){log.debug('ignored repeated reload key');return;}
   win.__mwtLastReload=now;log.info('reload');win.webContents.reload();
  }
 });
 win.webContents.on('console-message',(_e,...args)=>{
  const d=args[0];
  const level=(d&&typeof d==='object')?d.level:args[0];
  const message=(d&&typeof d==='object')?d.message:args[1];
  const line=(d&&typeof d==='object')?d.lineNumber:args[2];
  const source=(d&&typeof d==='object')?d.sourceId:args[3];
  if(level>=2)log.warn('page:',message,'('+source+':'+line+')');
  else if(level===1)log.debug('page:',message);
 });
 win.webContents.on('render-process-gone',(_e,details)=>log.error('renderer process gone:',details.reason,details.exitCode));
 win.webContents.on('unresponsive',()=>log.warn('window is not responding'));
 win.on('closed',()=>{if(mainWindow===win)mainWindow=null;});
 win.webContents.on('context-menu',(_event,params)=>{
  const items=[];
  if(params.isEditable)items.push({role:'cut'},{role:'copy'},{role:'paste'},{type:'separator'},{role:'selectAll'});
  else if(params.selectionText)items.push({role:'copy'});
  if(items.length)Menu.buildFromTemplate(items).popup({window:win});
 });
}
if(lock){
 app.on('second-instance',async(_event,argv)=>{
  const extra=parseArgs(argv.slice(app.isPackaged?1:2));
  if(extra.errors.length){log.warn('second launch:',extra.errors.join('; '));return;}
  await collectTargets(extra.opts.open);
  if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.focus();}
 });
 app.whenReady().then(async()=>{
  // Do not expose a DevTools menu or accelerator in release builds.
  Menu.setApplicationMenu(null);
  if(parsed.opts.open.length)await collectTargets(parsed.opts.open);
  createWindow();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});
 });
}
app.on('window-all-closed',()=>app.quit());
let closing=false;
app.on('before-quit',event=>{
 if(closing)return;
 event.preventDefault();closing=true;
 log.info('application exit');
 log.close().then(()=>app.exit(0));
});
