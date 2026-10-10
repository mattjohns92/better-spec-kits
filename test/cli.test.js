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

test("install preview lists Review as ADD when it is absent", async () => {
  const directory = project();
  const output = await capture(["install", directory, "--yes"]);
  assert.match(output, /\+ ADD\s+\.github\/skills\/speckit-review\/SKILL\.md/);
  assert.match(output, /Ready: specify → clarify → design → plan → tasks → implement → review/);
  assert.match(output, /Analyze remains available as an optional pre-implementation check/);
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

test("doctor flags a missing Review skill in an installed project", async () => {
  const output = await capture(["doctor", project()]);
  assert.match(output, /Review skill is missing/);
});
