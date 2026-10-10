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
  assert.equal(result.changed, 4);
  assert.equal(fs.readFileSync(path.join(p, ".specify/memory/constitution.md"), "utf8"), "custom constitution");
  assert.equal(JSON.parse(fs.readFileSync(path.join(p, ".specify/better-spec-kit.json"), "utf8")).version, "0.4.0");
});
test("customised managed file blocks installation without approval", () => {
  const p = project(),
    f = path.join(p, ".github/skills/speckit-plan/SKILL.md");
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, "customised");
  assert.throws(() => install({ project: p, packageRoot, plan: buildPlan(p, packageRoot), version: "0.4.0" }), /approval/);
  assert.equal(fs.readFileSync(f, "utf8"), "customised");
});
test("approved overwrite creates external backup", () => {
  const p = project(),
    f = path.join(p, ".github/skills/speckit-plan/SKILL.md");
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, "customised");
  const result = install({ project: p, packageRoot, plan: buildPlan(p, packageRoot), version: "0.4.0", allowCustom: true });
  assert.ok(result.backupRoot);
  assert.equal(fs.readFileSync(path.join(result.backupRoot, ".github/skills/speckit-plan/SKILL.md"), "utf8"), "customised");
  assert.notEqual(fs.readFileSync(f, "utf8"), "customised");
});
