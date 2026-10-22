# Better Spec Kit

**Better design. Simpler code. Stronger Spec Kit workflows.**

Better Spec Kit is a technology-agnostic, opinionated extension to GitHub Spec Kit. It adds a dedicated design stage, stronger codebase discovery, reuse-before-creation guidance, implementation discipline, and an independent post-implementation review without prescribing your language, framework, database, architecture, or repository structure.

When you are unsure which workflow fits a request, start with the optional `/speckit.scope` entry. It routes bugs, contained changes, features, and initiatives; users who already know their workflow can continue to enter it directly.

## Workflow

```text
specify → clarify → design → plan → tasks → analyze → implement → converge → review
```

Analyze is the normal final pre-implementation check after Tasks. It checks artifact consistency and challenges material decisions, then records its outcome and any findings in the feature's `analysis.md`. Analyze does not modify upstream artifacts. Address blocking findings through their routed upstream stage and rerun Analyze before implementation normally proceeds.

After Analyze returns PASS, follow its next-step recommendation. Analyze may recommend `/speckit.preview` when a human-readable overview would materially improve understanding; for straightforward proposals, it may recommend `/speckit-implement` directly. Preview remains optional. If OPEN blocking findings remain, run `/speckit.remediate` and then run Analyze again; do not implement while blocking findings remain. If analysis is incomplete, obtain the missing evidence or prerequisite before proceeding.

GitHub Spec Kit provides `/speckit.converge` to check for work still missing after implementation. If it appends tasks, repeat `converge → implement → converge` until no work remains, then run Review. Better Spec Kit does not bundle or replace Converge. If the command is unavailable, follow the [official GitHub Spec Kit installation and update instructions](https://github.com/github/spec-kit) and verify the command is available before continuing.

Review writes a durable `review.md` artifact in the active feature directory. That artifact is the authoritative record for review outcome, blocking findings, validation evidence, and the concise resolved-history that survives the implementation handoff.

The feature's `tasks.md` remains the single implementation work ledger: Tasks creates the original planned work, upstream Converge may append completeness work, Implement may append Review-remediation tasks, and Review reads the ledger without modifying it. After remediation, the expected sequence remains `implement -> converge -> review`; only a subsequent Review reassessment can resolve a finding.

## Install

Start in a project where GitHub Spec Kit is already initialised:

```bash
npx better-spec-kit@latest
```

The CLI detects the current project and launches an interactive installation or update wizard.

You can also install the CLI globally:

```bash
npm install -g better-spec-kit
better-spec-kit
```

> Until the npm package is published, test locally with `npm link` from this repository, then run `better-spec-kit` from a disposable Spec Kit project.

## CLI

```text
better-spec-kit             Interactive wizard
better-spec-kit install     Install into the current project
better-spec-kit update      Update an existing installation
better-spec-kit status      Show project, Analyze/Remediate/Review skills, Scope/Quick state, Bug provisioning, and integration status
better-spec-kit doctor      Diagnose blocking installation issues
better-spec-kit --version   Show CLI version
```

A project path may be supplied after a command, for example:

```bash
better-spec-kit status ../my-project
```

The independent Project Status skill provides a read-only, project-level view of feature and Initiative work from existing artifacts, including evidence gaps, blockers, and recommended next actions. It does not execute workflows or change lifecycle state. It is separate from the `better-spec-kit status` CLI command, which reports installation, integration, and provisioning state.

Project Query (`/speckit.query <question>`) is a separate read-only project utility for answering specific natural-language questions from current repository evidence. It responds in chat and does not change project files or lifecycle state.

## Safety

Better Spec Kit is designed to upgrade an existing Spec Kit project in place.

- Existing Spec Kit skills are detected and shown for review. Until upstream release checksums are bundled, differing files require explicit approval before replacement.
- Original files are backed up outside the target repository before replacement.
- Unknown or customised managed files are flagged for explicit approval.
- Existing constitutions are preserved by default.
- The neutral Better Spec Kit constitution is opt-in.
- Better Spec Kit records its installed version in `.specify/better-spec-kit.json`.

## Technology neutrality

Better Spec Kit makes no assumptions about programming language, frontend/backend framework, database, test framework, deployment platform, repository topology, state management, or architectural style.

Its rule is simple: **discover first, then decide**.

## Optional integrations

Better Spec Kit can take advantage of specialist tools such as:

- **UI UX Pro Max** during design
- **Ponytail** as an optional, evidence-adaptive challenge during Plan and Tasks, with a lightweight reuse guard during implementation

Ponytail and UI UX Pro Max are separate projects and remain optional. Better Spec Kit does not vendor or copy Ponytail and does not automatically install Ponytail. Ponytail challenges are used only when meaningful implementation complexity exists and the active host exposes a safely stage-scoped capability; otherwise Better Spec Kit's built-in simplicity and reuse guidance applies. The official Spec Kit Bug extension is different: standard install/update attempts native upstream provisioning when the project and prerequisites permit. Existing Bug installations are never force-reinstalled, re-enabled, or automatically updated. Provisioning failure is reported as partial success and does not roll back Better Spec Kit files or block other workflows. Successful installation is not evidence that a fresh Copilot session can consume a Bug handoff; that runtime check is separate.

## Development

Requires Node.js 20 or later.

```bash
npm test
npm link
```

Then open a disposable project with GitHub Spec Kit initialised and run:

```bash
better-spec-kit
```

## Status

`v0.5.0` adds an independent post-implementation Review stage and installs it for new and existing Better Spec Kit projects. The package must be published to npm before `npx better-spec-kit@latest` provides this release.

## Repository structure

Better Spec Kit dogfoods its own workflow.

The canonical distributable skills live in:

skills/

These are the source files packaged and installed by Better Spec Kit.

The repository also contains:

.github/skills/

These are the installed project copies used by GitHub Copilot while
developing Better Spec Kit itself. They are not the canonical source.

Changes to Better Spec Kit skills should be made in `skills/` and then
installed into the repository using the local CLI.

## Licence

MIT.

## Releases

See [docs/releasing.md](docs/releasing.md) for npm first-publish and GitHub Actions trusted publishing setup.
