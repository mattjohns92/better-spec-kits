---
applyTo: "specs/**/spec.md"
---

# Specify: Preserve Approved Scope

When creating or updating a feature specification, treat the original request and any applicable Scope Feature Brief as user intent, not as approval for every behavior discovered while elaborating it. Inspect relevant repository evidence before asking the user for facts the project can establish.

### Optional Graphify Repository Evidence

Graphify is optional repository intelligence. Use it only when a relevant graph and query surface are already available and can materially reduce discovery. Treat graph output as a map, not proof: verify material conclusions against authoritative source. If Graphify or a useful graph/query surface is unavailable or unhelpful, continue with existing repository investigation.

Graph evidence does not establish requirement approval or broaden approved scope. Requirements must remain traceable to approved intent, project constraints, or evidenced necessary consequences.

Before writing a material behavior as an authoritative requirement, classify its provenance:

- **Supported by approved intent**: directly traceable to the original request, Scope-owned intended outcome/boundary, or an explicit user clarification or approval. It may be written as a testable requirement.
- **Necessary consequence**: repository evidence shows it is required to deliver approved behavior correctly and safely or preserve required existing behavior. It may be written as supporting scope with a concise explanation of why it is necessary.
- **Unresolved material decision or recommendation**: multiple reasonable behaviors would materially change the outcome, risk, compatibility, operation, UX, or implementation breadth, or the proposed improvement is not required. Do not silently choose an option and do not write it as a settled requirement. Preserve it for Clarify as an explicit unresolved question or recommendation.

Security, best practice, maintainability, future reuse, architectural elegance, or possible future value alone do not make a behavior necessary. Prefer existing behavior when it already satisfies the approved outcome. A requirement's presence or repetition in another artifact does not establish approval.

Do not treat the specification as ready for planning while an unresolved material decision remains. Clarify owns user questioning and decision integration: wait for the user's decision, then reconcile affected requirements and remove rejected or branch-dependent behavior. Do not add another workflow stage, ask the user repository-answerable facts, or require approval for ordinary technical details that do not materially change the approved outcome.

This is project guidance for the existing upstream Specify command; it does not replace or modify that command. Instruction presence alone does not prove runtime application. Verify this guidance in a fresh supported-agent Specify session before claiming the Specify-time guard works. If the runtime does not apply it, report the limitation rather than silently managing or replacing upstream Specify.
