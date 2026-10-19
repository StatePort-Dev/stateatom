// SPDX-License-Identifier: Apache-2.0
import {runGuardianDocument} from './guardian-document.mjs';
runGuardianDocument({runtime:chrome.runtime,WorkerCtor:Worker,documentURL:location.href});
