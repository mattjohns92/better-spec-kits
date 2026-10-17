import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPlan } from "../src/detect.js";
import { install } from "../src/installer.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function project() {
  const p = fs.mkdtempSync(path.join(os.tmpdir(), "bsk-install-"));
  fs.mkdirSync(path.join(p, ".specify", "memory"), { recursive: true });
  fs.writeFileSync(path.join(p, ".specify", "memory", "constitution.md"), "custom constitution");
  return p;
}
test("fresh install preserves constitution and writes metadata", () => {
  const p = project();
  const result = install({ project: p, packageRoot, plan: buildPlan(p, packageRoot), version: "0.4.0" });
  assert.equal(result.changed, 12);
  assert.equal(fs.readFileSync(path.join(p, ".github/skills/speckit-review/SKILL.md"), "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-review/SKILL.md"), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, ".github/skills/speckit-summary/SKILL.md"), "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-summary/SKILL.md"), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, ".github/skills/speckit-preview/SKILL.md"), "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-preview/SKILL.md"), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, ".github/skills/speckit-analyze/SKILL.md"), "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-analyze/SKILL.md"), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, ".github/skills/speckit-remediate/SKILL.md"), "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-remediate/SKILL.md"), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, ".github/skills/speckit-scope/SKILL.md"), "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-scope/SKILL.md"), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, ".github/skills/speckit-quick/SKILL.md"), "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-quick/SKILL.md"), "utf8"));
  assert.equal(
    fs.readFileSync(path.join(p, ".github/instructions/scope-handoffs.instructions.md"), "utf8"),
    fs.readFileSync(path.join(packageRoot, "instructions/scope-handoffs.instructions.md"), "utf8"),
  );
  assert.equal(fs.readFileSync(path.join(p, ".specify/memory/constitution.md"), "utf8"), "custom constitution");
  assert.equal(JSON.parse(fs.readFileSync(path.join(p, ".specify/better-spec-kit.json"), "utf8")).version, "0.4.0");
});

test("install leaves the upstream Converge skill unmanaged and unchanged", () => {
  const p = project();
  const convergePath = path.join(p, ".github/skills/speckit-converge/SKILL.md");
  const convergeContent = "upstream-owned Converge skill\n";
  fs.mkdirSync(path.dirname(convergePath), { recursive: true });
  fs.writeFileSync(convergePath, convergeContent);

  const plan = buildPlan(p, packageRoot);
  assert.ok(!plan.some((item) => item.destinationRel === ".github/skills/speckit-converge/SKILL.md"));
  install({ project: p, packageRoot, plan, version: "0.5.1" });

  assert.equal(fs.readFileSync(convergePath, "utf8"), convergeContent);
});

test("upgrading a pre-Review installation adds the Review skill", () => {
  const p = project();
  for (const name of ["speckit-design", "speckit-plan", "speckit-tasks", "speckit-implement"]) {
    const source = path.join(packageRoot, "skills", name, "SKILL.md");
    const destination = path.join(p, ".github/skills", name, "SKILL.md");
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
  fs.writeFileSync(path.join(p, ".specify/better-spec-kit.json"), JSON.stringify({ name: "better-spec-kit", version: "0.4.7" }));

  const plan = buildPlan(p, packageRoot);
  const review = plan.find((item) => item.destinationRel === ".github/skills/speckit-review/SKILL.md");
  const summary = plan.find((item) => item.destinationRel === ".github/skills/speckit-summary/SKILL.md");
  const analyze = plan.find((item) => item.destinationRel === ".github/skills/speckit-analyze/SKILL.md");
  const remediate = plan.find((item) => item.destinationRel === ".github/skills/speckit-remediate/SKILL.md");
  const preview = plan.find((item) => item.destinationRel === ".github/skills/speckit-preview/SKILL.md");
  assert.equal(review.classification, "new");
  assert.equal(summary.classification, "new");
  assert.equal(analyze.classification, "new");
  assert.equal(remediate.classification, "new");
  assert.equal(preview.classification, "new");
  const result = install({ project: p, packageRoot, plan, version: "0.5.0" });

  assert.equal(result.changed, 8);
  assert.equal(fs.readFileSync(path.join(p, review.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, review.sourceRel), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, summary.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, summary.sourceRel), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, analyze.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, analyze.sourceRel), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, remediate.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, remediate.sourceRel), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, preview.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, preview.sourceRel), "utf8"));
  for (const [source, destination] of [
    ["skills/speckit-scope/SKILL.md", ".github/skills/speckit-scope/SKILL.md"],
    ["skills/speckit-quick/SKILL.md", ".github/skills/speckit-quick/SKILL.md"],
    ["instructions/scope-handoffs.instructions.md", ".github/instructions/scope-handoffs.instructions.md"],
  ]) {
    assert.equal(fs.readFileSync(path.join(p, destination), "utf8"), fs.readFileSync(path.join(packageRoot, source), "utf8"));
  }
});

