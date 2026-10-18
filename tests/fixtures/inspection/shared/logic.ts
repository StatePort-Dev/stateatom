export function calculateEligibility(record: any) {
  const renamed = record.rules.quota * 2;
  return renamed >= 20;
}
export function selectAllowance(record: any) {
  const selected = record.rules.quota;
  return selected + 3;
}
