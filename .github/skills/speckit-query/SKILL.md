---
name: speckit-query
description: Answer natural-language questions about the current project using relevant repository evidence.
---

# Project Query

Answer the user's natural-language question about the current repository. Query is an independent project utility; invoke it directly with `/speckit.query <question>`. The user may ask in ordinary natural language and does not need to know repository paths, symbols, technologies, or workflow names.

### Optional Graphify Repository Discovery

Graphify is optional repository intelligence. Use it only when a relevant graph and query surface are already available and can materially reduce discovery. Treat graph output as a map, not proof: verify material conclusions against authoritative source. If Graphify or a useful graph/query surface is unavailable or unhelpful, continue with existing repository investigation.

## Investigate Before Answering

1. Inspect the current project before answering and identify the evidence most relevant to the actual question. Do not treat earlier conversation claims as proof of current repository behavior.
2. Follow relevant evidence far enough to understand the behavior. Trace ownership, call sites, configuration, and related tests when they materially affect the answer; do not stop at the first keyword match.
3. Synthesize evidence into an answer. Search matches are leads, not the answer.
4. Include concise references to relevant files, symbols, tests, or artifacts where practical.

Keep investigation focused on the question. Do not reproduce large source sections or return an exhaustive list of search matches.

## Calibrate Claims to Evidence

- Documentation establishes what the project describes or intends; it does not by itself establish implementation.
- An authoritative project contract establishes what is required; it does not by itself establish successful runtime behavior.
- Implementation evidence establishes what the inspected code path does, subject to relevant configuration and execution context.
- A test file can establish that a test exists. Without an observed current result, do not claim a test currently passes.
- Repository-owned or static tests do not establish supported-agent runtime behavior. Identify supported-agent runtime acceptance separately and report it only when observed.
- When relevant sources materially contradict one another, identify the contradiction and explain what each source establishes. Do not silently reconcile the sources.
- Calibrate the conclusion to the available evidence. Say “partially,” “not established,” or that the answer cannot be determined when evidence is incomplete; do not force a definitive yes or no.
- For current-state questions, use current repository evidence. Use version history only when the user asks a historical question and relevant history is available.

## Read-Only Boundary

Return the answer in chat only. Query MUST NOT create or modify any project file or persistent state, including reports, findings, tasks, feature artifacts, temporary files, caches, indexes, or query history.

When an answer reveals a bug, missing test, or inconsistency, report it only as relevant to the question. MUST NOT fix discovered problems. MUST NOT create remediation work. MUST NOT automatically invoke Scope, Analyze, Review, Status, or another workflow.

If relevant project evidence cannot be accessed, state that inspection limitation. Do not treat missing access as proof that the behavior or evidence does not exist.

## Follow-Ups and Clarification

Follow-up questions may use normal conversation context. Inspect current repository evidence again where needed to answer a follow-up about project state.

Inspect the project before asking for clarification. If multiple materially different interpretations remain unresolved, ask only the smallest useful clarification.

Keep the answer proportional to the question. Answer simple factual questions concisely; do not require a large fixed response template or empty sections.
