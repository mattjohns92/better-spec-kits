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
  assert.equal(result.changed, 24);
  assert.equal(fs.readFileSync(path.join(p, ".github/skills/speckit-review/SKILL.md"), "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-review/SKILL.md"), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, ".github/skills/speckit-summary/SKILL.md"), "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-summary/SKILL.md"), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, ".github/skills/speckit-preview/SKILL.md"), "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-preview/SKILL.md"), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, ".github/skills/speckit-preflight/SKILL.md"), "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-preflight/SKILL.md"), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, ".github/skills/speckit-status/SKILL.md"), "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-status/SKILL.md"), "utf8"));
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

test("lifecycle skills remain in the existing managed distribution", () => {
  const pairs = [
    ["skills/speckit-scope/SKILL.md", ".github/skills/speckit-scope/SKILL.md"],
    ["skills/speckit-quick/SKILL.md", ".github/skills/speckit-quick/SKILL.md"],
    ["skills/speckit-design/SKILL.md", ".github/skills/speckit-design/SKILL.md"],
    ["skills/speckit-review/SKILL.md", ".github/skills/speckit-review/SKILL.md"],
    ["skills/speckit-status/SKILL.md", ".github/skills/speckit-status/SKILL.md"],
    ["skills/speckit-preflight/SKILL.md", ".github/skills/speckit-preflight/SKILL.md"],
    ["skills/speckit-release/SKILL.md", ".github/skills/speckit-release/SKILL.md"],
    ["skills/speckit-auto/SKILL.md", ".github/skills/speckit-auto/SKILL.md"],
  ];
  const packageFiles = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")).files;
  const powershellInstaller = fs.readFileSync(path.join(packageRoot, "install.ps1"), "utf8");
  const shellInstaller = fs.readFileSync(path.join(packageRoot, "install.sh"), "utf8");
  const target = project();
  const plan = buildPlan(target, packageRoot);

  assert.ok(packageFiles.includes("skills"));
  assert.ok(!packageFiles.includes(".github"));
  for (const [source, destination] of pairs) {
    const entry = plan.find((item) => item.destinationRel === destination);
    assert.equal(entry?.sourceRel, source);
    assert.equal(entry?.classification, "new");
    assert.ok(powershellInstaller.includes(`Source='${source}'; Destination='${destination}'`));
    assert.ok(shellInstaller.includes(`"${destination}"`));
  }

  install({ project: target, packageRoot, plan, version: "0.6.0" });
  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  for (const [source, destination] of pairs) {
    const canonical = fs.readFileSync(path.join(packageRoot, source), "utf8");
    const managed = fs.readFileSync(path.join(target, destination), "utf8");
    const dogfood = fs.readFileSync(path.join(packageRoot, destination), "utf8");
    assert.equal(normalizeLineEndings(managed), normalizeLineEndings(canonical), `${destination} must install the canonical skill`);
    assert.equal(normalizeLineEndings(dogfood), normalizeLineEndings(canonical), `${destination} must match the canonical skill`);
  }
});

