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

## Installation directly from GitHub

Start with a project where GitHub Spec Kit is already initialised. Install from the public repository without cloning it permanently.

### Windows / PowerShell (recommended: download, inspect, run)

```powershell
$bootstrap = Join-Path $env:TEMP 'better-spec-kit-bootstrap.ps1'
Invoke-WebRequest 'https://raw.githubusercontent.com/mattjohns92/better-spec-kits/main/bootstrap.ps1' -OutFile $bootstrap
& $bootstrap -TargetPath 'C:\Projects\MyProject'
```

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/mattjohns92/better-spec-kits/main/bootstrap.sh -o /tmp/better-spec-kit-bootstrap.sh
bash /tmp/better-spec-kit-bootstrap.sh /path/to/MyProject
```

The bootstrap downloads the current GitHub source archive into a temporary directory, invokes the local installer, and cleans up. **Review the downloaded bootstrap script before running it**; for reproducible installs, specify a release tag using `-Ref v0.2.0` (PowerShell) or `BETTER_SPEC_KIT_REF=v0.2.0` (shell) once that release exists.

### Local installation

```powershell
.\install.ps1 C:\Projects\MyProject
```

```bash
./install.sh /path/to/MyProject
```

By default the existing project constitution is preserved. To adopt the neutral constitution explicitly, pass `-InstallConstitution` (PowerShell) or set `INSTALL_CONSTITUTION=1` (shell). Existing skills are never silently overwritten; use `-Force` or `FORCE=1` to replace them with backups.

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

This is an early public-ready foundation (`v0.2.0`). The next priorities are upstream-aware updating, an idempotent patch/overlay mechanism, automated validation against supported Spec Kit versions, and improved installation ergonomics.

## Licence

MIT.

## Interactive setup (v0.3)

On Windows, run `install.ps1` (or `bootstrap.ps1` for GitHub download). The installer
shows the target project, detects whether Spec Kit is present, previews changed
files, asks before replacing any existing customisations, and offers optional
Ponytail / UI UX Pro Max setup. Existing files are backed up by default.

For unattended use, pass `-NonInteractive` and, only when intended, `-Force`.
Optional third-party integrations are **not** installed in unattended mode.
The interactive setup currently targets PowerShell; the POSIX shell installer
remains non-interactive.

The optional integrations execute third-party installation commands only after
an explicit confirmation. See `docs/integrations.md` for upstream references.


## Clean target repositories

The GitHub bootstrap downloads and extracts Better Spec Kit only in the operating system temporary directory and removes those working files after installation. Backups of replaced files are stored outside the target repository (under the user local application-data directory on Windows, or the operating-system temporary directory when no local application-data directory is available). Better Spec Kit does not create a package or backup folder in the target repository.
