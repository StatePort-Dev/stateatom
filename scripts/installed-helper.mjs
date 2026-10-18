// SPDX-License-Identifier: Apache-2.0
// Acceptance-only file identity checks; no application/bridge execution.
import {readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
export const helperDigest=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function verifyInstalledHelper({extensionPath,extensionsDir,expected}){
 const base=await realpath(extensionsDir),actual=await realpath(extensionPath),relative=path.relative(base,actual);
 if(!relative||relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))throw Error('Loaded helper is outside isolated extensions directory');
 const bytes=await readFile(path.join(actual,'package.json')),pkg=JSON.parse(bytes);
 const packaged={...pkg};delete packaged.__metadata;
 const manifestMatches=expected.packageManifest?isDeepStrictEqual(packaged,expected.packageManifest):helperDigest(bytes)===expected.packageSha256;
 if(!manifestMatches||pkg.publisher+'.'+pkg.name!==expected.id||pkg.version!==expected.version||pkg.main!=='./'+expected.main)throw Error('Installed package metadata/entry differs from reviewed VSIX');
 const entry=await realpath(path.join(actual,expected.main));if(path.dirname(entry)!==actual)throw Error('Installed entry is outside extension directory');
 const bundleSha256=helperDigest(await readFile(entry));if(bundleSha256!==expected.bundleSha256)throw Error('Installed bundle differs from reviewed VSIX');
 return{id:expected.id,version:pkg.version,installedPackageSha256:helperDigest(bytes),packagedManifestSha256:expected.packageSha256,packagedManifestMatched:true,bundleSha256,loadedFromIsolatedInstallation:true};
}