test("upstream Analyze skill requires approval and is backed up before replacement", () => {
  const p = project();
  const destination = path.join(p, ".github/skills/speckit-analyze/SKILL.md");
  const upstreamContent = "upstream Analyze skill";
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, upstreamContent);

  const plan = buildPlan(p, packageRoot);
  const analyze = plan.find((item) => item.destinationRel === ".github/skills/speckit-analyze/SKILL.md");
  assert.equal(analyze.classification, "custom");
  assert.throws(() => install({ project: p, packageRoot, plan, version: "0.5.2" }), /approval/);
  assert.equal(fs.readFileSync(destination, "utf8"), upstreamContent);

  const result = install({ project: p, packageRoot, plan, version: "0.5.2", allowCustom: true });
  assert.ok(result.backupRoot);
  assert.equal(fs.readFileSync(path.join(result.backupRoot, ".github/skills/speckit-analyze/SKILL.md"), "utf8"), upstreamContent);
  assert.equal(fs.readFileSync(destination, "utf8"), fs.readFileSync(path.join(packageRoot, analyze.sourceRel), "utf8"));
});

test("PowerShell and shell installers distribute the canonical Analyze skill", () => {
  const powershellInstaller = fs.readFileSync(path.join(packageRoot, "install.ps1"), "utf8");
  const shellInstaller = fs.readFileSync(path.join(packageRoot, "install.sh"), "utf8");
  const version = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")).version;
  const lockVersion = JSON.parse(fs.readFileSync(path.join(packageRoot, "package-lock.json"), "utf8")).version;

  assert.ok(powershellInstaller.includes("Source='skills/speckit-analyze/SKILL.md'; Destination='.github/skills/speckit-analyze/SKILL.md'"));
  assert.ok(powershellInstaller.includes("Source='skills/speckit-remediate/SKILL.md'; Destination='.github/skills/speckit-remediate/SKILL.md'"));
  assert.ok(powershellInstaller.includes("Source='skills/speckit-review/SKILL.md'; Destination='.github/skills/speckit-review/SKILL.md'"));
  assert.ok(powershellInstaller.includes("Source='skills/speckit-summary/SKILL.md'; Destination='.github/skills/speckit-summary/SKILL.md'"));
  assert.ok(powershellInstaller.includes("Source='skills/speckit-preview/SKILL.md'; Destination='.github/skills/speckit-preview/SKILL.md'"));
  assert.ok(shellInstaller.includes('".github/skills/speckit-analyze/SKILL.md"'));
  assert.ok(shellInstaller.includes('".github/skills/speckit-remediate/SKILL.md"'));
  assert.ok(shellInstaller.includes('".github/skills/speckit-review/SKILL.md"'));
  assert.ok(shellInstaller.includes('".github/skills/speckit-summary/SKILL.md"'));
  assert.ok(shellInstaller.includes('".github/skills/speckit-preview/SKILL.md"'));
  assert.ok(powershellInstaller.includes("$customConflicts.Count -gt 0 -and -not $Force"));
  assert.ok(shellInstaller.includes('"$FORCE" != "1"'));
  assert.ok(powershellInstaller.includes("(Get-Content (Join-Path $RepoRoot 'VERSION') -Raw).Trim()"));
  assert.ok(shellInstaller.includes('$(cat "$ROOT/VERSION")'));
  assert.ok(powershellInstaller.includes("BetterSpecKit/backups"));
  assert.ok(shellInstaller.includes(".better-spec-kit-backup"));
  assert.equal(fs.readFileSync(path.join(packageRoot, "VERSION"), "utf8").trim(), version);
  assert.equal(lockVersion, version);
  const packageFiles = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")).files;
  assert.ok(packageFiles.includes("skills"));
  assert.ok(!packageFiles.includes(".github"), "dogfood skill copies must not be included in the package allowlist");
  assert.ok(fs.existsSync(path.join(packageRoot, "skills/speckit-review/SKILL.md")));
  assert.ok(fs.existsSync(path.join(packageRoot, "skills/speckit-summary/SKILL.md")));
  assert.ok(fs.existsSync(path.join(packageRoot, "skills/speckit-preview/SKILL.md")));
  assert.ok(fs.existsSync(path.join(packageRoot, "skills/speckit-remediate/SKILL.md")));
});

