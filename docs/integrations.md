# Optional integrations

Better Spec Kit does not redistribute or automatically install third-party tools. They are optional, independently maintained, and may be installed in the agent environment.

## Ponytail — GitHub Copilot CLI

Official project: https://github.com/DietrichGebert/ponytail

```bash
copilot plugin marketplace add DietrichGebert/ponytail
copilot plugin install ponytail@ponytail
```

In Copilot interactive mode, use `/plugin marketplace add ...` and `/plugin install ...` instead. `/speckit-review` invokes Ponytail's installed review capability as additional simplicity/reuse evidence when available. Without it, Better Spec Kit still performs all five built-in review passes.

## UI UX Pro Max

Official project: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

The project's CLI supports GitHub Copilot setup:

```bash
npm install -g uipro-cli
uipro init --ai copilot
```

The CLI setup is project-scoped; a globally installed CLI does not by itself mean the skill is available globally to Copilot. Better Spec Kit uses the skill when the agent can discover it, otherwise follows its built-in design guidance.

The installer never silently runs these commands. Review the upstream instructions and install optional tools separately.
