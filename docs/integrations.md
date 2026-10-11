# Optional integrations

Better Spec Kit does not redistribute or automatically install third-party tools. They are optional, independently maintained, and may be installed in the agent environment.

## GitHub Spec Kit Analyze

`/speckit.analyze` is an upstream GitHub Spec Kit capability. Better Spec Kit distributes an enhanced Analyze skill that preserves upstream consistency checks, challenges material decisions, and writes feature-local `analysis.md` findings. Run it after Tasks and before Implement. If an upstream or customized Analyze skill already occupies the installation path, review the proposed replacement; the installer requires explicit approval and creates a backup before replacing a differing managed file. Analyze itself remains non-mutating except for `analysis.md` and does not automate remediation.

## Analyze remediation

`/speckit.remediate` is a Better Spec Kit skill for coordinating the minimum upstream changes needed for OPEN blocking Analyze findings. It reads `analysis.md`, follows the installed authoritative Clarify, Design, Plan, or Tasks instructions, and leaves finding status for a later Analyze run. The skill does not assume a nested-command dispatcher; when the host cannot load or continue an authoritative stage, it reports the limitation instead of claiming that the stage ran.

## GitHub Spec Kit Converge

`/speckit.converge` is an upstream GitHub Spec Kit capability, not a Better Spec Kit integration. Better Spec Kit does not bundle or replace it. If it is unavailable, follow the [official GitHub Spec Kit installation and update instructions](https://github.com/github/spec-kit). After implementation, repeat `converge → implement → converge` while it reports outstanding tasks, then proceed to Review.

## Ponytail — GitHub Copilot CLI

Official project: https://github.com/DietrichGebert/ponytail

```bash
copilot plugin marketplace add DietrichGebert/ponytail
copilot plugin install ponytail@ponytail
```

In Copilot interactive mode, use `/plugin marketplace add ...` and `/plugin install ...` instead. `/speckit-review` invokes Ponytail's installed review capability as additional simplicity/reuse evidence when available. Without it, Better Spec Kit still performs all four built-in implementation-quality checks.

## UI UX Pro Max

Official project: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

The project's CLI supports GitHub Copilot setup:

```bash
npm install -g uipro-cli
uipro init --ai copilot
```

The CLI setup is project-scoped; a globally installed CLI does not by itself mean the skill is available globally to Copilot. Better Spec Kit uses the skill when the agent can discover it, otherwise follows its built-in design guidance.

The installer never silently runs these commands. Review the upstream instructions and install optional tools separately.
