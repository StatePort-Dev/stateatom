// SPDX-License-Identifier: Apache-2.0
import {createDebuggerGuardian} from '../../../core/debugger-guardian.mjs';
import {registryDispatcher} from '../../../core/guardian-worker-wire.mjs';
import {debuggerCommandCapability} from './capabilities.mjs';
const dispatch=registryDispatcher(createDebuggerGuardian({commandCapability:debuggerCommandCapability}));
self.addEventListener('message',event=>self.postMessage(dispatch(event.data)));
