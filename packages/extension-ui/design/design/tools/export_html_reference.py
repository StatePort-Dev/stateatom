from pathlib import Path
from playwright.sync_api import sync_playwright
import json
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/"tests"))
from browser_support import launch_browser
R=Path(__file__).resolve().parents[2]; (R/'design/html-reference/generated').mkdir(parents=True,exist_ok=True); colors=[];vectors=[];screens=[]
extract=r'''(selector)=>{const root=document.querySelector(selector),rb=root.getBoundingClientRect(),out=[];let z=0;
const round=v=>Math.round(v*10)/10;
const pos=r=>[round(r.x-rb.x),round(r.y-rb.y),round(r.width),round(r.height)];
function visible(e){const r=e.getBoundingClientRect(),s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||r.width<=0||r.height<=0||r.bottom<=rb.top||r.top>=rb.bottom)return false;for(let p=e.parentElement;p&&p!==root;p=p.parentElement){const ps=getComputedStyle(p),pr=p.getBoundingClientRect();if(['hidden','auto','scroll'].includes(ps.overflowY)&&(r.top>=pr.bottom||r.bottom<=pr.top))return false;}return true}
const trans=c=>!c||c==='transparent'||c==='rgba(0, 0, 0, 0)';
function addText(e,str,rect,align){const s=getComputedStyle(e);let r=pos(rect);if(!str.trim())return;out.push({t:'t',r,text:str,size:parseFloat(s.fontSize),weight:parseInt(s.fontWeight)||400,color:s.color,mono:/mono|consolas|courier/i.test(s.fontFamily),align:align||s.textAlign,opacity:parseFloat(s.opacity),act:e.closest('[data-action]')?.dataset.action||null})}
function walk(e){if(!visible(e))return;let r=e.getBoundingClientRect(),s=getComputedStyle(e);if(e.tagName==='SVG'||e.tagName==='svg'){const c=e.cloneNode(true);c.setAttribute('xmlns','http://www.w3.org/2000/svg');c.setAttribute('color',s.color);c.setAttribute('fill',s.fill);c.setAttribute('stroke-width',s.strokeWidth);c.setAttribute('stroke-linecap',s.strokeLinecap);c.setAttribute('stroke-linejoin',s.strokeLinejoin);c.setAttribute('stroke',s.stroke==='none'?'none':s.stroke);c.querySelectorAll('*').forEach(n=>{if(n.getAttribute('stroke')==='currentColor')n.setAttribute('stroke',s.color);if(n.getAttribute('fill')==='currentColor')n.setAttribute('fill',s.color)});let svg=c.outerHTML.replaceAll('currentColor',s.color);out.push({t:'v',r:pos(r),svg});return}
if(e.tagName==='IMG'){if(e.src.startsWith('data:image/svg+xml')){const svg=atob(e.src.split(',')[1]);out.push({t:'v',r:pos(r),svg})}return}
const stroke=['Top','Right','Bottom','Left'].map(k=>({w:parseFloat(s['border'+k+'Width'])||0,c:s['border'+k+'Color']}));
if(!trans(s.backgroundColor)||stroke.some(x=>x.w)){out.push({t:'r',r:pos(r),fill:trans(s.backgroundColor)?null:s.backgroundColor,radius:parseFloat(s.borderTopLeftRadius)||0,stroke,opacity:parseFloat(s.opacity),name:e.className||e.tagName,act:e.dataset.action||null})}
if(['INPUT','TEXTAREA','SELECT'].includes(e.tagName)){
if(e.type==='radio'||e.type==='checkbox'){if(e.type==='checkbox'&&e.closest('.switch'))return;out.push({t:'r',r:pos(r),fill:e.checked?'rgb(11,92,255)':'rgb(255,255,255)',radius:20,stroke:[{w:1,c:'rgb(161,174,196)'},{w:1,c:'rgb(161,174,196)'},{w:1,c:'rgb(161,174,196)'},{w:1,c:'rgb(161,174,196)'}]});return}
let str=e.tagName==='SELECT'?e.selectedOptions[0]?.textContent:e.value;const pad=parseFloat(s.paddingLeft)||8;const ts={x:r.x+pad,y:r.y+(r.height-parseFloat(s.fontSize)*1.3)/2,width:r.width-pad*2,height:parseFloat(s.fontSize)*1.3};if(e.tagName==='TEXTAREA'){ts.y=r.y+(parseFloat(s.paddingTop)||8);ts.height=r.height-16;}addText(e,str||e.placeholder||'',ts,'left');if(e.tagName==='SELECT')out.push({t:'t',r:[round(r.right-rb.x-17),round(r.top-rb.y+9),10,14],text:'⌄',size:12,weight:400,color:s.color,mono:false});return}
// CSS switch shapes require explicit local vector equivalents.
if(e.matches('.switch>span')){let rr=pos(r),on=e.parentElement.querySelector('input').checked;out.push({t:'r',r:rr,fill:on?'rgb(11,92,255)':'rgb(203,212,226)',radius:20,stroke:[]});out.push({t:'r',r:[rr[0]+(on?rr[2]-18:3),rr[1]+3,rr[3]-6,rr[3]-6],fill:'rgb(255,255,255)',radius:20,stroke:[]});return}
for(const node of e.childNodes){if(node.nodeType===Node.TEXT_NODE&&node.textContent.trim()){const text=node.textContent;const range=document.createRange();range.selectNodeContents(node);const tr=range.getBoundingClientRect();if(tr.width>0&&tr.height>0)addText(e,text.replace(/\s+/g,' ').trim(),tr)}else if(node.nodeType===Node.ELEMENT_NODE)walk(node)}
}
walk(root);return {w:round(rb.width),h:round(rb.height),out}}'''
def pack(a):
 def ci(c):
  if c is None:return -1
  if c not in colors:colors.append(c)
  return colors.index(c)
 def vi(v):
  # remove redundant dimensions/class attrs, SVG self contained.
  if v not in vectors:vectors.append(v)
  return vectors.index(v)
 out=[]
 for n in a['out']:
  if n['t']=='r':out.append(['r',*n['r'],ci(n.get('fill')),round(n.get('radius',0),1),*[v for st in n.get('stroke',[]) for v in [st['w'],ci(st['c'])]],n.get('opacity',1)])
  elif n['t']=='t':out.append(['t',*n['r'],n['text'],n['size'],n['weight'],ci(n['color']),int(n.get('mono',False)),n.get('opacity',1)])
  else:out.append(['v',*n['r'],vi(n['svg'])])
 return {'w':a['w'],'h':a['h'],'e':out}
