// SPDX-License-Identifier: Apache-2.0
// Synthetic, source-only action fixture.
export function useOrders() {
 const confirmOrder = () => { (window as any).actionInvocations++; };
 return {confirmOrder};
}