test("Auto skill and Copilot hook assets use managed install and customization safeguards", () => {
  const assets = [
    ["skills/speckit-auto/SKILL.md", ".github/skills/speckit-auto/SKILL.md"],
    ["hooks/speckit-auto.json", ".github/hooks/speckit-auto.json"],
    ["hooks/speckit-auto.mjs", ".github/hooks/speckit-auto.mjs"],
  ];
  const packageFiles = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")).files;
  const powershellInstaller = fs.readFileSync(path.join(packageRoot, "install.ps1"), "utf8");
  const shellInstaller = fs.readFileSync(path.join(packageRoot, "install.sh"), "utf8");
  const freshProject = project();
  const plan = buildPlan(freshProject, packageRoot);

  for (const [sourceRel, destinationRel] of assets) {
    const entry = plan.find((item) => item.destinationRel === destinationRel);
    assert.equal(entry?.sourceRel, sourceRel);
    assert.equal(entry?.classification, "new");
  }
  assert.ok(packageFiles.includes("hooks"));
  assert.ok(!packageFiles.includes(".github"));
  assert.ok(powershellInstaller.includes("Source='hooks/speckit-auto.json'; Destination='.github/hooks/speckit-auto.json'"));
  assert.ok(powershellInstaller.includes("Source='hooks/speckit-auto.mjs'; Destination='.github/hooks/speckit-auto.mjs'"));
  assert.ok(shellInstaller.includes('".github/hooks/speckit-auto.json"'));
  assert.ok(shellInstaller.includes('".github/hooks/speckit-auto.mjs"'));

  install({ project: freshProject, packageRoot, plan, version: "0.5.23" });
  for (const [sourceRel, destinationRel] of assets) {
    assert.equal(fs.readFileSync(path.join(freshProject, destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, sourceRel), "utf8"));
  }
  for (const [sourceRel, dogfoodRel] of [
    ["skills/speckit-auto/SKILL.md", ".github/skills/speckit-auto/SKILL.md"],
    ["hooks/speckit-auto.json", ".github/hooks/speckit-auto.json"],
    ["hooks/speckit-auto.mjs", ".github/hooks/speckit-auto.mjs"],
  ]) {
    const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
    assert.equal(
      normalizeLineEndings(fs.readFileSync(path.join(packageRoot, sourceRel), "utf8")),
      normalizeLineEndings(fs.readFileSync(path.join(packageRoot, dogfoodRel), "utf8")),
      `${dogfoodRel} must match ${sourceRel}`,
    );
  }

  const customProject = project();
  const customPath = path.join(customProject, ".github/hooks/speckit-auto.json");
  const customContent = '{"version":1,"hooks":{"agentStop":[]},"custom":true}\n';
  fs.mkdirSync(path.dirname(customPath), { recursive: true });
  fs.writeFileSync(customPath, customContent);
  const customPlan = buildPlan(customProject, packageRoot);
  assert.equal(customPlan.find((item) => item.destinationRel === ".github/hooks/speckit-auto.json")?.classification, "custom");
  assert.throws(() => install({ project: customProject, packageRoot, plan: customPlan, version: "0.5.23" }), /approval/);
  assert.equal(fs.readFileSync(customPath, "utf8"), customContent);

  const previousLocalAppData = process.env.LOCALAPPDATA;
  const isolatedLocalAppData = fs.mkdtempSync(path.join(os.tmpdir(), "bsk-auto-backup-"));
  process.env.LOCALAPPDATA = isolatedLocalAppData;
  try {
    const result = install({ project: customProject, packageRoot, plan: customPlan, version: "0.5.23", allowCustom: true });
    assert.ok(result.backupRoot);
    assert.equal(fs.readFileSync(path.join(result.backupRoot, ".github/hooks/speckit-auto.json"), "utf8"), customContent);
    assert.equal(fs.readFileSync(customPath, "utf8"), fs.readFileSync(path.join(packageRoot, "hooks/speckit-auto.json"), "utf8"));
  } finally {
    if (previousLocalAppData === undefined) delete process.env.LOCALAPPDATA;
    else process.env.LOCALAPPDATA = previousLocalAppData;
    fs.rmSync(isolatedLocalAppData, { recursive: true, force: true });
  }
});

