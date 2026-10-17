// Redact only own experiment pairing secrets. Never print or pass them in process arguments.
import{readFile,readdir,writeFile,rm}from'node:fs/promises';import{spawnSync}from'node:child_process';import{root}from'../scripts/vite-config.mjs';
const tokens=[];for(const e of await readdir(root+'/.runtime',{withFileTypes:true})){if(!e.isDirectory())continue;try{const c=JSON.parse(await readFile(root+'/.runtime/'+e.name+'/connection.json','utf8'));if(typeof c.token==='string'&&c.token.length>16)tokens.push(c.token);}catch{}}
const program=`import sys,json,zipfile,os,tarfile,io
x=json.load(open(sys.argv[1],encoding='utf8'));base=x['root'];tokens=[t.encode() for t in x['tokens']];out=[]
for folder in ['artifacts','stateatom-phase2/artifacts','stateatom-phase2/development']:
 for directory,_,files in os.walk(base+'/'+folder):
  for name in files:
   p=os.path.join(directory,name);count=0
   if name.endswith('.zip'):
    entries=[]
    with zipfile.ZipFile(p) as z:
     for info in z.infolist():
      b=z.read(info.filename)
      for t in tokens: count+=b.count(t);b=b.replace(t,b'[REDACTED_PAIRING_TOKEN]')
      entries.append((info,b))
    if count:
     with zipfile.ZipFile(p+'.safe','w',zipfile.ZIP_DEFLATED) as z:
      for info,b in entries:z.writestr(info,b)
     os.replace(p+'.safe',p)
   elif name.endswith(('.json','.jsonl','.log','.txt','.md','.trace','.network')):
    b=open(p,'rb').read()
    for t in tokens:count+=b.count(t);b=b.replace(t,b'[REDACTED_PAIRING_TOKEN]')
    if count:open(p,'wb').write(b)
   if count:out.append({'file':os.path.relpath(p,base),'replacements':count})
# Verify archives without altering historical checksums. They must already exclude private connection files.
archives=[]
for directory,_,files in os.walk(base+'/stateatom-phase2/checkpoint'):
 for name in files:
  if not name.endswith('.tar.gz'):continue
  p=os.path.join(directory,name);hits=0
  with tarfile.open(p) as t:
   for info in t:
    if info.isfile():
     b=t.extractfile(info).read();hits+=sum(b.count(k) for k in tokens)
  archives.append({'file':os.path.relpath(p,base),'secretOccurrences':hits})
print(json.dumps({'redactions':out,'checkpointArchiveAudit':archives,'status':'PASS' if all(v['secretOccurrences']==0 for v in archives) else 'FAIL'}))
`;
const privateInput=root+'/.runtime/redaction-input-'+process.pid+'.json';await writeFile(privateInput,JSON.stringify({root,tokens}),{mode:0o600});let r;try{r=spawnSync('python3',['-c',program,privateInput],{stdio:['ignore','pipe','pipe'],encoding:'utf8',maxBuffer:8*1024*1024,timeout:30000});}finally{await rm(privateInput,{force:true});}if(r.status!==0)throw Error('Artifact sanitizer failed: '+(r.error?.message||r.signal||r.stderr));const result=JSON.parse(r.stdout);try{const prior=JSON.parse(await readFile(root+'/stateatom-phase2/artifacts/redactions.json','utf8'));result.redactions.unshift(...prior.redactions);}catch{}await writeFile(root+'/stateatom-phase2/artifacts/redactions.json',JSON.stringify(result,null,2));console.log(JSON.stringify({status:result.status,changedFiles:result.redactions.length,archives:result.checkpointArchiveAudit.length}));if(result.status!=='PASS')process.exitCode=1;
