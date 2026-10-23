// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import path from 'node:path';
export function summarizeInstalledEvidence({expected,installed,host,source,audit,workspace}){
  assert.equal(installed.loadedFromIsolatedInstallation,true);
  assert.equal(installed.packagedManifestMatched,true);
  for(const key of['id','version','vsixSha256','bundleSha256'])assert.equal(installed[key],expected[key],key);
  for(const key of['vsixSha256','bundleSha256'])assert.match(expected[key],/^[a-f0-9]{64}$/);
  assert.equal(host.passed,true);assert.equal(host.trusted,true);assert.match(host.version,/^\d+\.\d+\.\d+/);
  assert(!path.isAbsolute(source.file));const relative=path.relative(workspace,path.resolve(workspace,source.file));
  assert(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative),'Source must remain in chosen workspace');
  assert.equal(audit.file,path.resolve(workspace,source.file));assert.equal(audit.observedBy,'VS Code window.activeTextEditor API');
  for(const key of['line','column','endLine','endColumn']){assert(Number.isSafeInteger(source[key])&&source[key]>0);assert.equal(audit[key],source[key]);}
  assert.equal(audit.selectedText,source.selectedText);
  return{schema:'stateatom.installed-maintainer-evidence/1',helper:{id:expected.id,version:expected.version,vsixSha256:expected.vsixSha256,bundleSha256:expected.bundleSha256,installed:true},host:{version:host.version,trusted:true},opened:{file:source.file,line:source.line,column:source.column,endLine:source.endLine,endColumn:source.endColumn,selectedText:source.selectedText}};
}
