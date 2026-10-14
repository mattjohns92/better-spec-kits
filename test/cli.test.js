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
  assert.ok(review.includes("review pass") && review.includes("feature workflow is complete"), "Review PASS must state completion");
  assert.ok(review.includes("blocking findings") && review.includes("converge"), "Review findings must return through Converge");

  for (const [name, phrase] of [
    ["analyze", "/speckit.remediate"],
    ["design", "next recommended step: /speckit-plan"],
    ["plan", "/speckit-tasks"],
    ["tasks", "/speckit.analyze"],
    ["implement", "/speckit.converge"],
    ["review", "feature workflow is complete"],
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
  assert.match(readme, /speckit\.remediate/);
  assert.match(readme, /status.*analyze\/remediate\/review skills/);
  assert.match(workflow, /analyze returns \*{0,2}pass[\s\S]*implement/);
  assert.match(workflow, /blocking findings[\s\S]*remediate[\s\S]*analyze/);
  assert.match(installation, /canonical skills to `\.github\/skills\//);
  assert.match(installation, /speckit-remediate/);
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