test("Clarify install distinguishes absent, current, upstream, and customized files", () => {
  const canonicalPath = path.join(packageRoot, "skills/speckit-clarify/SKILL.md");
  const canonical = fs.readFileSync(canonicalPath, "utf8");
  const destinationRel = ".github/skills/speckit-clarify/SKILL.md";
  const freshProject = project();
  const freshEntry = buildPlan(freshProject, packageRoot).find((item) => item.destinationRel === destinationRel);

  assert.equal(freshEntry?.sourceRel, "skills/speckit-clarify/SKILL.md");
  assert.equal(freshEntry?.classification, "new");
  install({ project: freshProject, packageRoot, plan: buildPlan(freshProject, packageRoot), version: "0.5.17" });
  assert.equal(fs.readFileSync(path.join(freshProject, destinationRel), "utf8"), canonical);
  assert.equal(buildPlan(freshProject, packageRoot).find((item) => item.destinationRel === destinationRel)?.classification, "current");

  const upstreamProject = project();
  const upstreamDestination = path.join(upstreamProject, destinationRel);
  const upstreamDefault = "Upstream Spec Kit Clarify\nFixed question limit; Better Spec Kit compatibility note.";
  fs.mkdirSync(path.dirname(upstreamDestination), { recursive: true });
  fs.writeFileSync(upstreamDestination, upstreamDefault);
  const upstreamEntry = buildPlan(upstreamProject, packageRoot).find((item) => item.destinationRel === destinationRel);
  assert.equal(upstreamEntry?.classification, "custom");
  assert.throws(() => install({ project: upstreamProject, packageRoot, plan: buildPlan(upstreamProject, packageRoot), version: "0.5.17" }), /approval/);
  assert.equal(fs.readFileSync(upstreamDestination, "utf8"), upstreamDefault);
  const upstreamResult = install({ project: upstreamProject, packageRoot, plan: buildPlan(upstreamProject, packageRoot), version: "0.5.17", allowCustom: true });
  assert.ok(upstreamResult.backupRoot);
  assert.equal(fs.readFileSync(path.join(upstreamResult.backupRoot, destinationRel), "utf8"), upstreamDefault);

  const customizedProject = project();
  const customizedDestination = path.join(customizedProject, destinationRel);
  const customized = `${canonical}\nLocal Clarify customization`;
  fs.mkdirSync(path.dirname(customizedDestination), { recursive: true });
  fs.writeFileSync(customizedDestination, customized);
  assert.equal(buildPlan(customizedProject, packageRoot).find((item) => item.destinationRel === destinationRel)?.classification, "custom");
  assert.throws(() => install({ project: customizedProject, packageRoot, plan: buildPlan(customizedProject, packageRoot), version: "0.5.17" }), /approval/);
  const customizedResult = install({ project: customizedProject, packageRoot, plan: buildPlan(customizedProject, packageRoot), version: "0.5.17", allowCustom: true });
  assert.ok(customizedResult.backupRoot);
  assert.equal(fs.readFileSync(path.join(customizedResult.backupRoot, destinationRel), "utf8"), customized);
  assert.equal(fs.readFileSync(customizedDestination, "utf8"), canonical);

  const packageFiles = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")).files;
  const powershellInstaller = fs.readFileSync(path.join(packageRoot, "install.ps1"), "utf8");
  const shellInstaller = fs.readFileSync(path.join(packageRoot, "install.sh"), "utf8");
  assert.ok(packageFiles.includes("skills"));
  assert.ok(!packageFiles.includes(".github"));
  assert.ok(powershellInstaller.includes("Source='skills/speckit-clarify/SKILL.md'; Destination='.github/skills/speckit-clarify/SKILL.md'"));
  assert.ok(shellInstaller.includes('".github/skills/speckit-clarify/SKILL.md"'));
  assert.equal(fs.readFileSync(path.join(packageRoot, ".github/skills/speckit-clarify/SKILL.md"), "utf8"), canonical);
});

