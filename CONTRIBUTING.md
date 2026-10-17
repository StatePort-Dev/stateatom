# Contributing to StateAtom

StateAtom is experimental. Start with [current status](docs/status.md) to understand what has been demonstrated and what remains blocked or unverified. Useful contributions include small adapter improvements, minimal reproductions, correctness fixes, and documentation that makes limitations or evidence easier to understand. A suggestion does not commit a contributor or maintainer to implementing every requested feature.

## Choose a bounded change

Describe the problem and the smallest useful outcome. An issue or task comment can help coordinate work, especially when behavior or architecture may change, but ordinary documentation fixes do not need a proposal process. For an architectural change, explain the tradeoff and its effect on the public project boundary in [architecture](docs/architecture.md) and [StatePort integration](docs/stateport-integration.md).

Read the instructions and source in the checkout you are changing. Use the root README for this checkout's installation, build, test, and local workflow commands. Record missing host prerequisites as a verification gap. Do not add commands that have not been checked, or describe planned releases, browsers, adapters, or reporting facilities as available.

Keep unrelated changes out of a contribution and preserve work already present. If the requested outcome requires a wider redesign, explain why and separate that decision from the bounded fix.

## Reproduce and verify

Provide a small reproducible example with synthetic, safe values. Include the source revision, relevant application and framework configuration, browser details, probes or instrumentation used, and the sequence that triggers the result. Remove secrets, personal data, private URLs, and identifying paths before sharing captures or screenshots.

For a behavior fix, preserve the original failure and include a justified control case. Explain the expected behavior and why the change preserves JavaScript semantics. A fix must not obtain a value by re-running an expression, invoking a getter again, or forcing a branch that the application skipped.

Follow [experiment guidance](docs/experiments.md). Keep the original acceptance criteria and report unsupported or unknown outcomes honestly. State what was actually checked, using which commands and configuration, and whether it ran through the interface or a harness. Targeted evidence is more useful than a test-count badge. Hardcoded fixtures and smoke checks cannot establish general support.

## Code origin and licensing

Read [licensing guidance](docs/licensing.md) before submitting code. The intended license for new original code is Apache-2.0, but the effective imported tree remains MIT with explicit Apache-2.0 files as listed in docs/provenance.md. Historical MIT experiment code must retain its provenance and applicable notices; it must not be silently relicensed.

Identify the origin and license of copied or adapted material, including generated output derived from external code. Do not include external code until its contribution license and compatibility are clear. This guide does not establish a CLA or DCO process.

## Submit a reviewable result

Explain the problem, change, checks, and remaining limitations. Use real evidence and plain English. AI-assisted contributions follow the same rules: an assistant may implement or run authorized checks, but must not invent captures, State Cards, screenshots, or verification results. Follow [AGENTS.md](AGENTS.md) for project working rules and [SECURITY.md](SECURITY.md) for sensitive reports.
