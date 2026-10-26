import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { classifyFile, detectProject } from "../src/detect.js";
import { runtimeCapabilityStatus } from "../src/integrations.js";

function temp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "bsk-test-"));
}
function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

test("detects Spec Kit and Better Spec Kit metadata", () => {
  const p = temp();
  fs.mkdirSync(path.join(p, ".specify"), { recursive: true });
  write(path.join(p, ".specify", "better-spec-kit.json"), "{}");
  assert.equal(detectProject(p).specKit, true);
  assert.equal(detectProject(p).betterSpecKit, true);
});

test("runtime capability detection reports root browser signals without traversing workspaces", () => {
  const p = temp();
  write(path.join(p, "playwright.config.ts"), "export default {};");
  write(
    path.join(p, "package.json"),
    JSON.stringify({
      devDependencies: { "@playwright/test": "1.0.0", cypress: "1.0.0" },
    }),
  );
  write(path.join(p, "apps", "nested", "cypress.config.js"), "module.exports = {};");

  const status = runtimeCapabilityStatus(p);
  assert.deepEqual(status.projectSignals, ["Playwright config", "Playwright dependency", "Cypress dependency"]);
  assert.deepEqual(status.unknownSignals, []);
  assert.equal(status.hostSession, "UNKNOWN");
});

test("runtime capability detection reports nested-only config as no root signal", () => {
  const p = temp();
  write(path.join(p, "apps", "nested", "cypress.config.js"), "module.exports = {};");

  const status = runtimeCapabilityStatus(p);
  assert.deepEqual(status.projectSignals, []);
  assert.deepEqual(status.unknownSignals, []);
});

test("runtime capability detection reports an unreadable manifest as unknown rather than failing", () => {
  const p = temp();
  write(path.join(p, "package.json"), "{");

  const status = runtimeCapabilityStatus(p);
  assert.deepEqual(status.projectSignals, []);
  assert.deepEqual(status.unknownSignals, ["package.json could not be parsed"]);
  assert.equal(status.hostSession, "UNKNOWN");
});

test("new destination is classified new", () => {
  const p = temp(),
    pkg = temp();
  write(path.join(pkg, "x"), "new");
  assert.equal(classifyFile(p, pkg, "x", ".github/skills/speckit-plan/SKILL.md"), "new");
});

test("unknown managed content requires review", () => {
  const p = temp(),
    pkg = temp();
  write(path.join(pkg, "x"), "new");
  write(path.join(p, ".github/skills/speckit-plan/SKILL.md"), "my completely custom workflow");
  assert.equal(classifyFile(p, pkg, "x", ".github/skills/speckit-plan/SKILL.md"), "custom");
});

test("upstream-looking skill is still treated as custom without a verified checksum", () => {
  const p = temp(),
    pkg = temp();
  write(path.join(pkg, "x"), "new");
  write(path.join(p, ".github/skills/speckit-plan/SKILL.md"), "---\nname: speckit-plan\ndescription: Spec Kit planning\n---\n");
  assert.equal(classifyFile(p, pkg, "x", ".github/skills/speckit-plan/SKILL.md"), "custom");
});
