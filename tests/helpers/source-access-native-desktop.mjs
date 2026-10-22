// SPDX-License-Identifier: Apache-2.0
// Linux Chrome153 native UI helpers, confined to one nested display/profile.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {access,open} from 'node:fs/promises';
import {waitFor} from '../../scripts/harness.mjs';
export async function sourceAccessDesktop(out){
 let n=97;while(await access('/tmp/.X11-unix/X'+n).then(()=>true,()=>false))n++;
 const display=':'+n,log=await open(out+'/xephyr.log','a'),child=spawn('Xephyr',[display,'-screen','1100x900','-nolisten','tcp','-noreset','-ac'],{stdio:['ignore',log.fd,log.fd]});
 await waitFor(()=>access('/tmp/.X11-unix/X'+n).then(()=>true,()=>false));
 const native=args=>execFileSync('xdotool',args,{env:{...process.env,DISPLAY:display},timeout:3000,stdio:'pipe'}).toString().trim();
 // Discard the first live X11 frames after native tab/dialog transitions; this
 // is capture stabilization, never TLS/permission preapproval or a timing metric.
 const shot=file=>execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-f','x11grab','-video_size','1100x900','-i',display,'-ss','0.25','-frames:v','1',file],{timeout:5000,stdio:'pipe'});
 return{display,native,shot,async decide(file,decision,{delay=1000}={}){await new Promise(r=>setTimeout(r,delay));shot(file);native(['mousemove',decision==='deny'?'628':'704','281','click','1']);},async close(){if(child.exitCode===null)child.kill('SIGTERM');await log.close();}};
}
export async function importProfileRoot(browser,desktop,root,out){
 const cert=await browser.context.newPage();await cert.goto('chrome://certificate-manager/localcerts/usercerts');
 // These exact controls were observed in this Chrome153 native Certificate Manager.
 const point=await waitFor(()=>cert.evaluate(()=>{const sub=document.querySelector('certificate-manager')?.shadowRoot?.querySelector('#userCertsSection')?.shadowRoot;if(!sub)return null;for(const list of sub.querySelectorAll('certificate-list')){const b=list.shadowRoot?.querySelector('[aria-label="Import to Trusted Certificates"]');if(b){const r=b.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};}}return null;}));
 const session=await cert.session();await session.send('Page.bringToFront');for(const type of['mouseMoved','mousePressed','mouseReleased'])await session.send('Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});
 const xid=await waitFor(()=>{try{const id=desktop.native(['search','--onlyvisible','--name','^Open File$']).split('\n').filter(Boolean).at(-1);if(!id)return null;desktop.native(['windowfocus',id]);return id;}catch{return null;}});
 desktop.native(['key','--clearmodifiers','ctrl+l']);desktop.native(['type','--clearmodifiers','--delay','1',root]);
 desktop.shot(out+'-root-chooser-candidate.png');const geometry=desktop.native(['getwindowgeometry','--shell',xid]),g=Object.fromEntries(geometry.split('\n').map(s=>s.split('=')));assert(Number(g.WIDTH)>500&&Number(g.HEIGHT)>300);
 desktop.native(['mousemove',String(Number(g.X)+Number(g.WIDTH)-49),String(Number(g.Y)+Number(g.HEIGHT)-22),'click','1']);
 const labels=await waitFor(()=>cert.evaluate(()=>{const sub=document.querySelector('certificate-manager')?.shadowRoot?.querySelector('#userCertsSection')?.shadowRoot;let text='';function walk(e){if(!e)return;for(const c of e.children){text+=(c.textContent||'')+' '+(c.getAttribute('title')||'')+' '+(c.getAttribute('aria-label')||'')+' ';if(c.shadowRoot)walk(c.shadowRoot);walk(c);}}walk(sub);return text.includes('StateAtom P03 workflow disposable root')?text:null;}));
 desktop.shot(out+'-root-imported-candidate.png');await session.detach();return{nativeChooser:true,rootVisible:true,labels:labels.slice(0,1800)};
}
