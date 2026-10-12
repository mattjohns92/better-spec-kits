import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectProject, buildPlan } from "./detect.js";
import { install } from "./installer.js";
import { choose, yesNo } from "./prompt.js";
import { integrationStatus } from "./integrations.js";
import { read } from "./io.js";
import { inspectBug, provisionBug } from "./bug-extension.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, "..");
const packageJson = JSON.parse(read(path.join(packageRoot, "package.json")));

const version = packageJson.version;

function banner() {
  console.log(`
╭──────────────────────────────────────────────╮
│              BETTER SPEC KIT                 │
│        Better design. Simpler code.          │
╰──────────────────────────────────────────────╯`);
}

function actionName(c) {
  return { new: "+ ADD", "spec-kit": "~ UPGRADE", "better-spec-kit": "~ UPDATE", custom: "! REVIEW", current: "✓ KEEP" }[c] ?? c;
}

function showPlan(plan) {
  console.log("\nInstallation preview\n");
  for (const item of plan) console.log(`  ${actionName(item.classification).padEnd(11)} ${item.destinationRel}`);
}

function managedState(plan, destinationRel) {
  const classification = plan.find((item) => item.destinationRel === destinationRel)?.classification;
  return classification === "new" ? "missing" : classification === "custom" ? "needs review" : "installed";
}

