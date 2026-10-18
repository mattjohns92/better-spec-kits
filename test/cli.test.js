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

test("Remediate skill preserves Analyze ownership and routes blocking findings", () => {
  const skillPath = path.join(packageRoot, "skills/speckit-remediate/SKILL.md");
  assert.ok(fs.existsSync(skillPath), "canonical Remediate skill is missing");
  const skill = fs.readFileSync(skillPath, "utf8").toLowerCase();

  for (const phrase of [
    "/speckit.remediate",
    "analysis.md",
    "blocker",
    "high",
    "medium",
    "low",
    "clarify",
    "design",
    "plan",
    "tasks",
    "batch",
    "dependency order",
    "downstream impact",
    "do not create, edit, delete, renumber, resolve, or reprioritize",
    "no applicable blocking findings exist",
    "/speckit.analyze",
  ]) {
    assert.ok(skill.includes(phrase), `Remediate skill is missing: ${phrase}`);
  }
});

test("Remediate skill stops safely on stale evidence, unresolved decisions, and partial failure", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-remediate/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "materially changed after the recorded analyze run",
    "do not apply obsolete remediation",
    "cannot be inferred unambiguously",
    "pause at the responsible stage",
    "continue the same route only where the host supports continuation",
    "stop before making that stage's changes",
    "preserve correct completed work",
    "stages completed and remaining",
    "never claim full remediation when work remains",
    "only analyze owns `analysis.md`",
  ]) {
    assert.ok(skill.includes(phrase), `Remediate skill is missing safety guidance: ${phrase}`);
  }
});

test("Remediate dogfood skill matches the canonical skill", () => {
  const canonicalPath = path.join(packageRoot, "skills/speckit-remediate/SKILL.md");
  const dogfoodPath = path.join(packageRoot, ".github/skills/speckit-remediate/SKILL.md");
  assert.ok(fs.existsSync(dogfoodPath), "Remediate dogfood skill is missing");
  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  assert.equal(normalizeLineEndings(fs.readFileSync(dogfoodPath, "utf8")), normalizeLineEndings(fs.readFileSync(canonicalPath, "utf8")));
});

test("Better Spec Kit skill completion guidance follows stage outcomes", () => {
  const skill = (name) => fs.readFileSync(path.join(packageRoot, `skills/speckit-${name}/SKILL.md`), "utf8").toLowerCase();
  const analyze = skill("analyze");
  const design = skill("design");
  const plan = skill("plan");
  const tasks = skill("tasks");
  const implement = skill("implement");
  const review = skill("review");

  for (const phrase of ["pass", "findings", "incomplete analysis", "/speckit.implement", "/speckit.remediate", "blocking findings"]) {
    assert.ok(analyze.includes(phrase), `Analyze guidance is missing: ${phrase}`);
  }
  assert.ok(design.includes("ui impact: none") && design.includes("/speckit-plan"), "Design NONE path must skip the artifact and recommend Plan");
  assert.ok(design.includes("next recommended step: /speckit-plan"), "Design completion must recommend Plan");
  assert.ok(design.includes("material ux questions remain unresolved"), "Design must not advance with material UX questions open");
  assert.ok(plan.includes("/speckit-tasks"), "Plan guidance is missing the Tasks handoff");
  assert.ok(tasks.includes("/speckit.analyze"), "Tasks guidance is missing the Analyze handoff");
  assert.ok(implement.includes("/speckit.converge"), "Implement guidance is missing the Converge handoff");
  assert.ok(review.includes("review pass") && review.includes("/speckit-summary"), "Review PASS must hand off to Summary");
  assert.ok(review.includes("blocking findings") && review.includes("converge"), "Review findings must return through Converge");

  for (const [name, phrase] of [
    ["analyze", "/speckit.remediate"],
    ["design", "next recommended step: /speckit-plan"],
    ["plan", "/speckit-tasks"],
    ["tasks", "/speckit.analyze"],
    ["implement", "/speckit.converge"],
    ["review", "/speckit-summary"],
  ]) {
    const dogfoodPath = path.join(packageRoot, `.github/skills/speckit-${name}/SKILL.md`);
    const dogfood = fs.readFileSync(dogfoodPath, "utf8").toLowerCase();
    assert.ok(dogfood.includes(phrase), `Dogfood ${name} skill is missing: ${phrase}`);
  }
});

test("Plan skill establishes an initial architecture baseline with explicit approval", () => {
  const plan = fs.readFileSync(path.join(packageRoot, "skills/speckit-plan/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "initial architecture baseline",
    "project purpose, requirements, known technology choices, relevant constraints, and expected complexity",
    "materially affects the recommendation",
    "proposed",
    "explicitly approves",
    "do not report an unapproved baseline as authoritative",
    "do not add a separate architecture stage or command",
  ]) {
    assert.ok(plan.includes(phrase), `Plan skill is missing initial baseline guidance: ${phrase}`);
  }
});

test("Plan skill preserves existing architecture authority and avoids restructuring", () => {
  const plan = fs.readFileSync(path.join(packageRoot, "skills/speckit-plan/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "inspect relevant existing architecture references",
    "keep that existing authority as the source of truth",
    "reference it rather than create a competing architecture document",
    "if architecture sources conflict",
    "stop and ask the user to identify the authority",
    "distinguish observed current structure from proposed recommendations",
    "require the user to explicitly approve changes before applying them",
    "do not move, rename, or rewrite application source files or directories",
  ]) {
    assert.ok(plan.includes(phrase), `Plan skill is missing existing-project authority guidance: ${phrase}`);
  }
});

