// Synthetic, shareable native handlers. No framework or application instrumentation.
window.fixtureBanner = '🔎 é';
window.actionCounts = {first:0,second:0,delegated:0};
function firstAction(event) { window.actionCounts.first++; window.lastAction = 'FIRST_HANDLER_PRIVATE'; }
function secondAction(event) { window.actionCounts.second++; window.lastAction = 'SECOND_HANDLER_PRIVATE'; }
function delegatedAction(event) { window.actionCounts.delegated++; }
const first=document.getElementById('first'),second=document.getElementById('second');
first.addEventListener('click',firstAction);
second.addEventListener('click',secondAction);
document.body.addEventListener('click',delegatedAction);
window.fixtureControls={
 removeFirst(){first.removeEventListener('click',firstAction);first.removeEventListener('click',secondAction);},
 replaceFirst(){first.replaceWith(first.cloneNode(true));},
 rebindFirst(){first.removeEventListener('click',firstAction);first.addEventListener('click',secondAction);}
};
