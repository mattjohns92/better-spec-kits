# Optional integrations

Better Spec Kit does not redistribute or automatically install third-party tools. They are optional, independently maintained, and may be installed in the agent environment.

## GitHub Spec Kit Bug extension

The official Bug extension is an upstream Spec Kit integration, not a Better Spec Kit implementation. On standard install/update, Better Spec Kit uses `specify extension add bug` without `--force` when the extension is absent and prerequisites permit. Spec Kit validates compatibility and registers its declared Assess, Fix, and Test commands for the active agent integration.

An existing extension is left unchanged: Better Spec Kit does not force-reinstall it, re-enable a disabled copy, or automatically update it. An unverified source, incompatible CLI, unavailable catalog/network, or registration failure is reported as partial success with recovery guidance; Better Spec Kit files remain installed and unrelated workflows remain usable.

Provisioning and command registration verify installation state only. Successful installation is not runtime handoff evidence: a separate fresh Copilot session must demonstrate that a sanitized `B###` record reaches the installed Bug Assess workflow before Bug-ID consumption is claimed. Failure or inability to run that check gates only the Bug receiver path.

When an upstream Bug report has safe, accessible reproduction steps, Better Spec Kit's Auto workflow may capture the pre-fix reproduction and pass the observed result to Bug Assess. The upstream Bug Test command remains responsible for repeating the same reproduction after the fix. Better Spec Kit does not replace Bug Assess/Fix/Test or write their artifacts. If access, authentication, or side-effect safety prevents reproduction, report it as not run or an environment limitation; do not claim a product failure or successful reproduction without observing it.

## GitHub Spec Kit Analyze

`/speckit.analyze` is an upstream GitHub Spec Kit capability. Better Spec Kit distributes an enhanced Analyze skill that preserves upstream consistency checks, challenges material decisions, and writes feature-local `analysis.md` findings. Run it after Tasks and before Implement. If an upstream or customized Analyze skill already occupies the installation path, review the proposed replacement; the installer requires explicit approval and creates a backup before replacing a differing managed file. Analyze itself remains non-mutating except for `analysis.md` and does not automate remediation.

## Analyze remediation

`/speckit.remediate` is a Better Spec Kit skill for coordinating the minimum upstream changes needed for OPEN blocking Analyze findings. It reads `analysis.md`, follows the installed authoritative Clarify, Design, Plan, or Tasks instructions, and leaves finding status for a later Analyze run. The skill does not assume a nested-command dispatcher; when the host cannot load or continue an authoritative stage, it reports the limitation instead of claiming that the stage ran.

## GitHub Spec Kit Converge

`/speckit.converge` is an upstream GitHub Spec Kit capability, not a Better Spec Kit integration. Better Spec Kit does not bundle or replace it. If it is unavailable, follow the [official GitHub Spec Kit installation and update instructions](https://github.com/github/spec-kit). After implementation, repeat `converge → implement → converge` while it reports outstanding tasks, then proceed to Review.

## Ponytail — optional Plan and Tasks challenge

Official project: https://github.com/DietrichGebert/ponytail

```bash
copilot plugin marketplace add DietrichGebert/ponytail
copilot plugin install ponytail@ponytail
```

In Copilot interactive mode, use `/plugin marketplace add ...` and `/plugin install ...` instead. These are the documented Copilot CLI plugin setup commands; Better Spec Kit does not vendor or copy Ponytail and does not automatically install Ponytail.

Plan and Tasks may use Ponytail only when the feature has meaningful proposed complexity and the active host exposes a callable skill that can be safely scoped to that stage. If unavailable, they continue with Better Spec Kit's built-in simplicity and reuse guidance. Do not change a session-wide Ponytail mode merely to run a stage-local challenge, and do not claim an invocation occurred when the capability was not callable.

Ponytail's upstream setup distinguishes Copilot CLI from Copilot Chat in VS Code and other IDEs: the Copilot Chat adapter is rules-only and does not provide the CLI's plugin commands. Copilot CLI availability does not prove Ponytail is installed or callable in the active agent stage.

Review does not invoke Ponytail; it retains its independent built-in implementation-quality checks, including simplicity and reuse.

## UI UX Pro Max

Official project: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

The project's CLI supports GitHub Copilot setup:

```bash
npm install -g uipro-cli
uipro init --ai copilot
```

The CLI setup is project-scoped; a globally installed CLI does not by itself mean the skill is available globally to Copilot. Better Spec Kit uses the skill when the agent can discover it, otherwise follows its built-in design guidance.

The installer never silently runs these commands. Review the upstream instructions and install optional tools separately.

## Graphify — optional repository intelligence

Official project: [Graphify](https://github.com/Graphify-Labs/graphify). The local package is `graphifyy` and the command is `graphify`; local use is free and requires no paid Graphify Cloud plan. Current local setup requires Python 3.10 or later and uv or pipx. Consult Graphify's [installation guide](https://docs.graphify.com/installation) for current requirements and registration steps.

Graphify documents separate local setup for [Copilot CLI and VS Code](https://docs.graphify.com/integrations/copilot), plus a separately configured [local MCP server](https://docs.graphify.com/mcp/overview). These surfaces are not interchangeable: a `graphify` executable on `PATH` does not prove the active assistant can query a graph. Cloud MCP is a separate hosted service; Better Spec Kit does not require a paid plan.

Graphify documents Windows, macOS, and Linux support, but parser and repository coverage varies by language and construct and may require optional extras. Check its current [supported inputs](https://docs.graphify.com/concepts/supported-inputs) rather than assuming complete coverage.

Graphify is optional. Better Spec Kit does not vendor Graphify and does not automatically install, enable, update, or configure it. When its active surface is available and a graph materially helps discovery, use Graphify as a navigation aid and verify consequential conclusions against source. If the tool, graph, or useful evidence is unavailable, fall back to the existing repository investigation. Local code parsing is distinct from optional semantic processing of documents/media; BSK respects Graphify's configured backend and privacy settings and does not initiate unconfigured external processing. Graph artifacts may contain source-derived information and should receive appropriate repository access controls.