with sync_playwright() as p:
 b=launch_browser(p);page=b.new_page(viewport={'width':1440,'height':1000});page.set_content((R/'index.html').read_text())
 def save(key,title,selector):
  data=pack(page.evaluate(extract,selector));data.update(k=key,n=title);screens.append(data);page.locator(selector).screenshot(path=str(R/'design/html-reference/generated'/f'{key}-html.png'))
 def ev(code):page.evaluate(code)
 def click(act):page.locator('[data-action="'+act+'"]:visible').first.click()
 ev('StatePortV3.show("capture")');save('capture-ready','Capture / ready','.atom-panel')
 ev('StatePortV3.loadCapture("recording")');save('capture-recording','Capture / recording','.atom-panel');save('capture-floating','Capture / in-page controls','.capture-floating')
 ev('StatePortV3.loadCapture("review")');save('capture-review','Capture / awaiting Desktop Review','.atom-panel');click('x:desktop-review');save('desktop-review','Capture / Desktop Review handoff','#dialog');click('x:dialog-cancel')
 ev('ext.capture.auth="exclude";X.receipt(ext);render()');save('capture-saved','Capture / saved receipt','.atom-panel')
 ev('StatePortV3.loadSettings("capture")');save('settings-capture','Settings / Capture · exact origin','#settings-shell')
 ev('StatePortV3.loadSettings("domains")');save('settings-domains','Settings / domain profiles','#settings-shell')
 ev('StatePortV3.loadSettings("maps");exui.draft.maps.mode="internal";exui.draft.maps.granted=true;checkMaps();');save('settings-maps','Settings / source maps · Exact','#settings-shell')
 ev('exui.mapFixture="mismatch";checkMaps()');save('settings-mismatch','Settings / build mismatch','#settings-shell')
 ev('StatePortV3.loadSettings("instrument")');save('settings-instrument','Settings / listeners & hooks','#settings-shell')
 ev('StatePortV3.loadSettings("localai")');save('settings-localai','Settings / local explanation · optional','#settings-shell')
 ev('StatePortV3.loadSettings("connections")');save('settings-connections','Settings / device connections','#settings-shell')
 ev('lp().instrument.native=true;StatePortV3.show("handlers")');page.locator('.atom-scroll .trace-details>summary').click();save('handlers','Atom / Action Inspector · handlers','.atom-panel')
 ev('StatePortV3.show("hooks")');save('hooks','Atom / component hooks','.atom-panel')
 ev('X.observe(ext);X.event(ext,false,false);StatePortV3.show("calls")');save('calls-future','Atom / Action Trace · future UX','.atom-panel')
 b.close()
data={'c':colors,'v':vectors,'s':screens};(R/'design/html-reference/generated'/'native-data.json').write_text(json.dumps(data,separators=(',',':'),ensure_ascii=False));print('screens',len(screens),'colors',len(colors),'vectors',len(vectors),'bytes',len(json.dumps(data)));print([(s['k'],len(s['e'])) for s in screens])
