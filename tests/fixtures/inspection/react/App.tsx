import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { calculateEligibility, selectAllowance } from '../shared/logic';
import { semanticCheck } from '../shared/semantics';
import { cache } from '../shared/cache';
function Row({ row }: any) { return <span className="row">{row.rules.quota}</span>; }
function App() {
  const [data, setData] = useState<any>(null);
  const [permission, setPermission] = useState<any>(null);
  const [race, setRace] = useState<any>(null);
  const [form, setForm] = useState('');
  useEffect(() => { void (async () => {
    const account = await (await fetch('/api/account')).json();
    const access = await (await fetch('/api/permission')).json();
    await (await fetch('/api/noise')).json();
    cache.setQueryData(['account'], account);
    setData(account); setPermission(access);
    const [slow, fast] = await Promise.all([fetch('/api/race').then(r=>r.json()),fetch('/api/race').then(r=>r.json())]);
    setRace(fast);
  })(); }, []);
  if (!data || !permission || !race) return <p>Loading</p>;
  const { rules: { quota: allowance } } = data;
  const shown = allowance + 1;
  const eligible = calculateEligibility(data);
  const cached = selectAllowance(cache.getQueryData(['account']));
  const creditHold = data.risk.hold;
  const canConfirm = permission.access.ready;
  const opaque = structuredClone(data);
  return <main><h1>StateAtom React + TS</h1>
    <p id="p1">{shown}</p>
    <button id="p2" disabled={!eligible}>Confirm transformed</button>
    <p id="p3">{cached}</p>
    <button id="p4" disabled={creditHold || !canConfirm}>Confirm combined</button>
    <label>Name <input id="form" value={form} onChange={e=>setForm(e.target.value)} /></label>
    <button id="p5" disabled={form.length < 3}>Local validation</button>
    <p id="p6">{race.amount}</p>
    <p id="opaque">{opaque.rules.quota}</p>
    <p id="semantics">{semanticCheck()}</p>
    <Row row={data}/><Row row={{rules:{quota:77}}}/>
  </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
