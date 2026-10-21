// SPDX-License-Identifier: Apache-2.0
// Node preparation only; the lexical resolver is shared with browser source analysis.
import {createHash} from 'node:crypto';
import {vueSourceUnit} from './vue-source.mjs';
import {analyzeSourceActions} from './action-analysis-pure.mjs';
const prepare=f=>({...f,importName:undefined,sourceDigest:createHash('sha256').update(f.text).digest('hex')});
export function analyzeActions(files,selection,identity,graph,projectFiles=files){
 const prepared=files.map(prepare),project=projectFiles===files?prepared:projectFiles.map(prepare);
 return analyzeSourceActions(prepared,selection,identity,graph,project,{vueSourceUnit});
}
