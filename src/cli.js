import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { detectProject, buildPlan } from "./detect.js";
import { install } from "./installer.js";
import { choose, yesNo } from "./prompt.js";
import { integrationStatus } from "./integrations.js";
import { read } from "./io.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, "..");
const version = read(path.join(packageRoot, "VERSION")).trim();

function banner() {
  console.log(`
╭──────────────────────────────────────────────╮
│              BETTER SPEC KIT                 │
│        Better design. Simpler code.          │
╰──────────────────────────────────────────────╯`);
}

function actionName(c) {
  return ({new:"+ ADD", "spec-kit":"~ UPGRADE", "better-spec-kit":"~ UPDATE", custom:"! REVIEW", current:"✓ KEEP"})[c] ?? c;
}

function showPlan(plan) {
  console.log("\nInstallation preview\n");
  for (const item of plan) console.log(`  ${actionName(item.classification).padEnd(11)} ${item.destinationRel}`);
}

export async function run(args) {
  const command = args[0]?.startsWith("-") ? null : args[0];
  const projectArg = command ? args[1] : args[0];
  const project = path.resolve(projectArg && !projectArg.startsWith("-") ? projectArg : process.cwd());

  if (args.includes("--version") || command === "version") {
    console.log(version); return;
  }

  banner();
  const detected = detectProject(project);
  console.log(`\n  Project: ${project}`);
  console.log(`  ${detected.specKit ? "✔" : "✖"} GitHub Spec Kit ${detected.specKit ? "detected" : "not detected"}`);
  console.log(`  ${detected.betterSpecKit ? "✔" : "○"} Better Spec Kit ${detected.betterSpecKit ? "detected" : "not installed"}`);
  console.log(`  ${detected.constitution ? "✔" : "○"} Constitution ${detected.constitution ? "found" : "not found"}`);

  if (command === "status") {
    const integrations = integrationStatus();
    console.log(`\n  Copilot CLI: ${integrations.copilotCli ? "available" : "not detected"}`);
    console.log(`  npx: ${integrations.npx ? "available" : "not detected"}`);
    return;
  }

  if (command === "doctor") {
    let problems = 0;
    if (!detected.specKit) { console.log("\n  ✖ Initialise GitHub Spec Kit first."); problems++; }
    const plan = buildPlan(project, packageRoot);
    const custom = plan.filter(x => x.classification === "custom");
    if (custom.length) { console.log(`  ! ${custom.length} managed file(s) need manual review.`); problems++; }
    if (!problems) console.log("\n  ✔ No blocking Better Spec Kit issues detected.");
    return;
  }

  if (!detected.specKit) throw new Error("GitHub Spec Kit is not initialised in this project.");

  let selected = command;
  if (!["install","update"].includes(selected)) {
    const idx = await choose("What would you like to do?", [
      detected.betterSpecKit ? "Update Better Spec Kit" : "Install Better Spec Kit",
      "Check installation",
      "Exit",
    ]);
    if (idx === 1) return run(["status", project]);
    if (idx === 2) return;
    selected = detected.betterSpecKit ? "update" : "install";
  }

  const plan = buildPlan(project, packageRoot);
  showPlan(plan);

  const custom = plan.filter(x => x.classification === "custom");
  let allowCustom = false;
  if (custom.length) {
    console.log("\n  Customised/unknown files require explicit approval:");
    custom.forEach(x => console.log(`  ! ${x.destinationRel}`));
    allowCustom = await yesNo("Back up and replace these files?", false);
    if (!allowCustom) { console.log("\nInstallation cancelled."); return; }
  }

  let installConstitution = false;
  if (detected.constitution) {
    console.log("\n  Constitution: existing constitution will be preserved.");
  } else {
    installConstitution = await yesNo("Install the technology-neutral Better Spec Kit constitution?", false);
  }

  const integrations = integrationStatus();
  console.log("\n  Optional integrations");
  console.log(`  ${integrations.copilotCli ? "✔" : "○"} Ponytail: ${integrations.copilotCli ? "Copilot CLI available (plugin status checked by Copilot)" : "Copilot CLI not detected"}`);
  console.log(`  ${integrations.npx ? "✔" : "○"} UI UX Pro Max setup capability: ${integrations.npx ? "available through npx" : "npx not detected"}`);
  console.log("  Third-party integrations are not silently installed by Better Spec Kit.");

  if (!(await yesNo(`Proceed with ${selected}?`, true))) { console.log("\nCancelled."); return; }

  const result = install({ project, packageRoot, plan, version, installConstitution, allowCustom });
  console.log(`\n✔ Better Spec Kit v${version} ${selected === "update" ? "updated" : "installed"}!`);
  console.log(`  ${result.changed} workflow skill(s) changed`);
  console.log(`  Constitution: ${installConstitution ? "neutral baseline installed" : "preserved"}`);
  if (result.backupRoot) console.log(`  Backups: ${result.backupRoot}`);
  console.log("\n  Ready: specify → clarify → design → plan → tasks → analyze → implement\n");
}
