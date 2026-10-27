// SPDX-License-Identifier: Apache-2.0
// Test-case feasibility only. This function never grants an inspection mode.
// Atom runtime's readonly event branch retains contexts, not script bodies.
export function assertNativeCompilationEvidence({readOnly,requireModuleDigests}){
 if(typeof readOnly!=='boolean'||typeof requireModuleDigests!=='boolean')throw new TypeError('Explicit compilation-evidence requirements are required');
 if(readOnly&&requireModuleDigests){
  const error=new Error('READONLY_MODULE_EVIDENCE_UNAVAILABLE: readonly Atom does not collect script bodies; this case cannot require loaded-module journal digests. No browser attempt is admitted.');
  error.code='READONLY_MODULE_EVIDENCE_UNAVAILABLE';throw error;
 }
}
