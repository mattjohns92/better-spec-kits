import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "../src/cli.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function project() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "bsk-cli-"));
  fs.mkdirSync(path.join(directory, ".specify"), { recursive: true });
  fs.writeFileSync(path.join(directory, ".specify/better-spec-kit.json"), JSON.stringify({ name: "better-spec-kit", version: "0.4.7" }));
  return directory;
}

async function capture(args) {
  const originalLog = console.log;
  const originalPath = process.env.PATH;
  const isolatedPath = fs.mkdtempSync(path.join(os.tmpdir(), "bsk-path-"));
  let output = "";
  console.log = (...values) => {
    output += `${values.join(" ")}\n`;
  };
  process.env.PATH = isolatedPath;
  try {
    await run(args);
  } finally {
    console.log = originalLog;
    process.env.PATH = originalPath;
    fs.rmSync(isolatedPath, { recursive: true, force: true });
  }
  return output;
}

test("install preview lists Review and Analyze as ADD when they are absent", async () => {
  const directory = project();
  const output = await capture(["install", directory, "--yes"]);
  assert.match(output, /\+ ADD\s+\.github\/skills\/speckit-review\/SKILL\.md/);
  assert.match(output, /\+ ADD\s+\.github\/skills\/speckit-analyze\/SKILL\.md/);
  assert.match(output, /Ready: specify → clarify → design → plan → tasks → analyze → implement → converge → review/);
  assert.match(output, /Analyze is the normal final pre-implementation check/);
});

test("status reports whether the Review skill is installed", async () => {
  const missingProject = project();
  assert.match(await capture(["status", missingProject]), /Review skill: missing/);

  const installedProject = project();
  const source = path.join(packageRoot, "skills/speckit-review/SKILL.md");
  const destination = path.join(installedProject, ".github/skills/speckit-review/SKILL.md");
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  assert.match(await capture(["status", installedProject]), /Review skill: installed/);
});

test("status reports missing, installed, and conflicting Analyze skills", async () => {
  const missingProject = project();
  assert.match(await capture(["status", missingProject]), /Analyze skill: missing/);

  const installedProject = project();
  const source = path.join(packageRoot, "skills/speckit-analyze/SKILL.md");
  const destination = path.join(installedProject, ".github/skills/speckit-analyze/SKILL.md");
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  assert.match(await capture(["status", installedProject]), /Analyze skill: installed/);

  const conflictingProject = project();
  const conflictingDestination = path.join(conflictingProject, ".github/skills/speckit-analyze/SKILL.md");
  fs.mkdirSync(path.dirname(conflictingDestination), { recursive: true });
  fs.writeFileSync(conflictingDestination, "upstream Analyze skill");
  assert.match(await capture(["status", conflictingProject]), /Analyze skill: needs review/);
});

test("doctor flags a missing Review skill in an installed project", async () => {
  const output = await capture(["doctor", project()]);
  assert.match(output, /Review skill is missing/);
});

test("doctor flags missing and conflicting Analyze skills in an installed project", async () => {
  assert.match(await capture(["doctor", project()]), /Analyze skill is missing/);

  const conflictingProject = project();
  const destination = path.join(conflictingProject, ".github/skills/speckit-analyze/SKILL.md");
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, "upstream Analyze skill");
  assert.match(await capture(["doctor", conflictingProject]), /Analyze skill needs manual review/);
});

