import json,html,re
from pathlib import Path
R=Path(__file__).resolve().parents[1]/'html-reference/generated';d=json.loads((R/'native-data.json').read_text());(R/'svg').mkdir(exist_ok=True)
def esc(t):return html.escape(str(t),quote=True)
def col(i):return d['c'][i] if i>=0 else 'none'
for s in d['s']:
 a=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{s["w"]}" height="{s["h"]}" viewBox="0 0 {s["w"]} {s["h"]}">']
 for k,e in enumerate(s['e']):
  t,x,y,w,h=e[:5];ident=f'n{k}'
  if t=='r':
   f,rad=e[5:7];stroke=e[7:-1];opacity=e[-1];a.append(f'<rect id="{ident}" x="{x}" y="{y}" width="{w}" height="{h}" rx="{min(rad,w/2,h/2)}" fill="{col(f)}" opacity="{opacity}"/>')
   if len(stroke)==8:
    pairs=list(zip(stroke[::2],stroke[1::2]))
    if len(set(pairs))==1 and pairs[0][0]>0:
     sw,c=pairs[0];a.append(f'<rect x="{x+sw/2}" y="{y+sw/2}" width="{max(0,w-sw)}" height="{max(0,h-sw)}" rx="{max(0,min(rad,w/2,h/2)-sw/2)}" fill="none" stroke="{col(c)}" stroke-width="{sw}" opacity="{opacity}"/>')
    else:
     coords=[(x,y,x+w,y),(x+w,y,x+w,y+h),(x,y+h,x+w,y+h),(x,y,x,y+h)]
     for (sw,c),(x1,y1,x2,y2) in zip(pairs,coords):
      if sw and 'rgba(0, 0, 0, 0)'!=col(c):a.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{col(c)}" stroke-width="{sw}"/>')
  elif t=='t':
   st,size,weight,c,mono,opacity=e[5:];font='Roboto Mono' if mono else 'Inter';weight=700 if weight>=650 else 600 if weight>=550 else 500 if weight>=450 else 400
   # Tight glyph bounding rects from Chromium: baseline follows the original text box.
   yy=y+(h+size*.72)/2 if '\n' not in st else y+size
   a.append(f'<text id="{ident}" x="{x}" y="{yy}" font-family="{font}" font-weight="{weight}" font-size="{size}" fill="{col(c)}" opacity="{opacity}">')
   if '\n' in st:
    for i,line in enumerate(st.split('\n')):a.append(f'<tspan x="{x}" y="{y+size+i*size*1.5}">{esc(line)}</tspan>')
   else:a.append(esc(st))
   a.append('</text>')
  else:
   svg=d['v'][e[5]];svg=re.sub(r'<svg\b',f'<svg x="{x}" y="{y}" width="{w}" height="{h}"',svg,count=1);a.append(svg)
 a.append('</svg>');(R/'svg'/f'{s["k"]}.svg').write_text(''.join(a))
print('exported',len(d['s']),'SVGs with native <text> and vector controls; no screenshots embedded')
