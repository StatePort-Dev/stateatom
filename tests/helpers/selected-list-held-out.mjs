// SPDX-License-Identifier: Apache-2.0
// Fixed control313: AST token renaming and module relocation of retained TodoMVC.
// This prepares test source only; no product resolver reads this mapping.
import path from 'node:path';import {cp,readdir,readFile,writeFile,mkdir,rm} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';
const traverse=traverseModule.default||traverseModule,sha=b=>createHash('sha256').update(b).digest('hex');
const rename={App:'Scene',Main:'Board',Item:'TaskRow',Footer:'Summary',Header:'EntryBox',Input:'TextEntry',todoReducer:'reduceRecords',todos:'records',todo:'record',title:'caption',newTitle:'nextCaption',visibleTodos:'visibleRecords',activeTodos:'activeRecords',updateItem:'renameRecord',addItem:'createRecord'};
function location(file){return file.replace(/^src\/todo\//,'src/features/tasks/').replace('/components/','/views/').replace(/\/app\.(jsx|css)$/,'/scene.$1').replace(/\/reducer\.js$/,'/logic.js').replace(/\/main\.jsx$/,'/board.jsx').replace(/\/item\.jsx$/,'/row.jsx').replace(/\/footer\.jsx$/,'/summary.jsx');}
export const heldOutSource={appRoot:'app',entry:'src/index.js',root:{file:'src/features/tasks/scene.jsx',export:'Scene'},field:'caption',sources:['src/features/tasks/scene.jsx','src/features/tasks/logic.js','src/features/tasks/views/board.jsx','src/features/tasks/views/row.jsx','src/features/tasks/views/summary.jsx']};
export async function prepareSelectedListHeldOut(original,destination){
 await cp(original,destination,{recursive:true,errorOnExist:true,force:false});
 const names=[];async function walk(dir){for(const entry of await readdir(path.join(original,dir),{withFileTypes:true})){const file=path.posix.join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(entry.isFile())names.push(file);else throw Error('Held-out source symlink denied');}}
 await walk('src');const originals=new Map();for(const file of names)originals.set(file,await readFile(path.join(original,file),'utf8'));
 const records=[];
 for(const [file,text]of originals){let changed=text;
  if(/\.[jt]sx?$/.test(file)){
   const edits=new Map(),ast=parse(text,{sourceType:'module',plugins:['jsx']});
   const add=(node,value)=>edits.set(node.start+':'+node.end,{start:node.start,end:node.end,value});
   traverse(ast,{Identifier({node}){if(rename[node.name])add(node,rename[node.name]);},JSXIdentifier({node}){if(rename[node.name])add(node,rename[node.name]);},StringLiteral({node,parent}){
    if(!['ImportDeclaration','ExportNamedDeclaration','ExportAllDeclaration'].includes(parent.type)||parent.source!==node||!node.value.startsWith('.'))return;
    const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(file),node.value)),target=[resolved,resolved+'.js',resolved+'.jsx',resolved+'.css'].find(p=>originals.has(p));if(!target)throw Error('Unknown held-out relative import');
    let value=path.posix.relative(path.posix.dirname(location(file)),location(target));if(!path.posix.extname(node.value))value=value.replace(/\.[^.]+$/,'');if(!value.startsWith('.'))value='./'+value;add(node,JSON.stringify(value));
   }});
   for(const edit of [...edits.values()].sort((a,b)=>b.start-a.start))changed=changed.slice(0,edit.start)+edit.value+changed.slice(edit.end);
   if(file==='src/todo/components/item.jsx'){
    const declaration='const { caption, completed, id } = record;';if(!changed.includes(declaration))throw Error('Held-out alias insertion site changed');changed=changed.replace(declaration,'const sourceRecord = record;\n    const { caption, completed, id } = sourceRecord;');
   }
  }
  const target=location(file);await mkdir(path.dirname(path.join(destination,target)),{recursive:true});await writeFile(path.join(destination,target),changed);
  records.push({original:file,originalSha256:sha(text),file:target,sha256:sha(changed)});
 }
 await rm(path.join(destination,'src/todo'),{recursive:true});
 return{schema:'stateatom.selected-list-held-out-source/1',source:heldOutSource,files:records.sort((a,b)=>a.file.localeCompare(b.file)),scope:'Fixed renamed and relocated original app with local row alias; no rendered value, native occurrence or resolver oracle'};
}