test("workflow documentation makes Analyze the normal pre-implementation gate", () => {
  const sequence = "specify → clarify → design → plan → tasks → analyze → implement → converge → review";
  const readme = fs.readFileSync(path.join(packageRoot, "README.md"), "utf8").toLowerCase();
  const workflow = fs.readFileSync(path.join(packageRoot, "docs/workflow.md"), "utf8").toLowerCase();
  const installation = fs.readFileSync(path.join(packageRoot, "docs/installation.md"), "utf8").toLowerCase();
  const releasing = fs.readFileSync(path.join(packageRoot, "docs/releasing.md"), "utf8").toLowerCase();
  const integrations = fs.readFileSync(path.join(packageRoot, "docs/integrations.md"), "utf8").toLowerCase();
  const constitution = fs.readFileSync(path.join(packageRoot, "constitution/constitution.md"), "utf8").toLowerCase();
  const dogfoodConstitution = fs.readFileSync(path.join(packageRoot, ".specify/memory/constitution.md"), "utf8").toLowerCase();
  const reviewSkills = [
    fs.readFileSync(path.join(packageRoot, "skills/speckit-review/SKILL.md"), "utf8").toLowerCase(),
    fs.readFileSync(path.join(packageRoot, ".github/skills/speckit-review/SKILL.md"), "utf8").toLowerCase(),
  ];

  for (const [name, content] of [
    ["README", readme],
    ["workflow", workflow],
    ["constitution", constitution],
    ["dogfood constitution", dogfoodConstitution],
  ]) {
    assert.ok(content.includes(sequence), `${name} is missing the recommended Analyze workflow`);
  }
  assert.match(workflow, /analyze is the normal final pre-implementation gate/);
  assert.match(workflow, /blocking findings/);
  assert.match(installation, /enhanced `\.github\/skills\/speckit-analyze\/skill\.md`/);
  assert.match(installation, /backup/);
  assert.match(releasing, /skills\/speckit-analyze\/skill\.md/);
  const releaseVersionSteps = releasing.match(/^1\..*$/gm) ?? [];
  assert.equal(releaseVersionSteps.length, 1, "release guide should have one version synchronization step");
  assert.ok(releaseVersionSteps[0].includes("`version`, `package.json`, and `package-lock.json`"));
  assert.match(integrations, /analyze skill/);
  assert.match(integrations, /upstream/);
  for (const skill of reviewSkills) {
    assert.doesNotMatch(skill, /analyze remains available as an optional/);
    assert.match(skill, /normal final pre-implementation check/);
  }
});

test("Analyze skill preserves consistency checks and challenges material decisions", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-analyze/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "spec.md",
    "plan.md",
    "tasks.md",
    "duplication detection",
    "ambiguity detection",
    "constitution alignment",
    "coverage gaps",
    "cross-artifact inconsistency",
    "relevant established project conventions",
    "demonstrated current problem",
    "existing project capability",
    "hypothetical future",
    "proportionate",
    "ponytail",
    "execution boundary",
  ]) {
    assert.ok(skill.includes(phrase), `Analyze skill is missing decision-challenge guidance: ${phrase}`);
  }
});

test("Analyze skill persists stable findings and exclusively owns analysis.md", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-analyze/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "# pre-implementation analysis",
    "**outcome:** pass | findings | incomplete analysis",
    "**blocking findings:**",
    "## analysis context",
    "## current findings",
    "## resolved findings",
    "a001",
    "preserve the id of an open finding when the same underlying issue remains",
    "next unused sequential",
    "status:** open",
    "blocking:** yes | no",
    "only this analyze run may move an open finding to resolved",
    "resolution verified",
    "only file created or changed by analyze is the active feature's `analysis.md`",
    "other workflows must not resolve, delete, renumber, or rewrite an analyze finding",
  ]) {
    assert.ok(skill.includes(phrase), `Analyze skill is missing persistence/ownership guidance: ${phrase}`);
  }
});

test("Analyze skill routes findings and applies severity and outcome rules", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-analyze/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "earliest authoritative stage",
    "`clarify`",
    "`design`",
    "`plan`",
    "`tasks`",
    "do not route everything to tasks",
    "potential downstream impact",
    "`blocker`",
    "`high`",
    "`medium`",
    "`low`",
    "use high for material new complexity that is unsupported by current requirements",
    "explicit `blocking: yes` or `blocking: no`",
    "unless they demonstrate violation of an explicit requirement",
    "**pass**",
    "**findings**",
    "**incomplete analysis**",
    "do not redesign the interface",
    "feature 006 remediation orchestration is out of scope",
  ]) {
    assert.ok(skill.includes(phrase), `Analyze skill is missing routing/outcome guidance: ${phrase}`);
  }
});

test("Review skill uses current convergence evidence and four quality passes", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-review/SKILL.md"), "utf8");

  for (const phrase of [
    "Current successful Converge evidence",
    "Converge-added tasks remain outstanding",
    "stale rather than current",
    "Missing convergence evidence alone MUST NOT force INCOMPLETE REVIEW",
    "standalone code review",
    "### 1. Correctness and Regression Risk",
    "### 2. Design Compliance",
    "### 3. Test Quality",
    "### 4. Simplicity, Reuse, and Maintainability",
    "initial operation is read-only",
    "create or update a `review.md` artifact",
    "stable ID",
    "only a subsequent Review reassessment may change status to `RESOLVED`",
    "Review is the only authority for changing finding status",
    "cannot actually be invoked",
    "distinguish completion-blocking findings from non-blocking improvements",
    "Keep the report concise",
    "`PASS` - No material issues",
    "`FINDINGS` - One or more evidence-backed issues",
    "`INCOMPLETE REVIEW` - The evidence available",
    "`BLOCKER`",
    "`HIGH`",
    "`MEDIUM`",
    "`LOW`",
  ]) {
    assert.ok(skill.includes(phrase), `Review skill is missing: ${phrase}`);
  }
});

