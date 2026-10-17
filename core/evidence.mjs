const kinds=new Set(['Observed','Code-linked','Experimentally verified','Candidate','Unknown','Unsupported','Unknown/Unsupported','Stale']);
export function edge(from,to,relation,status,method,evidence,identity){
 if(!kinds.has(status)||!identity?.run||!identity?.build||!evidence.length)throw Error('Invalid evidence edge');
 return {from,to,relation,status,method,evidence,conditions:[],...identity};
}
export function assessExperiment(trials,expectedBuild=trials[0]?.build){
 const valid=!!expectedBuild&&trials.length>=3&&trials.every(t=>t.build===expectedBuild&&t.buildStable!==false&&t.reset&&t.consumed===1&&t.controlConsumed===1&&t.a===t.rollback&&t.a===t.control&&t.a!==t.b)&&new Set(trials.map(t=>JSON.stringify([t.a,t.b]))).size===1;
 return {status:valid?'Experimentally verified':'Unknown',reason:valid?'3 reproducible ABA trials and irrelevant-field controls; endpoint influence only':'insufficient, unchanged, confounded, unconsumed or nondeterministic trials'};
}
export function flatten(value,prefix='',out=[]){
 if(out.length>=512)return out;
 if(value!==null&&typeof value==='object'){for(const [k,v] of Object.entries(value))if(!['__proto__','constructor','prototype'].includes(k))flatten(v,prefix?prefix+'.'+k:k,out);}
 else out.push({path:prefix,value});return out;
}
