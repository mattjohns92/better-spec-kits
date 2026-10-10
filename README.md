# Better Spec Kit

**Better design. Simpler code. Stronger Spec Kit workflows.**

Better Spec Kit is a technology-agnostic, opinionated extension to GitHub Spec Kit. It adds a dedicated design stage, stronger codebase discovery, reuse-before-creation guidance, implementation discipline, and final validation without prescribing your language, framework, database, architecture, or repository structure.

## Workflow

```text
specify → clarify → design → plan → tasks → analyze → implement
```

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
better-spec-kit status      Show project and integration status
better-spec-kit doctor      Diagnose blocking installation issues
better-spec-kit --version   Show CLI version
```

A project path may be supplied after a command, for example:

```bash
better-spec-kit status ../my-project
```

## Safety

Better Spec Kit is designed to upgrade an existing Spec Kit project in place.

- Standard recognisable Spec Kit `plan`, `tasks`, and `implement` skills are treated as the expected upgrade path.
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
- **Ponytail** during planning, task generation, implementation, and simplicity/reuse review

They are separate projects and are not bundled or silently installed. Better Spec Kit continues with its built-in guidance when they are unavailable.

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

`v0.4.0` introduces the cross-platform Node CLI and replaces PowerShell/Bash scripts as the primary installation experience. The package still needs to be published to npm before `npx better-spec-kit@latest` works publicly.

## Licence

MIT.
