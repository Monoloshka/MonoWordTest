'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),https=require('https');
const {URL}=require('url');
const DICT=/\.(txt|xlsx|xls|ods)$/i,IMG=/\.(png|jpe?g|webp|gif|svg)$/i;
const LIMITS={file:50*1024*1024,total:300*1024*1024,count:5000,depth:8,timeout:20000};
function fetchUrl(url,redirects){
 return new Promise((resolve,reject)=>{
  const lib=/^https:/i.test(url)?https:http;
  const req=lib.get(url,{headers:{'User-Agent':'MonoWordTest'}},res=>{
   if(res.statusCode>=300&&res.statusCode<400&&res.headers.location&&redirects>0){res.resume();resolve(fetchUrl(new URL(res.headers.location,url).toString(),redirects-1));return;}
   if(res.statusCode!==200){res.resume();reject(new Error('HTTP '+res.statusCode));return;}
   const chunks=[];let size=0;
   res.on('data',c=>{size+=c.length;if(size>LIMITS.file){req.destroy(new Error('file too large'));return;}chunks.push(c);});
   res.on('end',()=>resolve(Buffer.concat(chunks)));res.on('error',reject);
  });
  req.setTimeout(LIMITS.timeout,()=>req.destroy(new Error('timeout')));req.on('error',reject);
 });
}
function sandboxHint(p){return process.env.FLATPAK_ID?' (Flatpak sandbox: grant access with flatpak run --filesystem='+path.dirname(path.resolve(p))+':ro '+process.env.FLATPAK_ID+' ...)':'';}
async function loadTargets(targets,options){
 const noimage=!!(options&&options.noimage),files=[],problems=[],seen=new Set();let total=0;
 function add(abs,rel,name){
  if(seen.has(abs))return true;if(files.length>=LIMITS.count){problems.push('too many files (limit '+LIMITS.count+')');return false;}
  let st;try{st=fs.statSync(abs);}catch(e){problems.push(abs+': '+e.message+sandboxHint(abs));return true;}
  if(st.size>LIMITS.file){problems.push(abs+': larger than 50 MB, skipped');return true;}
  if(total+st.size>LIMITS.total){problems.push('total size limit reached (300 MB)');return false;}
  let data;try{data=fs.readFileSync(abs);}catch(e){problems.push(abs+': '+e.message+sandboxHint(abs));return true;}
  seen.add(abs);total+=data.length;files.push({name,rel,data});return true;
 }
 function addReferencedImages(dictAbs,folderName,dictDir,text){
  for(const line of text.replace(/^\uFEFF/,'').split(/\r\n|\r|\n/)){
   const p=line.indexOf(' - ');if(p<0)continue;
   for(const side of [line.slice(0,p).trim(),line.slice(p+3).trim()]){
    if(!IMG.test(side)||/^https?:\/\//i.test(side))continue;
    const target=path.resolve(dictDir,side),relPath=path.relative(dictDir,target);
    if(relPath.startsWith('..')||path.isAbsolute(relPath))continue;
    try{if(fs.existsSync(target)&&fs.statSync(target).isFile()&&!add(target,folderName+'/'+relPath.split(path.sep).join('/'),path.basename(target)))return;}catch(_){}
   }
  }
 }
 function walk(dir,relBase,depth){
  let entries=[];try{entries=fs.readdirSync(dir,{withFileTypes:true});}catch(e){problems.push(dir+': '+e.message+sandboxHint(dir));return;}
  entries.sort((a,b)=>a.name.localeCompare(b.name));
  for(const e of entries){
   if(e.name[0]==='.')continue;const abs=path.join(dir,e.name),rel=relBase+'/'+e.name;
   if(e.isDirectory()){if(depth<LIMITS.depth)walk(abs,rel,depth+1);continue;}
   if(!e.isFile())continue;
   if(DICT.test(e.name)||(IMG.test(e.name)&&!noimage)){if(!add(abs,rel,e.name))return;}
  }
 }
 for(const target of targets){
  if(/^https?:\/\//i.test(target)){
   try{const u=new URL(target),name=decodeURIComponent(path.posix.basename(u.pathname))||'download';
    if(!(DICT.test(name)||IMG.test(name))){problems.push(target+': URL must end in .txt, .xlsx, .xls, .ods or a picture extension');continue;}
    if(IMG.test(name)&&noimage)continue;const data=await fetchUrl(target,5);
    if(total+data.length>LIMITS.total){problems.push('total size limit reached');continue;}
    files.push({name,rel:name,data});total+=data.length;
   }catch(e){problems.push(target+': '+e.message);}continue;
  }
  const abs=path.resolve(target);let st;try{st=fs.statSync(abs);}catch(e){problems.push(target+': '+e.message+sandboxHint(target));continue;}
  if(st.isDirectory()){walk(abs,path.basename(abs),0);continue;}
  if(!st.isFile()){problems.push(target+': not a file or folder');continue;}
  const base=path.basename(abs),dir=path.dirname(abs),folder=path.basename(dir)||'files';
  if(!(DICT.test(base)||IMG.test(base))){problems.push(target+': not a dictionary (.txt .xlsx .xls .ods) or picture');continue;}
  if(IMG.test(base)&&noimage)continue;
  const before=files.length;if(!add(abs,folder+'/'+base,base))continue;
  if(/\.txt$/i.test(base)&&!noimage&&files.length>before)addReferencedImages(abs,folder,dir,files[files.length-1].data.toString('utf8'));
 }
 return {files,problems};
}
module.exports={loadTargets,LIMITS};
