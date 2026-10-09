# Better Spec Kit

**A technology-agnostic, opinionated extension to GitHub Spec Kit for better design, simpler code, stronger reuse, and more reliable AI-assisted implementation.**

Better Spec Kit does not choose your language, framework, database, architecture, or repository structure. It inspects the project that already exists and works within its established constraints.

## What it changes

Better Spec Kit extends the normal workflow to:

```text
specify → clarify → design → plan → tasks → analyze → implement
```

The main additions are:

- a dedicated `design` stage for meaningful user-facing changes
- explicit discovery of the existing codebase before architecture or implementation decisions
- reuse-before-creation and anti-overengineering guidance
- stronger preservation of requirements and design decisions through planning and implementation
- final implementation validation
- optional use of installed specialist skills such as Ponytail and UI UX Pro Max when available

Optional integrations enhance the workflow but are not required. Project requirements and the project's own constitution remain authoritative.

## Technology neutrality

Better Spec Kit intentionally makes no assumptions about:

- programming language
- frontend or backend framework
- database
- state management
- test framework
- deployment platform
- monorepo or multi-repository structure
- architectural style

The workflow is **discover first, then decide**.

## Installation

Start with a project that already has GitHub Spec Kit initialised. Clone Better Spec Kit, then run the installer against your project.

### PowerShell

```powershell
.\install.ps1 C:\Projects\MyProject
```

### macOS / Linux

```bash
./install.sh /path/to/MyProject
```

By default Better Spec Kit does **not** replace the project's constitution.

For a greenfield project that wants to adopt the neutral Better Spec Kit constitution:

```powershell
.\install.ps1 C:\Projects\MyProject -InstallConstitution
```

Existing managed files are never silently overwritten. Use `-Force` (PowerShell) or `FORCE=1` (shell) when replacement is intentional; existing files are backed up first.

## Constitution

`constitution/constitution.md` is a technology-neutral baseline. It covers discovery, simplicity, reuse, scope, contracts, persistence safety, testing, observability, security, performance, refactoring, documentation, UI/UX, implementation discipline, and completion validation.

Projects are encouraged to keep project-specific architectural and technology decisions in their own constitution. Better Spec Kit should complement those decisions rather than replace them.

## Optional integrations

Better Spec Kit's skills can use specialist capabilities when they are installed in the coding-agent environment:

- **UI UX Pro Max** during the design stage
- **Ponytail** during planning, task generation, implementation, and final simplicity/reuse review

The workflow continues using its built-in guidance when either integration is unavailable.

## Safety when adopting into an existing project

Better Spec Kit intentionally refuses to overwrite existing managed files unless explicitly forced. Review differences before replacing heavily customised Spec Kit skills or a project constitution.

## Status

This is an early public-ready foundation (`v0.1.0`). The next priorities are upstream-aware updating, an idempotent patch/overlay mechanism, automated validation against supported Spec Kit versions, and improved installation ergonomics.

## Licence

MIT.
