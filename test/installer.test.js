import test from "node:test";
import assert from "node:assert/strict";
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
  assert.equal(result.changed, 5);
  assert.equal(fs.readFileSync(path.join(p, ".github/skills/speckit-review/SKILL.md"), "utf8"), fs.readFileSync(path.join(packageRoot, "skills/speckit-review/SKILL.md"), "utf8"));
  assert.equal(fs.readFileSync(path.join(p, ".specify/memory/constitution.md"), "utf8"), "custom constitution");
  assert.equal(JSON.parse(fs.readFileSync(path.join(p, ".specify/better-spec-kit.json"), "utf8")).version, "0.4.0");
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
  assert.equal(review.classification, "new");
  const result = install({ project: p, packageRoot, plan, version: "0.5.0" });

  assert.equal(result.changed, 1);
  assert.equal(fs.readFileSync(path.join(p, review.destinationRel), "utf8"), fs.readFileSync(path.join(packageRoot, review.sourceRel), "utf8"));
});
test("customised managed file blocks installation without approval", () => {
  const p = project(),
    f = path.join(p, ".github/skills/speckit-review/SKILL.md");
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, "customised");
  assert.throws(() => install({ project: p, packageRoot, plan: buildPlan(p, packageRoot), version: "0.4.0" }), /approval/);
  assert.equal(fs.readFileSync(f, "utf8"), "customised");
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