test("Plan skill documents one approved architecture reference and stays in scope", () => {
  const canonicalPath = path.join(packageRoot, "skills/speckit-plan/SKILL.md");
  const dogfoodPath = path.join(packageRoot, ".github/skills/speckit-plan/SKILL.md");
  const canonical = fs.readFileSync(canonicalPath, "utf8");
  const dogfood = fs.readFileSync(dogfoodPath, "utf8");
  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  assert.equal(normalizeLineEndings(dogfood), normalizeLineEndings(canonical), "Plan dogfood skill must match the canonical skill");

  const plan = canonical.toLowerCase();
  for (const phrase of [
    "repository's established documentation convention",
    "architecture approach and rationale",
    "high-level structure, major responsibilities",
    "dependency boundaries and permitted directions",
    "file-placement and naming conventions",
    "testing conventions",
    "feature-introduction guidance",
    "justified exceptions",
    "evidence sources, assumptions, and unresolved limitations",
    "never include credentials, secrets, or sensitive values",
    "subsequent feature-workflow maintenance",
    "automated structural validation",
  ]) {
    assert.ok(plan.includes(phrase), `Plan skill is missing architecture-reference guidance: ${phrase}`);
  }
});

test("Scope skill classifies evidence-first and writes safe, durable handoffs", () => {
  const scopePath = path.join(packageRoot, "skills/speckit-scope/SKILL.md");
  const scope = fs.readFileSync(scopePath, "utf8").toLowerCase();

  for (const phrase of [
    "/speckit.scope",
    "before asking questions",
    "bug",
    "quick",
    "feature",
    "initiative",
    "arbitrary size proxies",
    "redact",
    "incomplete",
    "specs/.scope/",
    "brief.md",
    "exact next action",
  ]) {
    assert.ok(scope.includes(phrase), `Scope skill is missing: ${phrase}`);
  }
});

