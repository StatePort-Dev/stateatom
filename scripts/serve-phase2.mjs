// Run the existing synthetic project with the open development instrumentation enabled.
import {startServer} from '../stateatom-phase2/server.mjs';
const server = await startServer('B');
console.log('StateAtom synthetic project: http://127.0.0.1:4173/react/');
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => { await server.close(); process.exit(0); });
}
