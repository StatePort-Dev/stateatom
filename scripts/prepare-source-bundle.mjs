// SPDX-License-Identifier: Apache-2.0
import {prepareReleaseBundle} from '../core/release-bundle.mjs';
const usage='Usage: npm run prepare:source-bundle -- --root <built-directory> --recipe <recipe.json> --output <new-local.zip>';
function argumentsFor(args){
 const values={};for(let i=0;i<args.length;i+=2){const name=args[i],value=args[i+1];if(!['--root','--recipe','--output'].includes(name)||Object.hasOwn(values,name)||!value||value.startsWith('--'))throw Error(usage);values[name]=value;}
 if(Object.keys(values).length!==3)throw Error(usage);return{root:values['--root'],recipeFile:values['--recipe'],outputFile:values['--output']};
}
const controller=new AbortController(),cancel=()=>controller.abort();
if(process.argv.length===3&&process.argv[2]==='--help')console.log(usage);
else{
 process.once('SIGINT',cancel);process.once('SIGTERM',cancel);
 try{const options=argumentsFor(process.argv.slice(2));console.log(JSON.stringify(await prepareReleaseBundle({...options,signal:controller.signal})));}
 catch(error){
  const filesystem={EEXIST:'Output exists; choose a new file',ENOENT:'Explicit input or output directory is missing',EACCES:'Local filesystem access denied',EPERM:'Local filesystem access denied',ELOOP:'Symlink input refused',EISDIR:'A regular file is required'};
  const reason=filesystem[error.code]??(error.code?'Local preparation failed ('+String(error.code).slice(0,64)+')':String(error.message).slice(0,512));
  console.error(JSON.stringify({status:'REFUSED',reason}));process.exitCode=controller.signal.aborted?130:1;
 }finally{process.removeListener('SIGINT',cancel);process.removeListener('SIGTERM',cancel);}
}
