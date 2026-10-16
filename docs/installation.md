Fresh installs and updates distribute the canonical skills to `.github/skills/` through the existing managed-skill process; Remediate is installed at `.github/skills/speckit-remediate/SKILL.md`. Bootstrap PowerShell and shell installers include Remediate as well. `status` distinguishes missing, installed, or differing Analyze and Remediate skills, and `doctor` flags a missing skill or one that needs review.

The managed installer and both standalone installers (`install.ps1` and `install.sh`) distribute the canonical Summary skill and updated Review handoff to `.github/skills/speckit-summary/SKILL.md` and `.github/skills/speckit-review/SKILL.md`. After Review returns a current `PASS`, invoke `/speckit-summary <feature-directory>` manually; automatic skill-to-skill invocation is not guaranteed, and Review must not claim Summary ran unless it actually did. Customized managed files still require approval before replacement and are backed up through each installer's existing safeguards.
The managed installer and both standalone installers (`install.ps1` and `install.sh`) distribute the canonical Summary skill and updated Review handoff to `.github/skills/speckit-summary/SKILL.md` and `.github/skills/speckit-review/SKILL.md`. Summary is available at any workflow stage as a descriptive as-of account. Review `PASS` is required only for final completion or acceptance claims; missing, stale, incomplete, non-PASS, or blocking Review evidence must be reported without blocking descriptive output or implying completion. After Review returns a current `PASS`, invoke `/speckit-summary <feature-directory>` manually for the final-completion handoff; automatic skill-to-skill invocation is not guaranteed, and Review must not claim Summary ran unless it actually did. Customized managed files still require approval before replacement and are backed up through each installer's existing safeguards.

# Installation

Better Spec Kit v0.4+ uses a cross-platform Node.js CLI.

The npm CLI requires Node.js 20 or later. Run installation from an initialized GitHub Spec Kit project for automatic Bug-extension provisioning.

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

## Upstream Bug extension

After Better Spec Kit files install successfully in an initialized project, the installer checks Bug through Spec Kit's native extension manager and runs `specify extension add bug` only when Bug is absent and prerequisites permit. It verifies the public installed manifest and registered commands. It never passes `--force`, re-enables a disabled extension, or automatically updates an existing Bug extension; Spec Kit remains the owner of its files, configuration, and lifecycle.

If `specify`, a compatible CLI, Node/npm manifest-verification support, the catalog/network, or command registration is unavailable, Better Spec Kit remains installed and reports Bug provisioning as partial success with a recovery action. This does not block Scope, Quick, Feature Brief creation, or Initiative workflows. Successful installation is not evidence that a fresh Copilot session can resolve a Scope ID and pass its handoff to the receiving skill; that runtime check is separate.
