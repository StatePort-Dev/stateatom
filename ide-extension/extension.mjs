import * as vscode from 'vscode';
import {createHelperSession} from './session.mjs';
const session=createHelperSession();let status={code:'DISCONNECTED',reason:'Trust and connect a local workspace.'};
export async function activate(context){
 const folders=()=>vscode.workspace.workspaceFolders?.filter(f=>f.uri.scheme==='file')||[];
 async function start(folder){
  if(!vscode.workspace.isTrusted)throw Error('Trust the workspace before enabling source access.');
  const choices=folders();if(!folder){if(choices.length!==1){status={code:'MULTIPLE_WORKSPACES',reason:'Run StateAtom: Copy connection receipt and explicitly choose one workspace.'};return;}folder=choices[0];}
  const root=folder.uri.fsPath,allowed=()=>vscode.workspace.isTrusted&&folders().some(f=>f.uri.fsPath===root);
  const cfg=vscode.workspace.getConfiguration('stateatom',folder.uri);
  const resolve=async(full,source,command)=>{if(!allowed())throw Error('Workspace trust changed');const uri=vscode.Uri.file(full);await vscode.workspace.openTextDocument(uri);return vscode.commands.executeCommand(command,uri,new vscode.Position(source.line-1,source.column-1));};
  try{await session.start({root,port:cfg.get('helperPort',47731),isAllowed:allowed,onConnectionRequest:async({origin,signal})=>{
   const sourceRoot=vscode.workspace.getConfiguration('stateatom',folder.uri).get('sourceFolder','.');
   const before=await session.receipt({origin,sourceRoot});if(signal.aborted||!allowed())return null;
   const choice=await vscode.window.showInformationMessage('Allow Atom to inspect source code for '+origin+'?',{modal:true,detail:'Project: '+folder.name+'\nSource folder: '+root+(sourceRoot==='.'?'':'/'+sourceRoot)+'\nAccess lasts for this helper session. You can stop it with StateAtom: Disconnect source helper. No files are changed.'},'Allow source access');
   if(choice!=='Allow source access'||signal.aborted||!allowed())return null;
   if(vscode.workspace.getConfiguration('stateatom',folder.uri).get('sourceFolder','.')!==sourceRoot)return null;
   const after=await session.receipt({origin,sourceRoot});return before.helper.session===after.helper.session?{sourceRoot}:null;
  },onOpen:async(full,source)=>{
   if(!allowed())throw Error('Workspace trust changed');
   const document=await vscode.workspace.openTextDocument(vscode.Uri.file(full)),start=new vscode.Position(source.line-1,source.column-1),end=new vscode.Position(Math.max(source.line-1,(source.endLine||source.line)-1),Math.max(0,(source.endColumn||source.column)-1));
   if(!allowed())throw Error('Workspace trust changed');const editor=await vscode.window.showTextDocument(document,{preview:false,selection:new vscode.Range(start,end)});editor.revealRange(editor.selection);
   return {file:editor.document.uri.fsPath,line:editor.selection.start.line+1,column:editor.selection.start.character+1,endLine:editor.selection.end.line+1,endColumn:editor.selection.end.character+1};
  },onDefinitions:(f,s)=>resolve(f,s,'vscode.executeDefinitionProvider'),onReferences:(f,s)=>resolve(f,s,'vscode.executeReferenceProvider')});status={code:'CONNECTED',reason:'Source helper listening on explicit loopback endpoint.'};}
  catch(e){status={code:'CONNECTION_FAILED',reason:e.message};throw e;}
 }
 async function copyReceipt(){
  try{const choices=folders();if(!vscode.workspace.isTrusted||!choices.length)throw Error('Trust and open a local workspace first.');const folder=choices.length===1?choices[0]:await vscode.window.showQuickPick(choices.map(f=>({label:f.name,description:f.uri.fsPath,folder:f})),{placeHolder:'Choose the workspace authorized for source access'}).then(v=>v?.folder);if(!folder)return;
   await start(folder);const cfg=vscode.workspace.getConfiguration('stateatom',folder.uri),receipt=await session.receipt({origin:cfg.get('appOrigin','http://localhost:5173'),sourceRoot:cfg.get('sourceFolder','.')});await vscode.env.clipboard.writeText(JSON.stringify(receipt));vscode.window.showInformationMessage('Private StateAtom connection receipt copied. Paste it only into the Atom extension Source connection settings. It contains a session secret.');return receipt;
  }catch(e){vscode.window.showErrorMessage('StateAtom: '+e.message);return null;}
 }
 context.subscriptions.push(
  vscode.workspace.onDidGrantWorkspaceTrust(()=>void start().catch(e=>vscode.window.showErrorMessage(e.message))),
  vscode.workspace.onDidChangeWorkspaceFolders(()=>{void session.stop();status={code:'WORKSPACE_CHANGED',reason:'Copy a fresh receipt after choosing the workspace.'};}),
  vscode.commands.registerCommand('stateatom.copyConnectionReceipt',copyReceipt),
  vscode.commands.registerCommand('stateatom.disconnect',async()=>{await session.stop();status={code:'DISCONNECTED',reason:'Source access stopped; Basic inspection remains available.'};}),
  vscode.commands.registerCommand('xray.pair',async()=>{try{await start();const c=session.connection;if(!c)throw Error(status.reason);const doc=await vscode.workspace.openTextDocument({language:'plaintext',content:'StateAtom local pairing (keep private)\nBridge: '+c.url+'\nToken: '+c.token+'\nPrefer StateAtom: Copy connection receipt for the configured app/source folder.\n'});await vscode.window.showTextDocument(doc,{preview:true});}catch(e){vscode.window.showErrorMessage('StateAtom: '+e.message);}}),
  {dispose(){void session.stop();}}
 );
 await start().catch(()=>{});return {getConnection:()=>session.connection,getStatus:()=>status};
}
export function deactivate(){return session.stop();}
