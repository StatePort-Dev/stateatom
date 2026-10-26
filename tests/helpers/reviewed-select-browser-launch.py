#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
# Closed pre-exec witness; never dumps the full environment or changes browser flags.
import hashlib,json,os,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
CASE=ROOT/'docs/testing/l02-comparison-reviewed-select-case82.json'
PROFILE=str(ROOT/'.artifacts/l02/model-native/2026-10-21T14-52-19-812Z/profile')
def project_witness(s,environment,identity,case_sha):
 assert s['id']=='L02.19-local82-reviewed-select-comparison' and s['maximumNativeRuns']==1
 assert re.fullmatch('[a-f0-9]{32}',s['nonce']) and re.fullmatch('[a-f0-9]{64}',case_sha)
 out=str(ROOT/'.artifacts/l02/rs'/s['nonce'][:8]);assert s['out']==out
 assert s['profile']['path']==PROFILE and s['profile']['uid']==identity['uid']
 assert s['chrome']['launcher']=='/usr/bin/google-chrome-stable'
 assert s['launchArguments']==['--remote-debugging-port=0','--user-data-dir='+PROFILE,'--no-first-run','--no-default-browser-check','--lang=en-US','--window-size=1100,1000','chrome://extensions/']
 e={k:environment[k] for k in ['DISPLAY','XAUTHORITY','DBUS_SESSION_BUS_ADDRESS','TMPDIR','XDG_RUNTIME_DIR']}
 assert all(isinstance(v,str) and 0<len(v)<=4096 and '\0' not in v for v in e.values())
 assert re.fullmatch(r':\d+',e['DISPLAY']) and e['XAUTHORITY']==out+'/xauth' and e['TMPDIR']==out+'/tmp' and e['XDG_RUNTIME_DIR']==out+'/runtime'
 assert re.fullmatch(r'unix:(?:path|abstract)=[^\s;]{1,400}(?:,guid=[a-f0-9]{32})?',e['DBUS_SESSION_BUS_ADDRESS'])
 assert isinstance(identity['pid'],int) and identity['pid']>0 and isinstance(identity['ppid'],int) and identity['ppid']>0 and re.fullmatch(r'\d+',identity['startTime'])
 return {'schema':'stateatom.portal-launch-environment/1','nonce':s['nonce'],'caseSha256':case_sha,**identity,'environment':e}
def main(args):
 assert args==[str(CASE)]
 raw=CASE.read_bytes();assert len(raw)<2*1024*1024;s=json.loads(raw)
 rawstat=Path('/proc/self/stat').read_text();start=rawstat[rawstat.rfind(')')+2:].split()[19]
 w=project_witness(s,os.environ,{'pid':os.getpid(),'ppid':os.getppid(),'startTime':start,'uid':os.getuid()},hashlib.sha256(raw).hexdigest())
 target=Path(s['out'])/'private-bus-environment.json';assert target.parent.resolve()==target.parent and target.parent.stat().st_uid==os.getuid()
 fd=os.open(target,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 with os.fdopen(fd,'w') as f:json.dump(w,f,separators=(',',':'));f.write('\n');f.flush();os.fsync(f.fileno())
 os.execv(s['chrome']['launcher'],[s['chrome']['launcher'],*s['launchArguments']])
if __name__=='__main__':main(sys.argv[1:])
