# Better Spec Kit

**Better design. Simpler code. Stronger Spec Kit workflows.**

Better Spec Kit extends GitHub Spec Kit with evidence-led workflow guidance for design, implementation, validation, and independent review. It is technology-agnostic: it does not prescribe your language, framework, database, architecture, or repository structure.

## Quick Start

Use Better Spec Kit inside a project that has already been initialized with GitHub Spec Kit. The CLI requires Node.js 20 or later.

When a release is available on npm, start the installer from the project root:

```bash
npx better-spec-kit@latest
```

The interactive wizard detects the project, previews managed-file changes, and asks before applying the selected install or update. To run a specific operation, use:

```text
better-spec-kit install [project-path]
better-spec-kit update [project-path]
better-spec-kit status [project-path]
better-spec-kit doctor [project-path]
better-spec-kit --version
```

Run `better-spec-kit` without an operation to open the wizard. `status` reports installation and integration diagnostics, including Analyze/Remediate/Review skills, Scope/Quick state, upstream Bug provisioning, and runtime capability signals; `doctor` highlights blocking installation issues. Neither command reports Feature lifecycle progress. See [Installation](docs/installation.md) for local development and installer details.

## Choose a Workflow

If the right path is unclear, start with `/speckit.scope <request>`. Scope investigates current project evidence and routes the work as a BUG, QUICK, FEATURE, or INITIATIVE. Scope is optional; when you already know the workflow, enter it directly.

- **QUICK**: Use `/speckit.quick Q###` for an understood outcome whose important boundaries are already clear. Scope creates one durable Brief for each new Q item. UI work requires approval of its current Design; non-visual work skips Feature-only planning. Quick still gets appropriate validation and independent Review, but does not require Feature Converge or Summary.
- **FEATURE**: Use the normal Spec Kit workflow when the outcome or a material boundary needs definition. The recommended lifecycle is:

  `specify → clarify → design → plan → tasks → analyze → implement → converge → review`

  Clarify resolves consequential unanswered decisions; Design applies when the feature needs a visual direction. Tasks creates the implementation ledger. Analyze is the normal final pre-implementation gate.

- **BUG**: Use the official upstream Spec Kit Bug extension for Assess, Fix, and Test. Better Spec Kit may provision that extension during installation when prerequisites allow, but does not replace or own its workflow.
- **INITIATIVE**: Use Scope when evidence supports multiple independently specifiable outcomes with meaningful boundaries. An Initiative is a map, not an instruction to start every child at once.

The examples use the workflow names documented by Better Spec Kit. The exact slash-command spelling and availability depend on the active agent integration; use the installed skill or command form exposed by that integration.

## Feature Workflow

Run the applicable Feature stages against one exact selected Feature. After Tasks, run Analyze before implementation. Analyze checks artifact consistency and challenges whether material decisions are justified and proportionate; its findings go in the Feature's `analysis.md`, and it does not edit upstream artifacts.

After Analyze returns PASS, follow its recommendation. Analyze may recommend `/speckit.preview` when a human-readable overview would materially improve understanding; for straightforward proposals it may recommend `/speckit-implement` directly. Preview remains optional. If OPEN blocking findings remain, run `/speckit.remediate`, address the routed upstream work, and run Analyze again before implementing. If analysis is incomplete, obtain the missing evidence or prerequisite first.

Immediately before source-changing work, Implement performs a fresh Preflight and atomically claims its complete shared-source surface. The standalone command is also available for inspection:

```text
/speckit-preflight F###
/speckit-preflight Q###
/speckit-preflight .specify/bugs/<slug>
```

Preflight checks readiness, current-source assumptions, and surface compatibility. `CLEAR AT INSPECTION` is only an advisory snapshot; it means `ADMISSION: NOT CLAIMED`. Implementation repeats Preflight for its current attempt, and only its successful atomic claim admits the work. You do not need to run standalone Preflight first.

After implementation, GitHub Spec Kit owns `/speckit.converge`. If it appends tasks, repeat `converge → implement → converge` until no work remains, then run Review. Review independently records the outcome and findings in `review.md`; only a later Review reassessment can resolve a finding. After remediation, the expected sequence is `implement -> converge -> review`.

After a current Review PASS, run `/speckit-summary <feature-directory>` for a concise, evidence-based completion handoff. Summary is also available earlier as a descriptive as-of report, but it does not replace Review or prove completion. Automatic skill-to-skill invocation is not guaranteed; do not claim a stage ran unless it actually did.

## Project Utilities

- **Project Status** (`/speckit.status`) gives a read-only lifecycle overview from current Feature, Quick, and Initiative artifacts. It reports blockers, evidence gaps, and supported next actions without changing project state. This is separate from the CLI `better-spec-kit status` installation diagnostics.
- **Project Query** (`/speckit.query <question>`) answers a focused question from current repository evidence. It responds in chat and does not change files or lifecycle state.
- **Auto Mode** (`/speckit-auto`) can advance one selected work item when the next stage is deterministic. Its supported arguments include `pre-implement`, `status`, and `stop`. `pre-implement` stops at evidence-derived readiness and does not claim implementation admission. Auto does not replace workflow stages or infer approvals.

Auto targets VS Code Copilot Chat. Installed hooks can request another agent turn but do not invoke workflow stages. Cross-turn dispatch or answer resumption must not be assumed; when the active host cannot continue safely, Auto reports the manual next action. Installation alone is not runtime evidence.

## Safe Upgrades and Integrations

Better Spec Kit upgrades an existing Spec Kit project in place. Existing constitutions are preserved by default; the neutral Better Spec Kit constitution is opt-in. Differing or customized managed files are shown for review, require explicit approval before replacement, and are backed up outside the target repository. The installed version is recorded in `.specify/better-spec-kit.json`.

Ponytail and UI UX Pro Max are separate projects and remain optional. Better Spec Kit does not vendor or copy Ponytail and does not automatically install Ponytail. Plan and Tasks may use Ponytail when meaningful complexity exists and the active host exposes a safely stage-scoped capability; otherwise Better Spec Kit's built-in simplicity and reuse guidance applies. Copilot CLI and Copilot Chat integrations differ, and CLI availability does not prove Ponytail is installed or callable. See [Optional integrations](docs/integrations.md) for setup and limitations.

The official Spec Kit Bug extension is also upstream-owned. Standard install/update attempts native provisioning only when the project and prerequisites permit; an existing Bug extension is never force-reinstalled, re-enabled, or automatically updated. Provisioning failure is reported as partial success and does not block unrelated workflows. Successful installation does not prove that a fresh Copilot session can consume a Bug handoff.

## Development and Further Reading

The distributable skill sources live in `skills/`; `.github/skills/` contains the copies used while Better Spec Kit dogfoods its own workflow.

```bash
npm test
npm link
```

From a disposable, initialized Spec Kit project, run `better-spec-kit` to test the local CLI. For the full workflow guide, see [docs/workflow.md](docs/workflow.md). For setup and release details, see [docs/installation.md](docs/installation.md) and [docs/releasing.md](docs/releasing.md).

Better Spec Kit is MIT licensed. Its rule is simple: **discover first, then decide**.
