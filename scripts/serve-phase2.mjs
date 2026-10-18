// Run the existing synthetic project with the open development instrumentation enabled.
import {startServer} from '../stateatom-phase2/server.mjs';
const reactHostProps=process.argv.includes('--react-host-props');
const fetchInitiators=process.argv.includes('--fetch-initiators');
const reactStateHandoffs=process.argv.includes('--react-state-handoffs');
const sourceWrites=process.argv.includes('--source-writes');
const writeAccessGuards=process.argv.includes('--write-access-guards');
const queryHandoffs=process.argv.includes('--query-handoffs'),queryCallCensus=process.argv.includes('--query-call-census'),queryWriteAccessGuards=process.argv.includes('--query-write-access-guards'),reactWriteAccessGuards=process.argv.includes('--react-write-access-guards');
const server = await startServer('B',{reactHostProps,fetchInitiators,reactStateHandoffs,sourceWrites,writeAccessGuards,queryHandoffs,queryCallCensus,queryWriteAccessGuards,reactWriteAccessGuards});
console.log('StateAtom synthetic project: http://127.0.0.1:4173/react/');
if(fetchInitiators)console.log('Experimental exact fetch acquisition enabled; complete HTTP provenance not established');
if(reactHostProps)console.log('Experimental host-props adapter:',server.phase2Plugin.reactHost?.contract.status,'(full HTTP provenance not established)');
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => { await server.close(); process.exit(0); });
}
