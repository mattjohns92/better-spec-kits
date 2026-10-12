import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { provisionBug } from "../src/bug-extension.js";

const officialManifest = [
  'schema_version: "1.0"',
  "extension:",
  "  id: bug",
  "  name: Bug Triage Workflow",
  "  version: 1.0.1",
  "  repository: https://github.com/github/spec-kit",
  "requires:",
  '  speckit_version: ">=0.9.0"',
  "provides:",
  "  commands:",
  "    - name: speckit.bug.assess",
  "      file: commands/speckit.bug.assess.md",
  "    - name: speckit.bug.fix",
  "      file: commands/speckit.bug.fix.md",
  "    - name: speckit.bug.test",
  "      file: commands/speckit.bug.test.md",
].join("\n");

const info = (state) => `Bug Triage Workflow (v1.0.1)\nID: bug\nRepository: https://github.com/github/spec-kit\n${state}`;

function project(manifest) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "bsk-bug-extension-"));
  fs.mkdirSync(path.join(directory, ".specify/extensions/bug"), { recursive: true });
  if (manifest !== undefined) {
    fs.writeFileSync(path.join(directory, ".specify/extensions/bug/extension.yml"), manifest);
  }
  return directory;
}

function commandRunner(directory, { state = "Not installed", addStatus = 0, commandCount = 3, infoStatus = 0 } = {}) {
  const calls = [];
  let currentState = state;
  const run = (args) => {
    calls.push(args);
    if (args[0] === "--version") return { status: 0, stdout: "specify 1.0.6", stderr: "" };
    if (args.join(" ") === "extension list") {
      if (currentState === "Not installed") return { status: 0, stdout: "No extensions installed.", stderr: "" };
      const status = /disabled/i.test(currentState) ? "Disabled" : "Enabled";
      return {
        status: 0,
        stdout: `Installed Extensions:\n\n  ✓ Bug Triage Workflow (v1.0.1)\n     bug\n     Commands: ${commandCount} | Hooks: 0 | Priority: 10 | Status: ${status}`,
        stderr: "",
      };
    }
    if (args.join(" ") === "extension info bug") return { status: infoStatus, stdout: info(currentState), stderr: infoStatus ? "catalog unavailable" : "" };
    if (args.join(" ") === "extension add bug") {
      if (addStatus === 0) {
        fs.writeFileSync(path.join(directory, ".specify/extensions/bug/extension.yml"), officialManifest);
        currentState = "Installed and enabled";
      }
      return { status: addStatus, stdout: "", stderr: addStatus ? "installation failed" : "installed" };
    }
    throw new Error(`Unexpected specify invocation: ${args.join(" ")}`);
  };
  return { calls, run };
}

test("provisions the official extension through native add without force", () => {
  const directory = project();
  const { calls, run } = commandRunner(directory);

  const result = provisionBug({ project: directory, runCommand: run });

  assert.equal(result.state, "provisioned");
  assert.ok(calls.some((args) => args.join(" ") === "extension add bug"));
  assert.ok(calls.every((args) => !args.includes("--force")));
  assert.ok(calls.every((args) => !args.some((value) => value === "update")));
  assert.ok(calls.every((args) => args.join(" ") !== "extension enable bug"));
});

test("leaves an official enabled extension unchanged", () => {
  const directory = project(officialManifest);
  const originalManifest = fs.readFileSync(path.join(directory, ".specify/extensions/bug/extension.yml"), "utf8");
  const { calls, run } = commandRunner(directory, { state: "Installed and enabled" });

  const result = provisionBug({ project: directory, runCommand: run });

  assert.equal(result.state, "present-enabled");
  assert.ok(calls.every((args) => args.join(" ") !== "extension add bug"));
  assert.ok(calls.every((args) => args.join(" ") !== "extension enable bug"));
  assert.ok(calls.every((args) => !args.some((value) => value === "update")));
  assert.equal(fs.readFileSync(path.join(directory, ".specify/extensions/bug/extension.yml"), "utf8"), originalManifest);
});

test("preserves an official disabled extension and reports it unavailable", () => {
  const directory = project(officialManifest);
  const { calls, run } = commandRunner(directory, { state: "Installed but disabled" });

  const result = provisionBug({ project: directory, runCommand: run });

  assert.equal(result.state, "present-disabled");
  assert.ok(calls.every((args) => args.join(" ") !== "extension add bug"));
  assert.ok(calls.every((args) => args.join(" ") !== "extension enable bug"));
});

test("does not replace a non-official extension using the bug ID", () => {
  const nonOfficial = officialManifest.replace("https://github.com/github/spec-kit", "https://example.com/other/bug");
  const directory = project(nonOfficial);
  const { calls, run } = commandRunner(directory, { state: "Installed and enabled" });

  const result = provisionBug({ project: directory, runCommand: run });

  assert.equal(result.state, "partial");
  assert.ok(calls.every((args) => args.join(" ") !== "extension add bug"));
});

test("reports missing or incompatible Spec Kit without attempting installation", () => {
  const directory = project();
  const missing = commandRunner(directory);
  missing.run = () => ({ status: 127, stdout: "", stderr: "specify not found" });
  assert.equal(provisionBug({ project: directory, runCommand: missing.run }).state, "partial");

  const incompatible = commandRunner(directory);
  incompatible.run = (args) => (args[0] === "--version" ? { status: 0, stdout: "specify 0.8.9", stderr: "" } : { status: 0, stdout: info("Not installed"), stderr: "" });
  const result = provisionBug({ project: directory, runCommand: incompatible.run });
  assert.equal(result.state, "partial");
});

test("reports native installation failure as partial success", () => {
  const directory = project();
  const { calls, run } = commandRunner(directory, { addStatus: 1 });

  const result = provisionBug({ project: directory, runCommand: run });

  assert.equal(result.state, "partial");
  assert.ok(calls.some((args) => args.join(" ") === "extension add bug"));
});

test("reports catalog/network failure without attempting native installation", () => {
  const directory = project();
  const { calls, run } = commandRunner(directory, { infoStatus: 1 });

  const result = provisionBug({ project: directory, runCommand: run });

  assert.equal(result.state, "partial");
  assert.ok(calls.every((args) => args.join(" ") !== "extension add bug"));
});

test("reports missing registered commands after native installation as partial", () => {
  const directory = project();
  const { run } = commandRunner(directory, { commandCount: 2 });

  const result = provisionBug({ project: directory, runCommand: run });

  assert.equal(result.state, "partial");
  assert.match(result.message, /registration could not be verified/);
});
