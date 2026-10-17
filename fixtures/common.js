export const initial={profile:{plan:'Premium',name:'Ada'},invoice:{cents:12345},flags:{enabled:true},hidden:{label:'Ghost'},metadata:{note:'unrelated'}};
export async function loadAccount(){return (await fetch('/api/account')).json();}
let cached;
export async function loadCounter(force=false){if(force||!cached)cached=(await (await fetch('/api/counter')).json()).counter;return cached;}
export function noise(){return fetch('/api/noise').then(r=>r.json());}
export function addShadows(){for(const mode of ['open','closed']){const host=document.createElement('aside');host.id=mode+'-shadow';host.attachShadow({mode}).innerHTML='<span id="shadow-label">Shadow '+mode+'</span>';document.body.append(host);}}