test("Implement skill uses open review findings as authoritative remediation", () => {
  for (const skillPath of ["skills/speckit-implement/SKILL.md", ".github/skills/speckit-implement/SKILL.md"]) {
    const skill = fs.readFileSync(path.join(packageRoot, skillPath), "utf8");

    for (const phrase of ["review.md", "authoritative remediation list", "OPEN", "must not change finding status", "subsequent Review reassessment with current evidence"]) {
      assert.ok(skill.includes(phrase), `${skillPath} is missing: ${phrase}`);
    }
  }
});

test("Implement records concrete Review remediation tasks before implementation", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-implement/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "## Review Remediation",
    "before performing any remediation work",
    "inspect the current implementation",
    "derive the minimum concrete work",
    "highest existing task ID",
    "sequential task ID",
    "[Rxxx]",
    "existing checkbox convention",
    "exact target path",
    "genuinely separate, independently useful",
    "Do not mechanically create generic fix, test, validate, review, or completion tasks",
  ]) {
    assert.ok(skill.includes(phrase.toLowerCase()), `Implement skill is missing remediation task rule: ${phrase}`);
  }
});

test("Implement resumes remediation without duplicating completed work", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-implement/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "reuse suitable incomplete associated tasks",
    "if associated tasks are complete while the finding remains open, reassess the current implementation",
    "add new ids only for genuinely additional work",
    "do not reopen completed tasks",
    "if an associated task no longer matches",
    "do not perform unrecorded remediation",
    "leave failed, blocked, or unfinished tasks unchecked",
    "for each finding, report created task ids or none",
    "reused task ids or none",
    "if reassessment finds no additional work",
    "state that no task was added",
  ]) {
    assert.ok(skill.includes(phrase), `Implement skill is missing remediation resume rule: ${phrase}`);
  }
});

test("Review remediation preserves severity selection and stage ownership", () => {
  const implement = fs.readFileSync(path.join(packageRoot, "skills/speckit-implement/SKILL.md"), "utf8").toLowerCase();
  const tasks = fs.readFileSync(path.join(packageRoot, "skills/speckit-tasks/SKILL.md"), "utf8").toLowerCase();
  const review = fs.readFileSync(path.join(packageRoot, "skills/speckit-review/SKILL.md"), "utf8").toLowerCase();
  const workflow = fs.readFileSync(path.join(packageRoot, "docs/workflow.md"), "utf8").toLowerCase();
  const readme = fs.readFileSync(path.join(packageRoot, "README.md"), "utf8").toLowerCase();

  const contracts = [
    [implement, ["automatically address open `blocker` and `high` findings", "only when the user explicitly requests them", "if no eligible findings exist"]],
    [tasks, ["tasks creates the original implementation plan", "implement may append review-remediation work"]],
    [review, ["review remains read-only with respect to `tasks.md`", "task completion does not transition finding status"]],
    [`${workflow}\n${readme}`, ["implement -> converge -> review"]],
  ];

  for (const [source, phrases] of contracts) {
    for (const phrase of phrases) {
      assert.ok(source.includes(phrase), `Workflow guidance is missing ownership rule: ${phrase}`);
    }
  }
});

test("Implement preserves task attribution across multiple open findings", () => {
  for (const skillPath of ["skills/speckit-implement/SKILL.md", ".github/skills/speckit-implement/SKILL.md"]) {
    const skill = fs.readFileSync(path.join(packageRoot, skillPath), "utf8").toLowerCase();

    for (const phrase of [
      "when multiple findings are eligible, assess each independently",
      "tasks for r001 must include `[r001]`",
      "tasks for r002 must include `[r002]`",
      "every remediation task contains its unchanged originating finding id",
    ]) {
      assert.ok(skill.includes(phrase), `${skillPath} is missing multi-finding attribution rule: ${phrase}`);
    }
  }
});
