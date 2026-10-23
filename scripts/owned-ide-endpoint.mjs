// SPDX-License-Identifier: Apache-2.0
// readOutput must read an exclusive fresh log attached only to this child.
// Never fall back to HTTP discovery: the port may now belong to another launch.
export async function connectOwnedIDE({readOutput,isRunning,connect,timeout=45000}) {
  const started=Date.now();
  do {
    if(!isRunning())throw Error('Owned IDE child exited before debugger connection');
    const output=await readOutput();
    if(!isRunning())throw Error('Owned IDE child exited while acquiring debugger endpoint');
    const lines=output.split(/\r?\n/).slice(0,-1).filter(line=>line.startsWith('DevTools listening on '));
    if(lines.length) {
      if(lines.length!==1)throw Error('Ambiguous own IDE debugger endpoint');
      const endpoint=lines[0].slice('DevTools listening on '.length);
      if(!/^ws:\/\/127\.0\.0\.1:49331\/devtools\/browser\/[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/.test(endpoint))throw Error('Invalid own IDE debugger endpoint');
      const browser=await connect(endpoint,{timeout:10000});
      if(!isRunning()){await browser.close();throw Error('Owned IDE child exited during debugger connection');}
      return browser;
    }
    if(Date.now()-started>=timeout)break;
    await new Promise(resolve=>setTimeout(resolve,100));
  }while(Date.now()-started<=timeout);
  throw Error('Timed out waiting for own IDE debugger endpoint');
}
