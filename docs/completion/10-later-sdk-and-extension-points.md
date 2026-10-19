# StatePort SDK ownership and later extension points

## Production SDK: outside StateAtom scope

The scope review assigns the production SDK to the **wider StatePort project**. It is not a StateAtom delivery task, optional baseline component or release dependency. Historical identifiers O03/S01 are retained only as cross-project references. The former S01 feasibility gate is removed from the active Atom task index.

Atom must remain useful without that SDK, with ordinary application accounts and no added QA roles or StateAtom login. Its already-approved open development plugin and IDE helper stay in Atom's C02 scope; moving the production SDK does not remove those integrations.

SDK design, implementation, security/performance evaluation and rollout belong to a separately authorized StatePort task. This package does not prescribe that future implementation. If it later provides a documented evidence contract, Atom can consider a bounded consumer adapter in another change. No placeholder SDK, diagnostic backend or forced integration is needed to finish Atom.

## Additional properties and state adapters

The approved input-editing work is U02: Live for most inputs in its declared editable scope, plus grouped Draft/Apply, undo and baseline return. It is not deferred to the production SDK. Direct writing of an observed value still needs a supported revision-checked adapter and a testable cleanup path.

Text and Disabled are the reviewed property surface. Further property candidates include checked/value, expanded state, visibility and validation messages. They remain separate additions unless the selected approved workflow actually requires them. Define their observation/producer semantics and false-attribution controls; a CSS visibility result is not equivalent to a DOM `hidden` flag.

## Framework expansion

Universal Basic and positive React/Vue coverage are mandatory. Deeper Angular, Svelte and other framework adapters remain outside the completed baseline and follow concrete application cases. Keep framework-specific acquisition isolated without requiring a marketplace or universal adapter DSL.

## Action histories and application-wide analysis

Bounded Action Trace A05 is **mandatory**, not deferred here. Whole-app graphs, continuous execution history, causality across every async/worker boundary and replay of arbitrary actions are not part of that requirement. Further history depth needs its own scope, resource and correctness decision.

Automatic source-code bug fixing and effort/story-point estimates remain excluded. Atom can expose evidence that helps a developer or team make those decisions.

## StatePort handoff

Readable Atom investigations remain locally saveable and freely exportable. A State Card requires an actual supported capture and its admitted replay boundary. Link the artifacts; do not rename diagnostic JSON as a State Card. Capture/Replay and SDK implementation remain in StatePort, with no duplicate closed resolver or replay engine in Atom.