test("standalone installers call the shared Bug provisioner best-effort", () => {
  const powershellInstaller = fs.readFileSync(path.join(packageRoot, "install.ps1"), "utf8");
  const shellInstaller = fs.readFileSync(path.join(packageRoot, "install.sh"), "utf8");
  const packageFiles = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")).files;

  assert.ok(powershellInstaller.includes("bin/provision-bug.js"));
  assert.ok(powershellInstaller.includes("Bug provisioning partial-success"));
  assert.ok(shellInstaller.includes('node "$ROOT/bin/provision-bug.js" "$TARGET"'));
  assert.ok(shellInstaller.includes("Bug provisioning partial-success"));
  assert.ok(packageFiles.includes("bin"), "the shared wrapper must be included in the package");
  assert.ok(packageFiles.includes("skills"));
  assert.ok(packageFiles.includes("instructions"));
  assert.ok(powershellInstaller.includes("Source='skills/speckit-scope/SKILL.md'; Destination='.github/skills/speckit-scope/SKILL.md'"));
  assert.ok(powershellInstaller.includes("Source='skills/speckit-quick/SKILL.md'; Destination='.github/skills/speckit-quick/SKILL.md'"));
  assert.ok(powershellInstaller.includes("Source='instructions/scope-handoffs.instructions.md'; Destination='.github/instructions/scope-handoffs.instructions.md'"));
  assert.ok(shellInstaller.includes('".github/skills/speckit-scope/SKILL.md"'));
  assert.ok(shellInstaller.includes('".github/skills/speckit-quick/SKILL.md"'));
  assert.ok(shellInstaller.includes('".github/instructions/scope-handoffs.instructions.md"'));
  assert.ok(shellInstaller.includes("source_for_destination"));
});

test("customized handoff instruction requires approval and is backed up", () => {
  const p = project();
  const destination = path.join(p, ".github/instructions/scope-handoffs.instructions.md");
  const customized = "Local handoff instruction";
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, customized);

  const plan = buildPlan(p, packageRoot);
  assert.throws(() => install({ project: p, packageRoot, plan, version: "0.5.2" }), /approval/);
  assert.equal(fs.readFileSync(destination, "utf8"), customized);

  const result = install({ project: p, packageRoot, plan, version: "0.5.2", allowCustom: true });
  assert.ok(result.backupRoot);
  assert.equal(fs.readFileSync(path.join(result.backupRoot, ".github/instructions/scope-handoffs.instructions.md"), "utf8"), customized);
  assert.equal(fs.readFileSync(destination, "utf8"), fs.readFileSync(path.join(packageRoot, "instructions/scope-handoffs.instructions.md"), "utf8"));
});

test("updating an installed project detects the new Remediate skill", () => {
  const p = project();
  for (const name of ["speckit-design", "speckit-plan", "speckit-tasks", "speckit-analyze", "speckit-implement", "speckit-review"]) {
    const source = path.join(packageRoot, "skills", name, "SKILL.md");
    const destination = path.join(p, ".github/skills", name, "SKILL.md");
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
  fs.writeFileSync(path.join(p, ".specify/better-spec-kit.json"), JSON.stringify({ name: "better-spec-kit", version: "0.5.1" }));

  const plan = buildPlan(p, packageRoot);
  const remediate = plan.find((item) => item.destinationRel === ".github/skills/speckit-remediate/SKILL.md");
  const preview = plan.find((item) => item.destinationRel === ".github/skills/speckit-preview/SKILL.md");
  assert.equal(remediate.classification, "new");
  assert.equal(preview.classification, "new");
  const result = install({ project: p, packageRoot, plan, version: "0.6.0" });

  assert.equal(result.changed, 6);
  assert.equal(fs.readFileSync(path.join(p, remediate.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, remediate.sourceRel), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, preview.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, preview.sourceRel), "utf8"));
  assert.equal(fs.existsSync(path.join(p, ".github/skills/speckit-scope/SKILL.md")), true);
  assert.equal(fs.existsSync(path.join(p, ".github/skills/speckit-quick/SKILL.md")), true);
  assert.equal(fs.existsSync(path.join(p, ".github/instructions/scope-handoffs.instructions.md")), true);
});

