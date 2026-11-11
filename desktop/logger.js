'use strict';
const fs=require('fs'),path=require('path');
function createLogger(options){
 const file=options&&options.file?options.file:null,tty=!!(options&&options.tty);
 let stream=null,failed=false;
 function consoleLine(line){try{process.stderr.write(line+'\n');}catch(_){}}
 if(file){
  try{
   fs.mkdirSync(path.dirname(file),{recursive:true});
   stream=fs.createWriteStream(file,{flags:'a'});
   stream.on('error',e=>{if(!failed){failed=true;consoleLine('log: cannot write '+file+': '+e.message+(process.env.FLATPAK_ID?' (Flatpak may need --filesystem='+path.dirname(file)+' or a path under ~/.var/app/'+process.env.FLATPAK_ID+'/)':''));}stream=null;});
  }catch(e){failed=true;consoleLine('log: cannot write '+file+': '+e.message);}
 }
 const toConsole=tty||!!file;
 function write(level,args){
  let msg=args.map(a=>typeof a==='string'?a:(a&&a.stack)||String(a)).join(' ');
  const line=new Date().toISOString()+' ['+level+'] '+msg;
  if(toConsole&&(level!=='debug'||file))consoleLine(line);
  if(stream){try{stream.write(line+'\n');}catch(_){}}
 }
 return {info:(...a)=>write('info',a),warn:(...a)=>write('warn',a),error:(...a)=>write('error',a),debug:(...a)=>write('debug',a),
 close:()=>new Promise(resolve=>{if(stream)stream.end(resolve);else resolve();})};
}
module.exports={createLogger};
