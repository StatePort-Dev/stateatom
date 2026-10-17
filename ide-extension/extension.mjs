import * as vscode from 'vscode';import {randomBytes} from 'node:crypto';import {startBridge} from '../core/bridge.mjs';
let bridge,connection;
export async function activate(context){
 const start=async()=>{if(bridge||!vscode.workspace.isTrusted)return;const root=vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!root)return;
  const token=randomBytes(32).toString('hex');connection={url:'http://127.0.0.1:47731',token,root};
  const resolve=async(full,source,command)=>{const uri=vscode.Uri.file(full);await vscode.workspace.openTextDocument(uri);return vscode.commands.executeCommand(command,uri,new vscode.Position(source.line-1,source.column-1));};
  bridge=startBridge({root,token,port:47731,onOpen:async(full,source)=>{
   const document=await vscode.workspace.openTextDocument(vscode.Uri.file(full));const start=new vscode.Position(source.line-1,source.column-1),end=new vscode.Position(Math.max(source.line-1,(source.endLine||source.line)-1),Math.max(0,(source.endColumn||source.column)-1));
   const editor=await vscode.window.showTextDocument(document,{preview:false,selection:new vscode.Range(start,end)});editor.revealRange(editor.selection);
   return {file:editor.document.uri.fsPath,line:editor.selection.start.line+1,column:editor.selection.start.character+1,endLine:editor.selection.end.line+1,endColumn:editor.selection.end.character+1};
  },onDefinitions:(f,s)=>resolve(f,s,'vscode.executeDefinitionProvider'),onReferences:(f,s)=>resolve(f,s,'vscode.executeReferenceProvider')});await bridge.ready;
 };
 context.subscriptions.push(vscode.workspace.onDidGrantWorkspaceTrust(()=>void start()),vscode.commands.registerCommand('xray.pair',async()=>{await start();if(!connection){vscode.window.showErrorMessage('Trust the workspace and open a folder first.');return;}const doc=await vscode.workspace.openTextDocument({language:'plaintext',content:'X-Ray local pairing (keep private)\nBridge: '+connection.url+'\nToken: '+connection.token+'\nChoose an app origin and source folder in the browser extension.\n'});await vscode.window.showTextDocument(doc,{preview:true});}),{dispose(){bridge?.server.close();}});
 await start();return {getConnection:()=>connection};
}
export function deactivate(){bridge?.server.close();}