test("PowerShell installer requires approval for a customized Analyze skill with Better Spec Kit markers", { skip: process.platform !== "win32" }, () => {
  const p = project();
  const localAppData = fs.mkdtempSync(path.join(os.tmpdir(), "bsk-localappdata-"));
  const destination = path.join(p, ".github/skills/speckit-analyze/SKILL.md");
  const canonical = fs.readFileSync(path.join(packageRoot, "skills/speckit-analyze/SKILL.md"), "utf8");
  const customized = `${canonical}\nLocal Analyze customization`;
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, customized);

  const invokeInstaller = (args) =>
    spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", path.join(packageRoot, "install.ps1"), "-TargetPath", p, "-NonInteractive", ...args], {
      encoding: "utf8",
      env: { ...process.env, LOCALAPPDATA: localAppData },
    });

  try {
    fs.rmSync(path.join(p, ".specify"), { recursive: true, force: true });
    const denied = invokeInstaller([]);
    assert.notEqual(denied.status, 0, `${denied.stdout}\n${denied.stderr}`);
    assert.match(`${denied.stdout}\n${denied.stderr}`, /Customised\/unknown files would change/);
    assert.equal(fs.readFileSync(destination, "utf8"), customized);

    const approved = invokeInstaller(["-Force"]);
    assert.equal(approved.status, 0, `${approved.stdout}\n${approved.stderr}`);
    assert.equal(fs.readFileSync(destination, "utf8"), canonical);

    const backupBase = path.join(localAppData, "BetterSpecKit", "backups", path.basename(p));
    const [backupStamp] = fs.readdirSync(backupBase);
    const backupPath = path.join(backupBase, backupStamp, ".github", "skills", "speckit-analyze", "SKILL.md");
    assert.equal(fs.readFileSync(backupPath, "utf8"), customized);
  } finally {
    fs.rmSync(p, { recursive: true, force: true });
    fs.rmSync(localAppData, { recursive: true, force: true });
  }
});

test("customised managed file blocks installation without approval", () => {
  const p = project(),
    f = path.join(p, ".github/skills/speckit-review/SKILL.md");
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, "customised");
  assert.throws(() => install({ project: p, packageRoot, plan: buildPlan(p, packageRoot), version: "0.4.0" }), /approval/);
  assert.equal(fs.readFileSync(f, "utf8"), "customised");
});

test("customized Preview skill requires approval and is backed up", () => {
  const p = project();
  const destination = path.join(p, ".github/skills/speckit-preview/SKILL.md");
  const customized = "Local Preview workflow";
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, customized);

  const plan = buildPlan(p, packageRoot);
  assert.throws(() => install({ project: p, packageRoot, plan, version: "0.5.11" }), /approval/);
  assert.equal(fs.readFileSync(destination, "utf8"), customized);

  const result = install({ project: p, packageRoot, plan, version: "0.5.11", allowCustom: true });
  assert.ok(result.backupRoot);
  assert.equal(fs.readFileSync(path.join(result.backupRoot, ".github/skills/speckit-preview/SKILL.md"), "utf8"), customized);
  assert.equal(fs.readFileSync(destination, "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-preview/SKILL.md"), "utf8"));
});

test("customized Summary skill requires approval and is backed up", () => {
  const p = project();
  const destination = path.join(p, ".github/skills/speckit-summary/SKILL.md");
  const customized = "Local Summary workflow";
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, customized);

  const plan = buildPlan(p, packageRoot);
  assert.throws(() => install({ project: p, packageRoot, plan, version: "0.5.8" }), /approval/);
  assert.equal(fs.readFileSync(destination, "utf8"), customized);

  const result = install({ project: p, packageRoot, plan, version: "0.5.8", allowCustom: true });
  assert.ok(result.backupRoot);
  assert.equal(fs.readFileSync(path.join(result.backupRoot, ".github/skills/speckit-summary/SKILL.md"), "utf8"), customized);
  assert.equal(fs.readFileSync(destination, "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-summary/SKILL.md"), "utf8"));
});

test("approved overwrite creates external backup", () => {
  const p = project(),
    f = path.join(p, ".github/skills/speckit-review/SKILL.md");
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, "customised");
  const result = install({ project: p, packageRoot, plan: buildPlan(p, packageRoot), version: "0.4.0", allowCustom: true });
  assert.ok(result.backupRoot);
  assert.equal(fs.readFileSync(path.join(result.backupRoot, ".github/skills/speckit-review/SKILL.md"), "utf8"), "customised");
  assert.notEqual(fs.readFileSync(f, "utf8"), "customised");
});
