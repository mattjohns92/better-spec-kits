# Installation

Better Spec Kit v0.4+ uses a cross-platform Node.js CLI.

## Public installation

Once published to npm:

```bash
npx better-spec-kit@latest
```

Run it from the root of a project where GitHub Spec Kit is already initialised.

GitHub Spec Kit supplies `/speckit.converge`; Better Spec Kit does not package or automatically install it. If it is unavailable, follow the [official GitHub Spec Kit installation and update instructions](https://github.com/github/spec-kit), then verify the command is available. If it appends tasks, repeat `converge → implement → converge` until no work remains, then proceed to Review.

## Local development

From the Better Spec Kit repository:

```bash
npm link
```

Then, from a disposable Spec Kit project:

```bash
better-spec-kit
```

The CLI previews managed-file changes, including the Analyze and Remediate skills as `ADD` for projects that do not have them. Fresh installs and updates distribute the canonical skills to `.github/skills/` through the existing managed-skill process; Remediate is installed at `.github/skills/speckit-remediate/SKILL.md`. Bootstrap PowerShell and shell installers include Remediate as well. `status` distinguishes missing, installed, or differing Analyze and Remediate skills, and `doctor` flags a missing skill or one that needs review.

The installer preserves the existing constitution by default, backs up replaced files outside the target repository, and requires explicit approval for customized or unknown managed files. An existing upstream Analyze skill at the shared path is treated as a conflict; review the preview and approve replacement explicitly to retain its backup.