test("Specify scope instruction is managed, packaged, and protected when customized", () => {
  const sourceRel = "instructions/speckit-specify-scope.instructions.md";
  const destinationRel = ".github/instructions/speckit-specify-scope.instructions.md";
  const source = path.join(packageRoot, sourceRel);
  const canonical = fs.readFileSync(source, "utf8");
  const packageFiles = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")).files;
  const powershellInstaller = fs.readFileSync(path.join(packageRoot, "install.ps1"), "utf8");
  const shellInstaller = fs.readFileSync(path.join(packageRoot, "install.sh"), "utf8");

  const freshProject = project();
  const freshEntry = buildPlan(freshProject, packageRoot).find((item) => item.destinationRel === destinationRel);
  assert.equal(freshEntry?.sourceRel, sourceRel);
  assert.equal(freshEntry?.classification, "new");
  install({ project: freshProject, packageRoot, plan: buildPlan(freshProject, packageRoot), version: "0.5.17" });
  assert.equal(fs.readFileSync(path.join(freshProject, destinationRel), "utf8"), canonical);

  const customizedProject = project();
  const customizedDestination = path.join(customizedProject, destinationRel);
  const upstream = "Upstream instruction mentioning Better Spec Kit compatibility.";
  fs.mkdirSync(path.dirname(customizedDestination), { recursive: true });
  fs.writeFileSync(customizedDestination, upstream);
  assert.equal(buildPlan(customizedProject, packageRoot).find((item) => item.destinationRel === destinationRel)?.classification, "custom");
  assert.throws(() => install({ project: customizedProject, packageRoot, plan: buildPlan(customizedProject, packageRoot), version: "0.5.17" }), /approval/);
  assert.equal(fs.readFileSync(customizedDestination, "utf8"), upstream);
  const result = install({ project: customizedProject, packageRoot, plan: buildPlan(customizedProject, packageRoot), version: "0.5.17", allowCustom: true });
  assert.ok(result.backupRoot);
  assert.equal(fs.readFileSync(path.join(result.backupRoot, destinationRel), "utf8"), upstream);
  assert.equal(fs.readFileSync(customizedDestination, "utf8"), canonical);

  assert.ok(packageFiles.includes("instructions"));
  assert.ok(!packageFiles.includes(".github"));
  assert.ok(powershellInstaller.includes("Source='instructions/speckit-specify-scope.instructions.md'; Destination='.github/instructions/speckit-specify-scope.instructions.md'"));
  assert.ok(shellInstaller.includes('".github/instructions/speckit-specify-scope.instructions.md"'));
});

test("PowerShell installer treats upstream Specify instruction with Better Spec Kit wording as custom", { skip: process.platform !== "win32" }, () => {
  const p = project();
  const localAppData = fs.mkdtempSync(path.join(os.tmpdir(), "bsk-localappdata-"));
  const destination = path.join(p, ".github/instructions/speckit-specify-scope.instructions.md");
  const upstream = "Upstream project instruction mentioning Better Spec Kit conventions.";
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, upstream);

  const invokeInstaller = (args) =>
    spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", path.join(packageRoot, "install.ps1"), "-TargetPath", p, "-NonInteractive", ...args], {
      encoding: "utf8",
      env: { ...process.env, LOCALAPPDATA: localAppData },
    });

  try {
    const denied = invokeInstaller([]);
    assert.notEqual(denied.status, 0, `${denied.stdout}\n${denied.stderr}`);
    assert.match(`${denied.stdout}\n${denied.stderr}`, /Customised\/unknown files would change/);
    assert.equal(fs.readFileSync(destination, "utf8"), upstream);

    const approved = invokeInstaller(["-Force"]);
    assert.equal(approved.status, 0, `${approved.stdout}\n${approved.stderr}`);
    const canonical = fs.readFileSync(path.join(packageRoot, "instructions/speckit-specify-scope.instructions.md"), "utf8");
    assert.equal(fs.readFileSync(destination, "utf8"), canonical);

    const backupBase = path.join(localAppData, "BetterSpecKit", "backups", path.basename(p));
    const [backupStamp] = fs.readdirSync(backupBase);
    const backupPath = path.join(backupBase, backupStamp, ".github", "instructions", "speckit-specify-scope.instructions.md");
    assert.equal(fs.readFileSync(backupPath, "utf8"), upstream);
  } finally {
    fs.rmSync(p, { recursive: true, force: true });
    fs.rmSync(localAppData, { recursive: true, force: true });
  }
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
  const status = plan.find((item) => item.destinationRel === ".github/skills/speckit-status/SKILL.md");
  assert.equal(review.classification, "new");
  assert.equal(summary.classification, "new");
  assert.equal(analyze.classification, "new");
  assert.equal(remediate.classification, "new");
  assert.equal(preview.classification, "new");
  assert.equal(status.classification, "new");
  const result = install({ project: p, packageRoot, plan, version: "0.5.0" });

  assert.equal(result.changed, 20);
  assert.equal(fs.readFileSync(path.join(p, review.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, review.sourceRel), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, summary.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, summary.sourceRel), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, analyze.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, analyze.sourceRel), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, remediate.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, remediate.sourceRel), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, preview.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, preview.sourceRel), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, status.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, status.sourceRel), "utf8"));
  const preflight = plan.find((item) => item.destinationRel === ".github/skills/speckit-preflight/SKILL.md");
  assert.equal(preflight.classification, "new");
  assert.equal(fs.readFileSync(path.join(p, preflight.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, preflight.sourceRel), "utf8"));
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

