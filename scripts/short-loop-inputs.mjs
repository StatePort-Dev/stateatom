// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 StateAtom contributors.
import {readFile,readdir,lstat} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

export const todoRevision='ff43b02e59dfa604386bb382034b2cd07c2bcd8a';
export const fixtureEntries=['license.md',...['react','vue'].flatMap(stack=>[
 `examples/${stack}/src`,`examples/${stack}/public`,`examples/${stack}/package.json`,
 `examples/${stack}/package-lock.json`,...(stack==='vue'?['examples/vue/index.html']:[])
])];
export async function fileDigests(base,entries) {
 const result={};
 async function visit(relative) {
  const full=path.join(base,relative),stat=await lstat(full);
  if(stat.isSymbolicLink())throw Error('Unexpected symlink in verification input: '+relative);
  if(stat.isDirectory())for(const name of (await readdir(full)).sort())await visit(path.join(relative,name));
  else if(stat.isFile())result[relative]=createHash('sha256').update(await readFile(full)).digest('hex');
 }
 for(const entry of entries)await visit(entry);
 return result;
}