export async function run(args) {
  const command = args[0]?.startsWith("-") ? null : args[0];
  if (command && !["install", "update", "status", "doctor", "version"].includes(command)) {
    throw new Error(`Unknown command: ${command}`);
  }
  const projectArg = command ? args[1] : args[0];
  const project = path.resolve(projectArg && !projectArg.startsWith("-") ? projectArg : process.cwd());

  if (args.includes("--version") || command === "version") {
    console.log(version);
    return;
  }

  banner();
  const detected = detectProject(project);
  console.log(`\n  Project: ${project}`);
  console.log(`  ${detected.specKit ? "✔" : "✖"} GitHub Spec Kit ${detected.specKit ? "detected" : "not detected"}`);
  console.log(`  ${detected.betterSpecKit ? "✔" : "○"} Better Spec Kit ${detected.betterSpecKit ? "detected" : "not installed"}`);
  console.log(`  ${detected.constitution ? "✔" : "○"} Constitution ${detected.constitution ? "found" : "not found"}`);

  if (command === "status") {
    const plan = buildPlan(project, packageRoot);
    const review = plan.find((item) => item.destinationRel === ".github/skills/speckit-review/SKILL.md");
    const analyze = plan.find((item) => item.destinationRel === ".github/skills/speckit-analyze/SKILL.md");
    const remediate = plan.find((item) => item.destinationRel === ".github/skills/speckit-remediate/SKILL.md");
    const integrations = integrationStatus();
    const bug = inspectBug({ project });
    console.log(`  Review skill: ${review?.classification === "new" ? "missing" : "installed"}`);
    console.log(`  Analyze skill: ${analyze?.classification === "new" ? "missing" : analyze?.classification === "custom" ? "needs review" : "installed"}`);
    console.log(`  Remediate skill: ${remediate?.classification === "new" ? "missing" : remediate?.classification === "custom" ? "needs review" : "installed"}`);
    console.log(`  Scope skill: ${managedState(plan, ".github/skills/speckit-scope/SKILL.md")}`);
    console.log(`  Quick skill: ${managedState(plan, ".github/skills/speckit-quick/SKILL.md")}`);
    console.log(`  Scope handoff instruction: ${managedState(plan, ".github/instructions/scope-handoffs.instructions.md")}`);
    console.log(`  Bug provisioning: ${bug.state} - ${bug.message}`);
    console.log(`\n  Copilot CLI: ${integrations.copilotCli ? "available" : "not detected"}`);
    console.log(`  npx: ${integrations.npx ? "available" : "not detected"}`);
    return;
  }

  if (command === "doctor") {
    let problems = 0;
    if (!detected.specKit) {
      console.log("\n  ✖ Initialise GitHub Spec Kit first.");
      problems++;
    }
    const plan = buildPlan(project, packageRoot);
    const review = plan.find((item) => item.destinationRel === ".github/skills/speckit-review/SKILL.md");
    const analyze = plan.find((item) => item.destinationRel === ".github/skills/speckit-analyze/SKILL.md");
    const remediate = plan.find((item) => item.destinationRel === ".github/skills/speckit-remediate/SKILL.md");
    const scope = plan.find((item) => item.destinationRel === ".github/skills/speckit-scope/SKILL.md");
    const quick = plan.find((item) => item.destinationRel === ".github/skills/speckit-quick/SKILL.md");
    const handoff = plan.find((item) => item.destinationRel === ".github/instructions/scope-handoffs.instructions.md");
    const bug = inspectBug({ project });
    if (detected.betterSpecKit && review?.classification === "new") {
      console.log("  ! Review skill is missing; run 'better-spec-kit update'.");
      problems++;
    }
    if (detected.betterSpecKit && analyze?.classification === "new") {
      console.log("  ! Analyze skill is missing; run 'better-spec-kit update'.");
      problems++;
    }
    if (detected.betterSpecKit && analyze?.classification === "custom") {
      console.log("  ! Analyze skill needs manual review before replacement.");
      problems++;
    }
    if (detected.betterSpecKit && remediate?.classification === "new") {
      console.log("  ! Remediate skill is missing; run 'better-spec-kit update'.");
      problems++;
    }
    if (detected.betterSpecKit && remediate?.classification === "custom") {
      console.log("  ! Remediate skill needs manual review before replacement.");
      problems++;
    }
    if (detected.betterSpecKit && scope?.classification === "new") {
      console.log("  ! Scope skill is missing; run 'better-spec-kit update'.");
      problems++;
    }
    if (detected.betterSpecKit && quick?.classification === "new") {
      console.log("  ! Quick skill is missing; run 'better-spec-kit update'.");
      problems++;
    }
    if (detected.betterSpecKit && handoff?.classification === "new") {
      console.log("  ! Scope handoff instruction is missing; run 'better-spec-kit update'.");
      problems++;
    }
    const custom = plan.filter((x) => x.classification === "custom");
    if (custom.length) {
      console.log(`  ! ${custom.length} managed file(s) need manual review.`);
      problems++;
    }
    if (!bug.available) console.log(`  ! Bug provisioning ${bug.state}: ${bug.message}`);
    if (!problems) console.log("\n  ✔ No blocking Better Spec Kit issues detected.");
    return;
  }

  if (!detected.specKit) throw new Error("GitHub Spec Kit is not initialised in this project.");

  let selected = command;
  if (!["install", "update"].includes(selected)) {
    const idx = await choose("What would you like to do?", [detected.betterSpecKit ? "Update Better Spec Kit" : "Install Better Spec Kit", "Check installation", "Exit"]);
    if (idx === 1) return run(["status", project]);
    if (idx === 2) return;
    selected = detected.betterSpecKit ? "update" : "install";
  }

  const plan = buildPlan(project, packageRoot);
  showPlan(plan);

  const custom = plan.filter((x) => x.classification === "custom");
  const unattended = args.includes("--yes");
  let allowCustom = args.includes("--allow-overwrite");
  if (custom.length) {
    console.log("\n  Customised/unknown files require explicit approval:");
    custom.forEach((x) => console.log(`  ! ${x.destinationRel}`));
    if (!allowCustom && unattended) throw new Error("Custom files detected. Review changes, then use --allow-overwrite explicitly.");
    if (!allowCustom) allowCustom = await yesNo("Back up and replace these files?", false);
    if (!allowCustom) {
      console.log("\nInstallation cancelled.");
      return;
    }
  }

  let installConstitution = false;
  if (detected.constitution) {
    console.log("\n  Constitution: existing constitution will be preserved.");
  } else {
    installConstitution = args.includes("--install-constitution") || (!unattended && (await yesNo("Install the technology-neutral Better Spec Kit constitution?", false)));
  }

  const integrations = integrationStatus();
  console.log("\n  Optional integrations");
  console.log(`  ${integrations.copilotCli ? "✔" : "○"} Ponytail: ${integrations.copilotCli ? "Copilot CLI available (plugin status checked by Copilot)" : "Copilot CLI not detected"}`);
  console.log(`  ${integrations.npx ? "✔" : "○"} UI UX Pro Max setup capability: ${integrations.npx ? "available through npx" : "npx not detected"}`);
  console.log("  Ponytail and UI UX Pro Max remain optional and are not installed automatically.");

  if (!unattended && !(await yesNo(`Proceed with ${selected}?`, true))) {
    console.log("\nCancelled.");
    return;
  }

  const result = install({ project, packageRoot, plan, version, installConstitution, allowCustom });
  const bug = provisionBug({ project });
  console.log(`\n✔ Better Spec Kit v${version} ${selected === "update" ? "updated" : "installed"}!`);
  console.log(`  ${result.changed} workflow skill(s) changed`);
  console.log(`  Constitution: ${installConstitution ? "neutral baseline installed" : "preserved"}`);
  console.log(`  Bug provisioning: ${bug.available ? bug.state : `partial success (${bug.state})`} - ${bug.message}`);
  if (result.backupRoot) console.log(`  Backups: ${result.backupRoot}`);
  console.log("\n  Ready: specify → clarify → design → plan → tasks → analyze → implement → converge → review");
  console.log("  Analyze is the normal final pre-implementation check.\n");
}
