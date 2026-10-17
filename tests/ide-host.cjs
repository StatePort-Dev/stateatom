const offline=require('./offline-guard.cjs');const vscode=require('vscode');const fs=require('node:fs/promises');const path=require('node:path');const assert=require('node:assert/strict');
exports.run=async()=>{
 const runtime=process.env.XRAY_RUNTIME;let extension=vscode.extensions.getExtension('local-research.stateatom-dev-helper');assert.ok(extension,'real extension loaded');await extension.activate();
 const deadline=Date.now()+90000;let conn;while(Date.now()<deadline){conn=extension.exports.getConnection();if(conn)break;await new Promise(r=>setTimeout(r,100));}
 assert.ok(vscode.workspace.isTrusted,'test workspace explicitly trusted in isolated profile');assert.ok(conn,'bridge running in real Extension Host');
 await vscode.commands.executeCommand('xray.pair');assert.ok(vscode.window.activeTextEditor.document.getText().includes(conn.token),'pairing command shows current token in IDE only');await fs.writeFile(path.join(runtime,'pairing-command.json'),JSON.stringify({passed:true,tokenDisplayed:true,tokenLogged:false}));
 await fs.writeFile(path.join(runtime,'connection.json'),JSON.stringify(conn),{mode:0o600});
 const capture=async()=>{const e=vscode.window.activeTextEditor;if(!e||e.document.uri.scheme!=='file')return;await fs.appendFile(path.join(runtime,'ide-audit.jsonl'),JSON.stringify({file:e.document.uri.fsPath,line:e.selection.start.line+1,column:e.selection.start.character+1,endLine:e.selection.end.line+1,endColumn:e.selection.end.character+1,selectedText:e.document.getText(e.selection).slice(0,300),observedBy:'VS Code window.activeTextEditor API',at:Date.now()})+'\n');};
 const sub1=vscode.window.onDidChangeActiveTextEditor(capture),sub2=vscode.window.onDidChangeTextEditorSelection(capture);
 while(Date.now()<deadline+1200000){try{const done=JSON.parse(await fs.readFile(path.join(runtime,'done.json'),'utf8'));sub1.dispose();sub2.dispose();if(done.requireOpen){const audit=await fs.readFile(path.join(runtime,'ide-audit.jsonl'),'utf8');assert.match(audit,/fixtures\//);}await fs.writeFile(path.join(runtime,'offline-host.json'),JSON.stringify(offline));await fs.writeFile(path.join(runtime,'host-complete.json'),JSON.stringify({passed:true,trusted:vscode.workspace.isTrusted,version:vscode.version}));return;}catch(e){if(e.code!=='ENOENT')throw e;}await new Promise(r=>setTimeout(r,200));}
 throw Error('Experiment host timed out');
};