test("Project Status dogfood copy matches the packaged canonical skill", () => {
  const canonical = path.join(packageRoot, "skills/speckit-status/SKILL.md");
  const dogfood = path.join(packageRoot, ".github/skills/speckit-status/SKILL.md");
  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  const packageFiles = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")).files;

  assert.equal(normalizeLineEndings(fs.readFileSync(dogfood, "utf8")), normalizeLineEndings(fs.readFileSync(canonical, "utf8")));
  assert.ok(packageFiles.includes("skills"));
  assert.ok(!packageFiles.includes(".github"));
  assert.ok(fs.existsSync(canonical));
});

test("Graphify-aware workflow skills remain synchronized with managed dogfood copies", () => {
  const pairs = [
    ["skills/speckit-scope/SKILL.md", ".github/skills/speckit-scope/SKILL.md"],
    ["skills/speckit-clarify/SKILL.md", ".github/skills/speckit-clarify/SKILL.md"],
    ["skills/speckit-design/SKILL.md", ".github/skills/speckit-design/SKILL.md"],
    ["skills/speckit-plan/SKILL.md", ".github/skills/speckit-plan/SKILL.md"],
    ["skills/speckit-analyze/SKILL.md", ".github/skills/speckit-analyze/SKILL.md"],
    ["skills/speckit-implement/SKILL.md", ".github/skills/speckit-implement/SKILL.md"],
    ["skills/speckit-review/SKILL.md", ".github/skills/speckit-review/SKILL.md"],
    ["skills/speckit-query/SKILL.md", ".github/skills/speckit-query/SKILL.md"],
    ["instructions/speckit-specify-scope.instructions.md", ".github/instructions/speckit-specify-scope.instructions.md"],
  ];
  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();

  for (const [canonicalPath, dogfoodPath] of pairs) {
    assert.equal(
      normalizeLineEndings(fs.readFileSync(path.join(packageRoot, dogfoodPath), "utf8")),
      normalizeLineEndings(fs.readFileSync(path.join(packageRoot, canonicalPath), "utf8")),
      `${dogfoodPath} must match ${canonicalPath}`,
    );
  }
});

