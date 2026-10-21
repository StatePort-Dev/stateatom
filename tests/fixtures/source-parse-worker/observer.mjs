// SPDX-License-Identifier: Apache-2.0
// Test-only positive network-observer control, unrelated to source artifact execution.
fetch('/observer-probe').then(response=>response.text()).then(text=>self.postMessage({text}));