test("Feature Brief contract carries stable IDs, parent context, and exact directory", () => {
  const scope = fs.readFileSync(path.join(packageRoot, "skills/speckit-scope/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of ["f###", "non-reused", "brief.md", "parent_initiative", "dependencies", "feature_directory", "exact typed id", "ambiguous", "yaml front matter", "detailed specification"]) {
    assert.ok(scope.includes(phrase), `Feature Brief contract is missing: ${phrase}`);
  }
});

test("Quick skill follows a bounded quality loop and escalates material decisions", () => {
  const quickPath = path.join(packageRoot, "skills/speckit-quick/SKILL.md");
  const quick = fs.readFileSync(quickPath, "utf8").toLowerCase();

  for (const phrase of ["/speckit.quick q###", "understand", "implement", "validate", "relevant code", "established patterns", "smallest correct change", "tests", "truthful", "escalation"]) {
    assert.ok(quick.includes(phrase), `Quick skill is missing: ${phrase}`);
  }
});

test("Scope Bug handoffs separate provisioning from fresh-session consumption", () => {
  const scope = fs.readFileSync(path.join(packageRoot, "skills/speckit-scope/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of ["b###", "redact", "present-disabled", "partial", "b001 runtime gate", "installation does not prove", "unverified"]) {
    assert.ok(scope.includes(phrase), `Scope Bug handoff is missing: ${phrase}`);
  }
});

test("Scope owns stable Initiative evolution and feature-map status", () => {
  const scope = fs.readFileSync(path.join(packageRoot, "skills/speckit-scope/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of ["i###", "independently specifiable", "recommended starting feature", "canonical in the parent map", "splitting", "merging", "reordering", "superseding", "never change"]) {
    assert.ok(scope.includes(phrase), `Scope Initiative behavior is missing: ${phrase}`);
  }
});

test("Scope and Quick dogfood copies match canonical files", () => {
  const files = [
    ["skills/speckit-scope/SKILL.md", ".github/skills/speckit-scope/SKILL.md"],
    ["skills/speckit-quick/SKILL.md", ".github/skills/speckit-quick/SKILL.md"],
    ["instructions/scope-handoffs.instructions.md", ".github/instructions/scope-handoffs.instructions.md"],
  ];
  const normalize = (content) => content.replace(/\r\n/g, "\n").trimEnd();

  for (const [canonical, dogfood] of files) {
    assert.equal(normalize(fs.readFileSync(path.join(packageRoot, dogfood), "utf8")), normalize(fs.readFileSync(path.join(packageRoot, canonical), "utf8")), `${dogfood} is out of sync`);
  }
});

test("handoff instruction returns material boundary changes to Scope", () => {
  const instruction = fs.readFileSync(path.join(packageRoot, "instructions/scope-handoffs.instructions.md"), "utf8").toLowerCase();

  for (const phrase of ["material", "preserve the evidence", "stop", "return the decision to scope", "do not silently change scope-owned initiative structure"]) {
    assert.ok(instruction.includes(phrase), `Handoff instruction is missing: ${phrase}`);
  }
});

test("install preview lists Review and Analyze as ADD when they are absent", async () => {
  const directory = project();
  const output = await capture(["install", directory, "--yes"]);
  assert.match(output, /\+ ADD\s+\.github\/skills\/speckit-review\/SKILL\.md/);
  assert.match(output, /\+ ADD\s+\.github\/skills\/speckit-analyze\/SKILL\.md/);
  assert.match(output, /\+ ADD\s+\.github\/skills\/speckit-remediate\/SKILL\.md/);
  assert.match(output, /Ready: specify → clarify → design → plan → tasks → analyze → implement → converge → review/);
  assert.match(output, /Analyze is the normal final pre-implementation check/);
  assert.match(output, /Bug provisioning: partial success/);
  assert.ok(fs.existsSync(path.join(directory, ".github/skills/speckit-review/SKILL.md")), "Bug provisioning failure must not roll back Better Spec Kit files");
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

test("status reports missing, installed, and conflicting Remediate skills", async () => {
  const missingProject = project();
  assert.match(await capture(["status", missingProject]), /Remediate skill: missing/);

  const installedProject = project();
  const source = path.join(packageRoot, "skills/speckit-remediate/SKILL.md");
  const destination = path.join(installedProject, ".github/skills/speckit-remediate/SKILL.md");
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  assert.match(await capture(["status", installedProject]), /Remediate skill: installed/);

  const conflictingProject = project();
  const conflictingDestination = path.join(conflictingProject, ".github/skills/speckit-remediate/SKILL.md");
  fs.mkdirSync(path.dirname(conflictingDestination), { recursive: true });
  fs.writeFileSync(conflictingDestination, "custom Remediate workflow");
  assert.match(await capture(["status", conflictingProject]), /Remediate skill: needs review/);
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

test("status reports Scope, Quick, handoff instruction, and Bug provisioning state", async () => {
  const missingProject = project();
  const missing = await capture(["status", missingProject]);
  assert.match(missing, /Scope skill: missing/);
  assert.match(missing, /Quick skill: missing/);
  assert.match(missing, /Scope handoff instruction: missing/);
  assert.match(missing, /Bug provisioning: partial/);

  const installedProject = project();
  for (const [source, destination] of [
    ["skills/speckit-scope/SKILL.md", ".github/skills/speckit-scope/SKILL.md"],
    ["skills/speckit-quick/SKILL.md", ".github/skills/speckit-quick/SKILL.md"],
    ["instructions/scope-handoffs.instructions.md", ".github/instructions/scope-handoffs.instructions.md"],
  ]) {
    const target = path.join(installedProject, destination);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(packageRoot, source), target);
  }
  const installed = await capture(["status", installedProject]);
  assert.match(installed, /Scope skill: installed/);
  assert.match(installed, /Quick skill: installed/);
  assert.match(installed, /Scope handoff instruction: installed/);

  fs.writeFileSync(path.join(installedProject, ".github/instructions/scope-handoffs.instructions.md"), "custom instruction");
  assert.match(await capture(["status", installedProject]), /Scope handoff instruction: needs review/);
});

test("doctor reports missing Scope and Quick managed assets", async () => {
  const output = await capture(["doctor", project()]);
  assert.match(output, /Scope skill is missing/);
  assert.match(output, /Quick skill is missing/);
  assert.match(output, /Scope handoff instruction is missing/);
});

test("workflow and installation docs explain Scope entry and upstream Bug provisioning", () => {
  const readme = fs.readFileSync(path.join(packageRoot, "README.md"), "utf8").toLowerCase();
  const workflow = fs.readFileSync(path.join(packageRoot, "docs/workflow.md"), "utf8").toLowerCase();
  const installation = fs.readFileSync(path.join(packageRoot, "docs/installation.md"), "utf8").toLowerCase();
  const integrations = fs.readFileSync(path.join(packageRoot, "docs/integrations.md"), "utf8").toLowerCase();

  for (const phrase of ["/speckit.scope", "bug", "quick", "feature", "initiative", "optional"]) {
    assert.ok(`${readme}\n${workflow}`.includes(phrase), `Workflow documentation is missing: ${phrase}`);
  }
  for (const phrase of ["specify extension add bug", "partial success", "never passes `--force`", "automatically updates an existing bug extension", "runtime handoff"]) {
    assert.ok(`${installation}\n${integrations}`.includes(phrase), `Installation documentation is missing: ${phrase}`);
  }
  assert.match(`${installation}\n${integrations}`, /installation.{0,80}not.{0,40}runtime/i);
});

test("doctor flags a missing Review skill in an installed project", async () => {
  const output = await capture(["doctor", project()]);
  assert.match(output, /Review skill is missing/);
});

test("doctor flags missing and conflicting Remediate skills in an installed project", async () => {
  assert.match(await capture(["doctor", project()]), /Remediate skill is missing/);

  const conflictingProject = project();
  const destination = path.join(conflictingProject, ".github/skills/speckit-remediate/SKILL.md");
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, "custom Remediate workflow");
  assert.match(await capture(["doctor", conflictingProject]), /Remediate skill needs manual review/);
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
  const dogfoodConstitutionPath = path.join(packageRoot, ".specify/memory/constitution.md");
  const dogfoodConstitution = fs.existsSync(dogfoodConstitutionPath) ? fs.readFileSync(dogfoodConstitutionPath, "utf8").toLowerCase() : null;
  const reviewSkills = [
    fs.readFileSync(path.join(packageRoot, "skills/speckit-review/SKILL.md"), "utf8").toLowerCase(),
    fs.readFileSync(path.join(packageRoot, ".github/skills/speckit-review/SKILL.md"), "utf8").toLowerCase(),
  ];

  const workflowChecks = [["README", readme], ["workflow", workflow], ["constitution", constitution], ...(dogfoodConstitution ? [["dogfood constitution", dogfoodConstitution]] : [])];

  for (const [name, content] of workflowChecks) {
    assert.ok(content.includes(sequence), `${name} is missing the recommended Analyze workflow`);
  }
  assert.match(workflow, /analyze is the normal final pre-implementation gate/);
  assert.match(workflow, /blocking findings/);
  assert.match(workflow, /review `pass`[\s\S]*speckit-summary/);
  assert.match(workflow, /summary is available at any workflow stage as a descriptive as-of account/);
  assert.match(workflow, /review `pass` is required only for final completion or acceptance claims/);
  assert.match(workflow, /copilot skill discovery does not guarantee automatic skill-to-skill invocation/);
  assert.match(readme, /speckit\.remediate/);
  assert.match(readme, /status.*analyze\/remediate\/review skills/);
  assert.match(workflow, /analyze returns \*{0,2}pass[\s\S]*implement/);
  assert.match(workflow, /blocking findings[\s\S]*remediate[\s\S]*analyze/);
  assert.match(installation, /canonical skills to `\.github\/skills\//);
  assert.match(installation, /speckit-remediate/);
  assert.match(installation, /speckit-summary/);
  assert.match(installation, /summary is available at any workflow stage as a descriptive as-of account/);
  assert.match(installation, /review `pass` is required only for final completion or acceptance claims/);
  assert.match(installation, /install\.ps1[\s\S]*install\.sh/);
  assert.match(installation, /review returns a current `pass`[\s\S]*invoke `\/speckit-summary <feature-directory>` manually/);
  assert.match(installation, /backup/);
  assert.match(releasing, /skills\/speckit-analyze\/skill\.md/);
  assert.match(releasing, /skills\/speckit-remediate\/skill\.md/);
  const releaseVersionSteps = releasing.match(/^1\..*$/gm) ?? [];
  assert.equal(releaseVersionSteps.length, 1, "release guide should have one version synchronization step");
  assert.ok(releaseVersionSteps[0].includes("`version`, `package.json`, and `package-lock.json`"));
  assert.match(integrations, /analyze skill/);
  assert.match(integrations, /speckit\.remediate/);
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

test("Analyze skill traces original intent and investigates broad change surfaces", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-analyze/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "scope feature brief",
    "original user request",
    "confirmed scope-owned intent",
    "later artifacts repeating a requirement do not, by repetition alone, establish its origin or user approval",
    "inspect relevant current project behavior",
    "minimum-solution",
    "change-surface",
    "existing mechanism was insufficient",
    "feature-local",
    "breadth is evidence to investigate, not proof of over-engineering",
    "do not use file, line, task, service, component, or complexity-score thresholds",
    "size alone must not prevent pass",
  ]) {
    assert.ok(skill.includes(phrase), `Analyze skill is missing intent/change-surface guidance: ${phrase}`);
  }
});

test("Analyze distinguishes necessary complexity from optional expansion requiring a decision", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-analyze/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "necessary complexity",
    "unnecessary complexity",
    "potentially valuable but optional expansion",
    "keep it and record concise evidence in analysis context",
    "**material decisions retained:**",
    "**decision required:** yes",
    "**category:** scope expansion",
    "**original intent:**",
    "**proposed expansion:**",
    "**challenge:**",
    "**simpler alternative:**",
    "**benefit:**",
    "**cost/complexity:**",
    "**decision requested:**",
    "keep the improvement, simplify to the agreed outcome, or defer it",
    "an unresolved material user decision is blocking",
  ]) {
    assert.ok(skill.includes(phrase), `Analyze skill is missing earned-complexity guidance: ${phrase}`);
  }
});

test("Analyze recognizes settled decisions and returns Scope-boundary changes safely", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-analyze/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "recognize explicit, applicable decisions already recorded in authoritative artifacts",
    "do not repeat the same challenge",
    "do not generalize an approval to materially different work",
    "if the choice changes a scope-owned boundary",
    "use the existing `clarify` route for the scope/intent uncertainty",
    "resolution direction",
    "stop before downstream edits and return the decision to scope",
    "do not change the scope record or add a `scope` route",
    "only this analyze run may move an open finding to resolved",
  ]) {
    assert.ok(skill.includes(phrase), `Analyze skill is missing decision-ownership guidance: ${phrase}`);
  }
});

test("Analyze proportionality preserves finding ownership and runtime evidence boundaries", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-analyze/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "do not create a parallel finding ledger",
    "a new workflow stage",
    "only file created or changed by analyze is the active feature's `analysis.md`",
    "only this analyze run may move an open finding to resolved",
    "static contract assertions cover repository-owned behavior only",
    "they do not prove external agent behavior",
  ]) {
    assert.ok(skill.includes(phrase), `Analyze skill is missing existing ownership/runtime safeguards: ${phrase}`);
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

test("Preview skill explains a derived proposal separately from intent and delivered reality", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-preview/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "/speckit.preview",
    "original goal",
    "current proposed implementation",
    "plain english",
    "significant supporting work",
    "do not reproduce the tasks ledger",
    "derived and non-authoritative",
    "re-read the current applicable",
    "must not modify its source artifacts",
    "if satisfied, run `/speckit.implement`",
    "if a change is wanted, tell better spec kit what should change",
    "do not assume what the user dislikes",
    "do not offer a routing catalogue",
  ]) {
    assert.ok(skill.includes(phrase), `Preview skill contract is missing: ${phrase}`);
  }
  assert.match(skill, /separate feature-local `implementation-preview\.md`/);
  assert.doesNotMatch(skill, /append .*implementation-preview.*`brief\.md`/);
  assert.doesNotMatch(skill, /merge .*implementation-preview.*`summary\.md`/);
});

test("Preview resolves existing features and regenerates from current sources", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-preview/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "use an explicitly provided feature directory",
    "existing spec kit active-feature context",
    "if no unique feature can be identified, ask",
    "do not guess from title, recency, or branch name",
    "do not require `tasks.md`",
    "re-read the current applicable sources on every invocation",
    "a saved preview is not evidence that it remains current",
    "regenerate it from the current sources when invoked",
    "do not add hashes, version tracking, dependency graphs, or cache invalidation",
    "materially contradictory",
    "identify that limitation in plain language",
  ]) {
    assert.ok(skill.includes(phrase), `Preview resolution/freshness contract is missing: ${phrase}`);
  }
});

test("Project Status summarizes Initiatives and resolves focused targets exactly", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-status/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "a focused view is optional",
    "exact feature or initiative id",
    "resolves uniquely",
    "never resolve by title, recency, partial id, branch name, or directory order",
    "read initiative child maps",
    "include planned child features even when no feature directory exists yet",
    "initiative records own their existing decomposition and parent-map status",
    "report a completion count or next child only when the mapped child set and its evidence support that conclusion",
    "do not create a new dependency plan",
    "focused view is optional",
  ]) {
    assert.ok(skill.includes(phrase), `Project Status Initiative/focus contract is missing: ${phrase}`);
  }
});

test("Project Status surfaces blockers and uncertainty without changing source artifacts", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-status/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "label current completion blockers only where an authoritative artifact says they are required",
    "explicitly deferred future work is not a current blocker",
    "do not scan arbitrary implementation files for todo comments",
    "report duplicate ids and path conflicts",
    "report parent/child conflicts without changing either source",
    "do not assume an old directory is abandoned or superseded based on age or inactivity",
    "unknown or contradictory work",
    "required manual or supported-agent acceptance is pending, failed, missing, or unverifiable",
    "do not resolve or reinterpret them",
    "status reads existing project evidence and returns a report only",
    "does not create, modify, check off, resolve, repair, or delete project artifacts",
    "status registry, cache, database, task ledger, or saved report",
  ]) {
    assert.ok(skill.includes(phrase), `Project Status blocker/uncertainty contract is missing: ${phrase}`);
  }
});

test("Project Status skill respects stage outcomes and recommends evidence-based next actions", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-status/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "read the explicit outcome and current finding statuses in `analysis.md`",
    "`findings` with open blocking findings requires the established analyze remediation route",
    "incomplete analysis",
    "checked tasks do not prove review pass or completion",
    "summary is a descriptive as-of account",
    "existing `review.md` is not proof of pass",
    "report complete only when current, unambiguous review pass",
    "required manual or supported-agent acceptance is pending",
    "if analyze pass is current and implementation is not evidenced, recommend implementation",
    "if review has open blocking findings, recommend the established review remediation workflow",
    "recommend a slash-command spelling only when the active integration exposes",
    "status must not execute the recommended workflow",
  ]) {
    assert.ok(skill.includes(phrase), `Project Status evidence/recommendation contract is missing: ${phrase}`);
  }
});

test("Project Status skill is project-first, evidence-based, and read-only", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-status/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "/speckit.status",
    "project-level overview",
    "without requiring a feature or initiative id",
    "specs/nnn-<slug>/",
    "specs/.scope/",
    "needs attention",
    "in progress / ready",
    "planned",
    "complete",
    "evidence reference",
    "no relevant work was found",
    "read-only invariant",
    "do not scan arbitrary implementation files for todo comments",
    "must not execute the recommended workflow",
    "better-spec-kit status",
    "installation and integration diagnostics",
  ]) {
    assert.ok(skill.includes(phrase), `Project Status contract is missing: ${phrase}`);
  }
});

test("CLI status remains installation diagnostics rather than project lifecycle status", async () => {
  const output = await capture(["status", project()]);
  assert.match(output, /Review skill:/);
  assert.match(output, /Bug provisioning:/);
  assert.doesNotMatch(output, /PROJECT STATUS|Feature 0\d\d|Needs Attention/);
});

test("Analyze recommends optional Preview when useful and preserves direct Implement", () => {
  const canonical = fs.readFileSync(path.join(packageRoot, "skills/speckit-analyze/SKILL.md"), "utf8").toLowerCase();
  const dogfood = fs.readFileSync(path.join(packageRoot, ".github/skills/speckit-analyze/SKILL.md"), "utf8");
  const readme = fs.readFileSync(path.join(packageRoot, "README.md"), "utf8").toLowerCase();
  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();

  for (const phrase of [
    "where a human-readable overview would materially help",
    "`/speckit.preview`",
    "where the feature is sufficiently simple",
    "`/speckit.implement`",
    "preview remains optional",
    "do not use arbitrary thresholds",
    "/speckit.remediate",
    "incomplete analysis",
  ]) {
    assert.ok(canonical.includes(phrase), `Analyze Preview handoff is missing: ${phrase}`);
  }
  assert.equal(normalizeLineEndings(dogfood), normalizeLineEndings(fs.readFileSync(path.join(packageRoot, "skills/speckit-analyze/SKILL.md"), "utf8")));
  assert.ok(readme.includes("analyze may recommend `/speckit.preview`"), "README must describe the optional Preview recommendation");
  assert.ok(readme.includes("preview remains optional"), "README must keep Preview optional");
  assert.ok(readme.includes("straightforward proposals"), "README must preserve the direct Implement path for straightforward work");
});

test("Summary skill is feature-local, evidence-grounded, and non-authoritative", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-summary/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "if no unique feature can be identified",
    "current, unambiguous review `pass`",
    "summary is available at any workflow stage",
    "descriptive as-of account",
    "review `pass` is required only for final completion or acceptance claims",
    "missing, incomplete, ambiguous, stale, or not `pass`",
    "continue producing a descriptive summary",
    "report the current workflow stage and review status",
    "inspect the delivered implementation",
    "prefer evidence of delivered behavior over planned work",
    "concise implementation overview",
    "architectural meaning over file lists",
    "material decisions",
    "deviations",
    "verification evidence",
    "report uncertainty",
    "omit empty or immaterial sections",
    "fresh session",
    "descriptive historical context",
    "not an authority over current source code",
  ]) {
    assert.ok(skill.includes(phrase), `Summary skill is missing: ${phrase}`);
  }
});

test("Review permits descriptive Summary at any stage and preserves remediation outcomes", () => {
  const skill = fs.readFileSync(path.join(packageRoot, "skills/speckit-review/SKILL.md"), "utf8").toLowerCase();

  for (const phrase of [
    "summary is available at any workflow stage",
    "only the final completion handoff is pass-gated",
    "descriptive as-of account",
    "after review `pass`",
    "recommend `/speckit-summary` as the explicit handoff",
    "do not claim that summary was invoked or written",
    "blocking findings",
    "recommend `/speckit.implement` for implementation remediation, followed by converge and another review",
    "for non-pass or incomplete outcomes",
    "do not recommend or claim a final completed summary",
    "`incomplete review`",
    "non-pass or incomplete outcomes",
  ]) {
    assert.ok(skill.includes(phrase), `Review handoff is missing: ${phrase}`);
  }
});

test("Review dogfood skill matches the canonical Summary handoff", () => {
  const canonicalPath = path.join(packageRoot, "skills/speckit-review/SKILL.md");
  const dogfoodPath = path.join(packageRoot, ".github/skills/speckit-review/SKILL.md");
  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  const canonical = normalizeLineEndings(fs.readFileSync(canonicalPath, "utf8"));
  const dogfood = normalizeLineEndings(fs.readFileSync(dogfoodPath, "utf8"));

  assert.ok(canonical.includes("/speckit-summary"), "Canonical Review handoff must recommend Summary");
  assert.equal(dogfood, canonical, "Review dogfood skill must match the canonical skill");
});

test("Summary dogfood skill matches the canonical skill", () => {
  const canonicalPath = path.join(packageRoot, "skills/speckit-summary/SKILL.md");
  const dogfoodPath = path.join(packageRoot, ".github/skills/speckit-summary/SKILL.md");
  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();

  assert.ok(fs.existsSync(dogfoodPath), "Summary dogfood skill is missing");
  assert.equal(normalizeLineEndings(fs.readFileSync(dogfoodPath, "utf8")), normalizeLineEndings(fs.readFileSync(canonicalPath, "utf8")), "Summary dogfood skill must match the canonical skill");
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

test("Implement assesses execution mode from approved evidence and preserves continuous choice", () => {
  const canonicalPath = path.join(packageRoot, "skills/speckit-implement/SKILL.md");
  const dogfoodPath = path.join(packageRoot, ".github/skills/speckit-implement/SKILL.md");
  const canonical = fs.readFileSync(canonicalPath, "utf8");
  const dogfood = fs.readFileSync(dogfoodPath, "utf8");
  const skill = canonical.toLowerCase();

  for (const phrase of [
    "before substantial implementation",
    "approved `spec.md`, applicable `design.md`, `plan.md`, `tasks.md`",
    "analyze result in `analysis.md`",
    "meaningful intermediate validation boundaries",
    "independently valuable outcomes, coupling, risk, dependencies, and validation value",
    "do not use arbitrary numeric thresholds",
    "task, story, file, or line counts",
    "recommend `continuous` or `incremental`",
    "present both modes as valid choices",
    "explicitly established active-feature mode",
    "honor it without asking for it again",
    "remains first-class",
    "without artificial checkpoints",
  ]) {
    assert.ok(skill.includes(phrase), `Implement mode guidance is missing: ${phrase}`);
  }

  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  assert.equal(normalizeLineEndings(dogfood), normalizeLineEndings(canonical), "Implement dogfood skill must match the canonical skill");
});

test("Implement validates meaningful increments and reports concise checkpoints", () => {
  const canonical = fs.readFileSync(path.join(packageRoot, "skills/speckit-implement/SKILL.md"), "utf8").toLowerCase();
  const dogfood = fs.readFileSync(path.join(packageRoot, ".github/skills/speckit-implement/SKILL.md"), "utf8");

  for (const phrase of [
    "meaningful task/outcome boundaries",
    "do not assume every user story is a separate increment",
    "complete only the current agreed increment",
    "focused validation appropriate to the increment",
    "do not begin later work that materially depends on an unresolved checkpoint",
    "delivered behavior",
    "outcome satisfied",
    "validation actually performed",
    "suggested user verification",
    "remaining work",
    "expected next increment",
    "do not require manual user approval when automated evidence is sufficient",
  ]) {
    assert.ok(canonical.includes(phrase), `Implement checkpoint guidance is missing: ${phrase}`);
  }

  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  assert.equal(
    normalizeLineEndings(dogfood),
    normalizeLineEndings(fs.readFileSync(path.join(packageRoot, "skills/speckit-implement/SKILL.md"), "utf8")),
    "Implement dogfood skill must match the canonical skill",
  );
});

test("Implement resumes from durable task state and Tasks preserves its ownership", () => {
  const implement = fs.readFileSync(path.join(packageRoot, "skills/speckit-implement/SKILL.md"), "utf8").toLowerCase();
  const implementDogfood = fs.readFileSync(path.join(packageRoot, ".github/skills/speckit-implement/SKILL.md"), "utf8");
  const tasks = fs.readFileSync(path.join(packageRoot, "skills/speckit-tasks/SKILL.md"), "utf8").toLowerCase();
  const tasksDogfood = fs.readFileSync(path.join(packageRoot, ".github/skills/speckit-tasks/SKILL.md"), "utf8");

  for (const phrase of [
    "one implement-owned `## implement state` block",
    "current increment",
    "last validated increment",
    "validation state",
    "user-verification state/request",
    "next action",
    "task checkboxes remain the sole task-completion truth",
    "on a fresh session",
    "conversation memory",
    "state is missing or conflicting",
    "do not infer user approval",
    "remove or mark it complete when implementation completes",
  ]) {
    assert.ok(implement.includes(phrase), `Implement resume guidance is missing: ${phrase}`);
  }

  for (const phrase of ["preserve the implement-owned `## implement state` block unchanged", "flag it for reconciliation", "tasks does not interpret, update, or silently discard that state"]) {
    assert.ok(tasks.includes(phrase), `Tasks regeneration guidance is missing: ${phrase}`);
  }

  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  assert.equal(
    normalizeLineEndings(implementDogfood),
    normalizeLineEndings(fs.readFileSync(path.join(packageRoot, "skills/speckit-implement/SKILL.md"), "utf8")),
    "Implement dogfood skill must match the canonical skill",
  );
  assert.equal(
    normalizeLineEndings(tasksDogfood),
    normalizeLineEndings(fs.readFileSync(path.join(packageRoot, "skills/speckit-tasks/SKILL.md"), "utf8")),
    "Tasks dogfood skill must match the canonical skill",
  );
});

test("Implement routes feedback by materiality and preserves lifecycle ownership", () => {
  const implement = fs.readFileSync(path.join(packageRoot, "skills/speckit-implement/SKILL.md"), "utf8").toLowerCase();
  const implementDogfood = fs.readFileSync(path.join(packageRoot, ".github/skills/speckit-implement/SKILL.md"), "utf8");
  const workflow = fs.readFileSync(path.join(packageRoot, "docs/workflow.md"), "utf8").toLowerCase();

  for (const phrase of [
    "implementation corrections that fail approved behavior are fixed within the current increment",
    "minor in-scope adjustments",
    "when feedback materially changes authoritative requirements, approved design, plan, tasks, architecture, or feature boundary",
    "identify the existing decision owner only when such feedback actually occurs",
    "significant ui work may influence mode recommendations",
    "future dedicated interactive ui feedback workflow",
    "do not run analyze, converge, review, or summary as per-increment workflows",
    "feature-level converge",
    "independent review",
    "summary",
  ]) {
    assert.ok(implement.includes(phrase), `Implement ownership guidance is missing: ${phrase}`);
  }

  for (const phrase of ["adaptive execution happens inside implement", "checkpoints do not replace feature-level converge, review, or summary"]) {
    assert.ok(workflow.includes(phrase), `Workflow lifecycle guidance is missing: ${phrase}`);
  }

  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  assert.equal(
    normalizeLineEndings(implementDogfood),
    normalizeLineEndings(fs.readFileSync(path.join(packageRoot, "skills/speckit-implement/SKILL.md"), "utf8")),
    "Implement dogfood skill must match the canonical skill",
  );
});

test("Implement considers UI impact selectively for human feedback checkpoints", () => {
  const canonicalPath = path.join(packageRoot, "skills/speckit-implement/SKILL.md");
  const dogfoodPath = path.join(packageRoot, ".github/skills/speckit-implement/SKILL.md");
  const canonical = fs.readFileSync(canonicalPath, "utf8");
  const dogfood = fs.readFileSync(dogfoodPath, "utf8");
  const skill = canonical.toLowerCase();

  for (const phrase of [
    "### significant ui feedback checkpoints",
    "ui impact `none`",
    "ui impact `minor`",
    "ui impact `significant`",
    "actively consider",
    "meaningful human-judgement point",
    "coherent, usable experience",
    "could reasonably change substantial dependent ui work",
    "do not use arbitrary numeric thresholds",
    "file, component, task, line, or story counts",
    "do not automatically pause after every user story",
  ]) {
    assert.ok(skill.includes(phrase), `Implement UI checkpoint selection is missing: ${phrase}`);
  }

  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  assert.equal(normalizeLineEndings(dogfood), normalizeLineEndings(canonical), "Implement dogfood skill must match the canonical skill");
});

test("Implement presents validated UI checkpoints before dependent work", () => {
  const canonicalPath = path.join(packageRoot, "skills/speckit-implement/SKILL.md");
  const dogfoodPath = path.join(packageRoot, ".github/skills/speckit-implement/SKILL.md");
  const canonical = fs.readFileSync(canonicalPath, "utf8");
  const dogfood = fs.readFileSync(dogfoodPath, "utf8");
  const skill = canonical.toLowerCase();

  for (const phrase of [
    "run applicable safe automated validation",
    "before presenting a ui checkpoint",
    "report each relevant check as passed, failed, not run, or unavailable",
    "never claim a check passed unless it actually ran and passed",
    "do not present a known failing result as successfully validated",
    "ui checkpoint",
    "implemented:",
    "validation:",
    "if you're happy, tell me to continue.",
    "if you'd like anything changed, tell me what you'd like changed.",
    "do not predict what the user may dislike",
    "pause before substantial ui work that materially depends on the experience under review",
  ]) {
    assert.ok(skill.includes(phrase), `Implement UI checkpoint contract is missing: ${phrase}`);
  }

  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  assert.equal(normalizeLineEndings(dogfood), normalizeLineEndings(canonical), "Implement dogfood skill must match the canonical skill");
});

test("Implement addresses ordinary UI feedback within approved intent", () => {
  const canonicalPath = path.join(packageRoot, "skills/speckit-implement/SKILL.md");
  const dogfoodPath = path.join(packageRoot, ".github/skills/speckit-implement/SKILL.md");
  const canonical = fs.readFileSync(canonicalPath, "utf8");
  const dogfood = fs.readFileSync(dogfoodPath, "utf8");
  const skill = canonical.toLowerCase();

  for (const phrase of [
    "accept ordinary visual and interaction feedback in natural language",
    "remains consistent with approved requirements and design",
    "smallest suitable adjustment",
    "run applicable validation",
    "present the experience again only when another human judgement is useful",
    "do not create a new formal artifact or trivial task solely to record ordinary ui feedback",
    "do not route every subjective implementation adjustment back through the complete workflow",
  ]) {
    assert.ok(skill.includes(phrase), `Implement UI feedback guidance is missing: ${phrase}`);
  }

  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  assert.equal(normalizeLineEndings(dogfood), normalizeLineEndings(canonical), "Implement dogfood skill must match the canonical skill");
});

test("Implement routes material UI feedback to existing decision owners", () => {
  const canonicalPath = path.join(packageRoot, "skills/speckit-implement/SKILL.md");
  const dogfoodPath = path.join(packageRoot, ".github/skills/speckit-implement/SKILL.md");
  const canonical = fs.readFileSync(canonicalPath, "utf8");
  const dogfood = fs.readFileSync(dogfoodPath, "utf8");
  const skill = canonical.toLowerCase();

  for (const phrase of [
    "feedback materially changes authoritative requirements, approved design, plan, tasks, architecture, or feature boundary",
    "do not silently absorb it",
    "stop dependent work",
    "identify the existing decision owner only when such feedback actually occurs",
    "approved design remains authoritative",
    "does not authorize a silent redesign",
  ]) {
    assert.ok(skill.includes(phrase), `Implement material-feedback ownership is missing: ${phrase}`);
  }

  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  assert.equal(normalizeLineEndings(dogfood), normalizeLineEndings(canonical), "Implement dogfood skill must match the canonical skill");
});

test("Implement reuses verification state for UI feedback without inferring approval", () => {
  const canonicalPath = path.join(packageRoot, "skills/speckit-implement/SKILL.md");
  const dogfoodPath = path.join(packageRoot, ".github/skills/speckit-implement/SKILL.md");
  const canonical = fs.readFileSync(canonicalPath, "utf8");
  const dogfood = fs.readFileSync(dogfoodPath, "utf8");
  const skill = canonical.toLowerCase();

  for (const phrase of [
    "keep validation state distinct from user-verification state/request",
    "`continue without` only when the user explicitly chooses to proceed without optional review",
    "`failed` while a requested correction is outstanding",
    "after a requested in-scope adjustment is validated",
    "otherwise use `not needed` and continue",
    "do not infer user approval",
    "on a fresh session, reconcile a ui checkpoint against authoritative feature artifacts, tasks, and repository state",
    "a review response does not change automated validation, task completion, converge, review, or feature-completion status",
  ]) {
    assert.ok(skill.includes(phrase), `Implement UI resume-state contract is missing: ${phrase}`);
  }

  const normalizeLineEndings = (content) => content.replace(/\r\n/g, "\n").trimEnd();
  assert.equal(normalizeLineEndings(dogfood), normalizeLineEndings(canonical), "Implement dogfood skill must match the canonical skill");
});
