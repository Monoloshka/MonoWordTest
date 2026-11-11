'use strict';
const fs = require('fs');
const VALUE_OPTS = { '--log':'log', '--lang':'lang', '--font':'font', '--open':'open' };
const FLAG_OPTS = { '--help':'help', '-h':'help', '--version':'version', '-V':'version',
  '--noimage':'noimage', '--nosound':'nosound', '--nokeyboard':'nokeyboard', '--nomouse':'nomouse' };
function parseArgs(argv) {
  const opts={open:[],log:null,lang:null,font:null,help:false,version:false,noimage:false,nosound:false,nokeyboard:false,nomouse:false,unknown:[]};
  const errors=[]; let rest=false;
  for(let i=0;i<argv.length;i++){
    const a=String(argv[i]);
    if(rest){opts.open.push(a);continue;}
    if(a==='--'){rest=true;continue;}
    if(a.length>1&&a[0]==='-'){
      const eq=a.indexOf('='), name=(a.startsWith('--')&&eq>0)?a.slice(0,eq):a;
      const inline=(a.startsWith('--')&&eq>0)?a.slice(eq+1):null;
      if(VALUE_OPTS[name]){
        let val=inline;
        if(val===null){if(i+1<argv.length&&!String(argv[i+1]).startsWith('--')) val=String(argv[++i]); else {errors.push('option '+name+' needs a value');continue;}}
        if(val===''){errors.push('option '+name+' needs a value');continue;}
        if(name==='--open')opts.open.push(val);else opts[VALUE_OPTS[name]]=val;
      }else if(FLAG_OPTS[name]){
        if(inline!==null)errors.push('option '+name+' takes no value');else opts[FLAG_OPTS[name]]=true;
      }else opts.unknown.push(a);
      continue;
    }
    opts.open.push(a);
  }
  return {opts,errors};
}
function cleanFontName(name){const s=String(name||'').replace(/["'\\;{}<>\u0000-\u001f]/g,'').trim();return s.length&&s.length<=80?s:'';}
function helpText(version){return `MonoWordTest ${version} - translation guessing game

Usage: monowordtest [OPTIONS] [FILE|FOLDER|URL]...

Options:
  -h, --help            show this help and exit
  -V, --version         show the version and exit
      --open PATH|URL   import a dictionary (.txt .xlsx .xls .ods), related pictures, or a folder;
                        http(s) URLs are downloaded. Repeatable; plain file/folder/URL arguments also work.
      --lang CODE|FILE  select an available language (ru, de, ja ...) or load a language .json for this run
      --log FILE        append diagnostic logs to FILE; also show logs in the terminal
      --font NAME       use an installed font, e.g. --font impact
      --noimage         disable dictionary pictures, ad images and About icons
      --nosound         disable sounds
      --nokeyboard      ignore keyboard input inside the page; system shortcuts and function keys remain
      --nomouse         ignore mouse input inside the page; window controls remain available
  --                    treat all following arguments as file/folder/URL names

Examples:
  monowordtest --open ~/vocab --lang ru --nosound
  monowordtest --open ~/vocab/words.txt --open https://example.com/more.txt
  monowordtest --log ~/monowordtest.log --font impact
  monowordtest --lang ~/lang/ru.json

Flatpak:
  flatpak run io.github.monowordtest [OPTIONS]
  Flatpak can only read files explicitly granted to its sandbox:
  flatpak run --filesystem=/home/you/vocab:ro io.github.monowordtest --open /home/you/vocab
`;}
function readLanguage(value){
  if(!value) return {code:null,text:null};
  try{
    const st=fs.statSync(value);
    if(st.isFile()){
      if(st.size>2*1024*1024) throw new Error('language file exceeds 2 MB');
      return {code:null,text:fs.readFileSync(value,'utf8').replace(/^\uFEFF/,'')};
    }
  }catch(e){if(e.code!=='ENOENT'&&e.code!=='ENOTDIR')throw e;}
  return {code:value,text:null};
}
module.exports={parseArgs,cleanFontName,helpText,readLanguage};