test("Project Query is included in managed, standalone, and npm skill distribution", () => {
  const canonicalPath = path.join(packageRoot, "skills/speckit-query/SKILL.md");
  const dogfoodPath = path.join(packageRoot, ".github/skills/speckit-query/SKILL.md");
  const canonical = fs.readFileSync(canonicalPath, "utf8");
  const packageFiles = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")).files;
  const powershellInstaller = fs.readFileSync(path.join(packageRoot, "install.ps1"), "utf8");
  const shellInstaller = fs.readFileSync(path.join(packageRoot, "install.sh"), "utf8");
  const query = buildPlan(project(), packageRoot).find((item) => item.destinationRel === ".github/skills/speckit-query/SKILL.md");

  assert.ok(fs.existsSync(dogfoodPath), "Project Query dogfood skill is missing");
  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  assert.equal(normalizeLineEndings(fs.readFileSync(dogfoodPath, "utf8")), normalizeLineEndings(canonical));
  assert.equal(query?.sourceRel, "skills/speckit-query/SKILL.md");
  assert.equal(query?.classification, "new");
  assert.ok(powershellInstaller.includes("Source='skills/speckit-query/SKILL.md'; Destination='.github/skills/speckit-query/SKILL.md'"));
  assert.ok(shellInstaller.includes('".github/skills/speckit-query/SKILL.md"'));
  assert.ok(packageFiles.includes("skills"));
  assert.ok(!packageFiles.includes(".github"));

  const customizedProject = project();
  const destination = path.join(customizedProject, ".github/skills/speckit-query/SKILL.md");
  const customized = "Local Project Query workflow";
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, customized);
  const customizedQuery = buildPlan(customizedProject, packageRoot).find((item) => item.destinationRel === ".github/skills/speckit-query/SKILL.md");
  assert.equal(customizedQuery?.classification, "custom");
  assert.throws(() => install({ project: customizedProject, packageRoot, plan: buildPlan(customizedProject, packageRoot), version: "0.5.15" }), /approval/);
  assert.equal(fs.readFileSync(destination, "utf8"), customized);

  const result = install({ project: customizedProject, packageRoot, plan: buildPlan(customizedProject, packageRoot), version: "0.5.15", allowCustom: true });
  assert.ok(result.backupRoot);
  assert.equal(fs.readFileSync(path.join(result.backupRoot, ".github/skills/speckit-query/SKILL.md"), "utf8"), customized);
  assert.equal(fs.readFileSync(destination, "utf8"), canonical);
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
  assert.ok(powershellInstaller.includes("Source='skills/speckit-status/SKILL.md'; Destination='.github/skills/speckit-status/SKILL.md'"));
  assert.ok(shellInstaller.includes('".github/skills/speckit-analyze/SKILL.md"'));
  assert.ok(shellInstaller.includes('".github/skills/speckit-remediate/SKILL.md"'));
  assert.ok(shellInstaller.includes('".github/skills/speckit-review/SKILL.md"'));
  assert.ok(shellInstaller.includes('".github/skills/speckit-summary/SKILL.md"'));
  assert.ok(shellInstaller.includes('".github/skills/speckit-preview/SKILL.md"'));
  assert.ok(shellInstaller.includes('".github/skills/speckit-status/SKILL.md"'));
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
  assert.ok(fs.existsSync(path.join(packageRoot, "skills/speckit-status/SKILL.md")));
  assert.ok(fs.existsSync(path.join(packageRoot, "skills/speckit-remediate/SKILL.md")));
});

