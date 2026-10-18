# Exact script inventory acquisition plan

1. Implement a bounded pure ledger for context/script/source/receipt facts, with
   fail-closed tests for substitutions, missing/ambiguous bytes, late history,
   overflow and checkpoint invalidation. It must never emit fullPath:true.
2. Add a separate native acquisition harness using the existing Vite configuration
   and pinned Playwright Chromium. Start CDP before navigation, record final trusted
   response bytes, include dependency scripts and exact inline document scripts.
   Avoid page evaluation that would hide unmatched main-world executable code.
3. Run unchanged original P2/P1 and preregistered negative controls. Report what
   acquisition actually establishes. Do not integrate a field-ancestry claim.
4. Review the facts before attempting a bounded ownership/effect certificate.
   Unknown cache/React aliases and other realms remain explicit gaps.
