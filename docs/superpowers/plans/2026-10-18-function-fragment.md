# Function-fragment prerequisite plan

1. Add failing generic tests for strict whole-body syntax, alias binding identity,
   primitive-read premises and refusal of hidden calls/global state/writes/escapes.
2. Implement a bounded AST-only verifier for one provided source file/function.
   It returns conditional syntax facts, never executes the function and never
   supplies a native identity/readonly or ownership certificate.
3. Extend the source-only experiment with the original two shared functions. Keep
   App cache/state/props boundaries and all missing runtime premises explicit.
4. Review and decide the next missing lifetime or source/compiled binding fact.