test("Implement remains in standalone installer and npm package distribution", () => {
  const powershellInstaller = fs.readFileSync(path.join(packageRoot, "install.ps1"), "utf8");
  const shellInstaller = fs.readFileSync(path.join(packageRoot, "install.sh"), "utf8");
  const packageFiles = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")).files;

  assert.ok(powershellInstaller.includes("Source='skills/speckit-implement/SKILL.md'; Destination='.github/skills/speckit-implement/SKILL.md'"));
  assert.ok(shellInstaller.includes('".github/skills/speckit-implement/SKILL.md"'));
  assert.ok(packageFiles.includes("skills"));
  assert.ok(!packageFiles.includes(".github"));
  assert.ok(fs.existsSync(path.join(packageRoot, "skills/speckit-implement/SKILL.md")));
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

test("work item identity instruction is managed, packaged, and synchronized", () => {
  const sourceRel = "instructions/work-item-identity.instructions.md";
  const destinationRel = ".github/instructions/work-item-identity.instructions.md";
  const packageFiles = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")).files;
  const powershellInstaller = fs.readFileSync(path.join(packageRoot, "install.ps1"), "utf8");
  const shellInstaller = fs.readFileSync(path.join(packageRoot, "install.sh"), "utf8");
  const target = project();
  const plan = buildPlan(target, packageRoot);
  const entry = plan.find((item) => item.destinationRel === destinationRel);

  assert.equal(entry?.sourceRel, sourceRel);
  assert.equal(entry?.classification, "new");
  assert.ok(packageFiles.includes("instructions"));
  assert.ok(!packageFiles.includes(".github"));
  assert.ok(powershellInstaller.includes(`Source='${sourceRel}'; Destination='${destinationRel}'`));
  assert.ok(shellInstaller.includes(`"${destinationRel}"`));

  install({ project: target, packageRoot, plan, version: "0.6.2" });
  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  const canonical = fs.readFileSync(path.join(packageRoot, sourceRel), "utf8");
  assert.equal(fs.readFileSync(path.join(target, destinationRel), "utf8"), canonical);
  assert.equal(normalizeLineEndings(fs.readFileSync(path.join(packageRoot, destinationRel), "utf8")), normalizeLineEndings(canonical));
});

test("installer preserves local ignore rules and ignores source ownership state", () => {
  const target = project();
  const ignorePath = path.join(target, ".specify/.gitignore");
  const existing = "# consumer-local rules\nfeature.json\n";
  fs.writeFileSync(ignorePath, existing);

  install({ project: target, packageRoot, plan: [], version: "0.6.2" });
  const firstInstall = fs.readFileSync(ignorePath, "utf8");
  assert.ok(firstInstall.startsWith(existing));
  assert.match(firstInstall, /(^|\n)source-ownership\.json(\n|$)/);
  assert.match(firstInstall, /(^|\n)source-ownership\.lock\/(\n|$)/);

  install({ project: target, packageRoot, plan: [], version: "0.6.2" });
  assert.equal(fs.readFileSync(ignorePath, "utf8"), firstInstall);
});

test("source ownership assets use managed install and preserve dogfood parity", () => {
  const assets = [
    ["hooks/speckit-source-ownership.mjs", ".github/hooks/speckit-source-ownership.mjs"],
    ["instructions/shared-source-ownership.instructions.md", ".github/instructions/shared-source-ownership.instructions.md"],
    ["skills/speckit-implement/SKILL.md", ".github/skills/speckit-implement/SKILL.md"],
    ["skills/speckit-auto/SKILL.md", ".github/skills/speckit-auto/SKILL.md"],
    ["skills/speckit-review/SKILL.md", ".github/skills/speckit-review/SKILL.md"],
  ];
  const packageFiles = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")).files;
  const powershellInstaller = fs.readFileSync(path.join(packageRoot, "install.ps1"), "utf8");
  const shellInstaller = fs.readFileSync(path.join(packageRoot, "install.sh"), "utf8");
  const target = project();
  const plan = buildPlan(target, packageRoot);

  assert.ok(packageFiles.includes("hooks"));
  assert.ok(packageFiles.includes("instructions"));
  assert.ok(!packageFiles.includes(".github"));
  for (const [sourceRel, destinationRel] of assets) {
    const entry = plan.find((item) => item.destinationRel === destinationRel);
    assert.equal(entry?.sourceRel, sourceRel);
    assert.equal(entry?.classification, "new");
    assert.ok(powershellInstaller.includes(`Source='${sourceRel}'; Destination='${destinationRel}'`));
    assert.ok(shellInstaller.includes(`"${destinationRel}"`));
  }
  assert.ok(powershellInstaller.includes("source-ownership.json"));
  assert.ok(shellInstaller.includes("source-ownership.json"));

  install({ project: target, packageRoot, plan, version: "0.6.2" });
  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  for (const [sourceRel, destinationRel] of assets) {
    const canonical = fs.readFileSync(path.join(packageRoot, sourceRel), "utf8");
    const installed = fs.readFileSync(path.join(target, destinationRel), "utf8");
    const dogfood = fs.readFileSync(path.join(packageRoot, destinationRel), "utf8");
    assert.equal(normalizeLineEndings(installed), normalizeLineEndings(canonical), `${destinationRel} must install the canonical asset`);
    assert.equal(normalizeLineEndings(dogfood), normalizeLineEndings(canonical), `${destinationRel} must match the canonical asset`);
  }
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
  const status = plan.find((item) => item.destinationRel === ".github/skills/speckit-status/SKILL.md");
  assert.equal(remediate.classification, "new");
  assert.equal(preview.classification, "new");
  assert.equal(status.classification, "new");
  const result = install({ project: p, packageRoot, plan, version: "0.6.0" });

  assert.equal(result.changed, 18);
  assert.equal(fs.readFileSync(path.join(p, remediate.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, remediate.sourceRel), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, preview.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, preview.sourceRel), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, status.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, status.sourceRel), "utf8"));
  const preflight = plan.find((item) => item.destinationRel === ".github/skills/speckit-preflight/SKILL.md");
  assert.equal(preflight.classification, "new");
  assert.equal(fs.readFileSync(path.join(p, preflight.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, preflight.sourceRel), "utf8"));
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

test("PowerShell installer treats upstream Clarify with Better Spec Kit wording as custom", { skip: process.platform !== "win32" }, () => {
  const p = project();
  const localAppData = fs.mkdtempSync(path.join(os.tmpdir(), "bsk-localappdata-"));
  const destination = path.join(p, ".github/skills/speckit-clarify/SKILL.md");
  const upstream = "Upstream Spec Kit Clarify\nThis skill mentions Better Spec Kit compatibility.";
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, upstream);

  const invokeInstaller = (args) =>
    spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", path.join(packageRoot, "install.ps1"), "-TargetPath", p, "-NonInteractive", ...args], {
      encoding: "utf8",
      env: { ...process.env, LOCALAPPDATA: localAppData },
    });

  try {
    const denied = invokeInstaller([]);
    assert.notEqual(denied.status, 0, `${denied.stdout}\n${denied.stderr}`);
    assert.match(`${denied.stdout}\n${denied.stderr}`, /Customised\/unknown files would change/);
    assert.equal(fs.readFileSync(destination, "utf8"), upstream);

    const approved = invokeInstaller(["-Force"]);
    assert.equal(approved.status, 0, `${approved.stdout}\n${approved.stderr}`);
    const canonical = fs.readFileSync(path.join(packageRoot, "skills/speckit-clarify/SKILL.md"), "utf8");
    assert.equal(fs.readFileSync(destination, "utf8"), canonical);

    const backupBase = path.join(localAppData, "BetterSpecKit", "backups", path.basename(p));
    const [backupStamp] = fs.readdirSync(backupBase);
    const backupPath = path.join(backupBase, backupStamp, ".github", "skills", "speckit-clarify", "SKILL.md");
    assert.equal(fs.readFileSync(backupPath, "utf8"), upstream);
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

test("customized Project Status skill requires approval and is backed up", () => {
  const p = project();
  const destination = path.join(p, ".github/skills/speckit-status/SKILL.md");
  const customized = "Local Project Status workflow";
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, customized);

  const plan = buildPlan(p, packageRoot);
  const status = plan.find((item) => item.destinationRel === ".github/skills/speckit-status/SKILL.md");
  assert.equal(status.classification, "custom");
  assert.throws(() => install({ project: p, packageRoot, plan, version: "0.5.13" }), /approval/);
  assert.equal(fs.readFileSync(destination, "utf8"), customized);

  const result = install({ project: p, packageRoot, plan, version: "0.5.13", allowCustom: true });
  assert.ok(result.backupRoot);
  assert.equal(fs.readFileSync(path.join(result.backupRoot, ".github/skills/speckit-status/SKILL.md"), "utf8"), customized);
  assert.equal(fs.readFileSync(destination, "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-status/SKILL.md"), "utf8"));
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
