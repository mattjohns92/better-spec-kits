import test from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const helper = path.join(packageRoot, "hooks/speckit-source-ownership.mjs");

function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bsk-source-ownership-"));
  for (const directory of ["specs/001-first", "specs/002-second"]) {
    fs.mkdirSync(path.join(root, directory), { recursive: true });
    fs.writeFileSync(path.join(root, directory, "brief.md"), `---\nid: F${directory.slice(6, 9)}\nfeature_directory: ${directory}\n---\n`);
  }
  fs.mkdirSync(path.join(root, "specs/.scope"), { recursive: true });
  fs.writeFileSync(path.join(root, "specs/.scope/Q123-test.md"), "---\nid: Q123\n---\n");
  fs.mkdirSync(path.join(root, "specs/quick/Q124-test"), { recursive: true });
  fs.writeFileSync(path.join(root, "specs/quick/Q124-test/brief.md"), "---\nid: Q124\n---\n");
  fs.mkdirSync(path.join(root, ".specify/bugs/timeout"), { recursive: true });
  fs.writeFileSync(path.join(root, ".specify/bugs/timeout/assessment.md"), "# Bug Assessment\n");
  return root;
}

function run(root, args) {
  return spawnSync(process.execPath, [helper, ...args, "--root", root], { encoding: "utf8" });
}

function claimArgs(directory, paths = [], resources = []) {
  return ["claim", "--feature-dir", directory, ...paths.flatMap((entry) => ["--path", entry]), ...resources.flatMap((entry) => ["--resource", entry])];
}

function previewArgs(directory, paths = [], resources = []) {
  return ["preview", "--feature-dir", directory, ...paths.flatMap((entry) => ["--path", entry]), ...resources.flatMap((entry) => ["--resource", entry])];
}

function reviseArgs(directory, paths = [], resources = []) {
  return ["revise", "--feature-dir", directory, ...paths.flatMap((entry) => ["--path", entry]), ...resources.flatMap((entry) => ["--resource", entry])];
}

async function concurrentClaim(root, args) {
  const child = spawn(process.execPath, [helper, ...args, "--root", root], { stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8").on("data", (value) => (stdout += value));
  child.stderr.setEncoding("utf8").on("data", (value) => (stderr += value));
  const [code] = await once(child, "close");
  return { code, stdout, stderr };
}

test("any path overlap rejects the entire incoming item", () => {
  const root = project();
  assert.equal(run(root, claimArgs("specs/001-first", ["src/a.js", "src/shared/", "test/a.test.js"])).status, 0);

  const conflict = run(root, claimArgs("specs/002-second", ["other/b.js", "src/shared/nested.js", "test/b.test.js"]));
  assert.notEqual(conflict.status, 0);
  assert.match(conflict.stderr, /specs\/001-first|F001/);
  assert.match(conflict.stderr, /src\/shared/);

  const registry = JSON.parse(fs.readFileSync(path.join(root, ".specify/source-ownership.json"), "utf8"));
  assert.equal(registry.reservations.length, 1);
  assert.deepEqual(registry.reservations[0].surface.paths, ["src/a.js", "src/shared", "test/a.test.js"]);
});

test("disjoint surfaces can be admitted concurrently by competing processes", async () => {
  const root = project();
  const results = await Promise.all([concurrentClaim(root, claimArgs("specs/001-first", ["clients/one.js"])), concurrentClaim(root, claimArgs("specs/002-second", ["servers/two.js"]))]);

  assert.deepEqual(
    results.map((result) => result.code),
    [0, 0],
    results.map((result) => result.stderr).join("\n"),
  );
  const registry = JSON.parse(fs.readFileSync(path.join(root, ".specify/source-ownership.json"), "utf8"));
  assert.equal(registry.reservations.length, 2);
});

test("workspace-relative surfaces remain independent across nested Git repository areas", () => {
  const root = project();
  assert.equal(run(root, claimArgs("specs/001-first", ["clients/one/src/app.js"])).status, 0);
  assert.equal(run(root, claimArgs("specs/002-second", ["services/two/src/app.js"])).status, 0);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, ".specify/source-ownership.json"), "utf8")).reservations.length, 2);
});

test("a fresh duplicate entry is blocked even with a different surface", () => {
  const root = project();
  assert.equal(run(root, claimArgs("specs/001-first", ["src/first.js"])).status, 0);
  assert.notEqual(run(root, claimArgs("specs/001-first", ["src/elsewhere.js"])).status, 0);
  assert.doesNotMatch(run(root, ["status"]).stdout, /TOKEN=/);
  assert.notEqual(run(root, ["check", "--feature-dir", "specs/001-first"]).status, 0);
});

test("path normalization detects ancestor, separator, and platform case overlap", () => {
  const root = project();
  assert.equal(run(root, claimArgs("specs/001-first", ["src\\app\\."])).status, 0);
  const conflictingCase = process.platform === "win32" ? "SRC/app/child.js" : "src/app/child.js";
  assert.notEqual(run(root, claimArgs("specs/002-second", [conflictingCase])).status, 0);
  assert.equal(run(root, ["release", "--feature-dir", "specs/001-first"]).status, 0);
  assert.equal(run(root, claimArgs("specs/002-second", ["src/application/child.js"])).status, 0);
});

test("empty, absolute, traversing, and wildcard surfaces fail closed", () => {
  const root = project();
  assert.notEqual(run(root, ["claim", "--feature-dir", "specs/001-first"]).status, 0);
  assert.notEqual(run(root, claimArgs("specs/001-first", ["../outside.js"])).status, 0);
  assert.notEqual(run(root, claimArgs("specs/001-first", [path.resolve(root, "src/file.js")])).status, 0);
  assert.notEqual(run(root, claimArgs("specs/001-first", ["src/*.js"])).status, 0);
  assert.match(run(root, ["status"]).stdout, /^FREE$/m);
});

test("canonical shared resources overlap exactly and reject the entire item", () => {
  const root = project();
  assert.equal(run(root, claimArgs("specs/001-first", ["src/a.js"], ["runtime:test-db"])).status, 0);
  assert.notEqual(run(root, claimArgs("specs/002-second", ["src/b.js", "src/c.js"], ["runtime:test-db"])).status, 0);
  assert.equal(run(root, claimArgs("specs/002-second", ["src/b.js"], ["runtime:other-db"])).status, 0);
});

test("Feature, QUICK, and Bug identities resolve exactly", () => {
  const root = project();
  assert.notEqual(run(root, ["claim", "--feature-dir", "../outside", "--path", "src/a.js"]).status, 0);
  assert.notEqual(run(root, ["claim", "--quick-id", "Q12", "--path", "src/a.js"]).status, 0);
  assert.equal(run(root, ["claim", "--quick-id", "Q123", "--path", "src/q.js"]).status, 0);
  const bug = run(root, ["claim", "--bug-dir", ".specify/bugs/timeout", "--path", "src/bug.js"]);
  assert.equal(bug.status, 0, bug.stderr);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, ".specify/source-ownership.json"), "utf8")).reservations.length, 2);
});

test("release removes only the exact reservation and reacquisition has no priority", () => {
  const root = project();
  assert.equal(run(root, claimArgs("specs/001-first", ["src/shared.js"])).status, 0);
  assert.equal(run(root, claimArgs("specs/002-second", ["src/other.js"])).status, 0);

  assert.notEqual(run(root, ["release", "--feature-dir", "specs/003-missing"]).status, 0);
  assert.equal(run(root, ["release", "--feature-dir", "specs/001-first"]).status, 0);
  assert.notEqual(run(root, claimArgs("specs/001-first", ["src/other.js"])).status, 0);
  assert.equal(run(root, claimArgs("specs/001-first", ["src/fresh.js"])).status, 0);

  const registry = JSON.parse(fs.readFileSync(path.join(root, ".specify/source-ownership.json"), "utf8"));
  assert.equal(registry.reservations.length, 2);
  assert.equal(registry.reservations[0].workItem.id, "F002");
});

test("recovery replaces only the selected reservation and preserves unrelated items", () => {
  const root = project();
  assert.equal(run(root, claimArgs("specs/001-first", ["src/a.js"])).status, 0);
  assert.equal(run(root, claimArgs("specs/002-second", ["src/b.js"])).status, 0);

  const recovered = run(root, ["recover", "--feature-dir", "specs/001-first", "--path", "src/recovered.js", "--confirm-inspected"]);
  assert.equal(recovered.status, 0, recovered.stderr);
  const registry = JSON.parse(fs.readFileSync(path.join(root, ".specify/source-ownership.json"), "utf8"));
  assert.equal(registry.reservations.length, 2);
  assert.equal(registry.reservations[0].workItem.id, "F002");
  assert.equal(registry.reservations[1].workItem.id, "F001");
  assert.deepEqual(registry.reservations[1].surface.paths, ["src/recovered.js"]);
});

test("malformed registry is unknown and recovery requires explicit full acceptance", () => {
  const root = project();
  const record = path.join(root, ".specify/source-ownership.json");
  fs.writeFileSync(record, "{malformed");

  assert.match(run(root, ["status"]).stdout, /^UNKNOWN/m);
  assert.notEqual(run(root, claimArgs("specs/001-first", ["src/a.js"])).status, 0);
  assert.notEqual(run(root, ["recover", "--feature-dir", "specs/001-first", "--path", "src/a.js", "--confirm-inspected"]).status, 0);
  assert.equal(run(root, ["recover", "--feature-dir", "specs/001-first", "--path", "src/a.js", "--confirm-inspected", "--confirm-discard-all"]).status, 0);
  assert.equal(JSON.parse(fs.readFileSync(record, "utf8")).reservations.length, 1);
});

test("legacy single-owner records block all new surfaces but remain explicitly releasable", () => {
  for (const legacy of [{ version: 1, tokenDigest: "a".repeat(64) }, { version: 2 }]) {
    const root = project();
    const recordPath = path.join(root, ".specify/source-ownership.json");
    fs.writeFileSync(
      recordPath,
      JSON.stringify({
        ...legacy,
        workItem: { type: "feature", id: "F001", directory: "specs/001-first" },
        acquiredAt: new Date().toISOString(),
      }),
    );

    assert.notEqual(run(root, claimArgs("specs/002-second", ["unrelated/file.js"])).status, 0);
    assert.equal(run(root, ["release", "--feature-dir", "specs/001-first"]).status, 0);
    assert.equal(run(root, claimArgs("specs/002-second", ["unrelated/file.js"])).status, 0);
  }
});

test("duplicate Feature IDs and symlinked surfaces are rejected", () => {
  const root = project();
  const duplicate = path.join(root, "specs/003-duplicate");
  fs.mkdirSync(duplicate, { recursive: true });
  fs.writeFileSync(path.join(duplicate, "brief.md"), "---\nid: F001\nfeature_directory: specs/003-duplicate\n---\n");
  assert.notEqual(run(root, claimArgs("specs/001-first", ["src/a.js"])).status, 0);

  const linkPath = path.join(root, "linked");
  const targetPath = path.join(root, "real-target");
  fs.mkdirSync(targetPath);
  try {
    fs.symlinkSync(targetPath, linkPath, "junction");
    assert.notEqual(run(root, claimArgs("specs/002-second", ["linked/new.js"])).status, 0);
  } catch (error) {
    if (error.code !== "EPERM" && error.code !== "EACCES") throw error;
  }
});

test("preview reports compatibility without reserving or mutating state", () => {
  const root = project();
  const registryPath = path.join(root, ".specify/source-ownership.json");
  const clear = run(root, previewArgs("specs/001-first", ["src/shared.js"]));
  assert.equal(clear.status, 0, clear.stderr);
  assert.match(clear.stdout, /CLEAR AT INSPECTION/);
  assert.equal(fs.existsSync(registryPath), false);

  assert.equal(run(root, claimArgs("specs/002-second", ["src/shared.js"])).status, 0);
  assert.notEqual(run(root, claimArgs("specs/001-first", ["src/shared.js"])).status, 0);
  const conflict = run(root, previewArgs("specs/002-second", ["src/shared/child.js", "test/second.js"]));
  assert.equal(conflict.status, 0, conflict.stderr);
  assert.match(conflict.stdout, /BLOCKED/);
  assert.match(conflict.stderr, /already active/);

  assert.equal(run(root, ["release", "--feature-dir", "specs/002-second"]).status, 0);
  assert.equal(run(root, claimArgs("specs/001-first", ["src/shared/"])).status, 0);
  const overlap = run(root, previewArgs("specs/002-second", ["src/shared/child.js", "test/second.js"]));
  assert.equal(overlap.status, 0, overlap.stderr);
  assert.match(overlap.stdout, /CONFLICT/);
  assert.match(overlap.stdout, /F001|specs\/001-first/);
  assert.match(overlap.stdout, /src\/shared/);

  const duplicate = run(root, previewArgs("specs/001-first", ["elsewhere.js"]));
  assert.equal(duplicate.status, 0, duplicate.stderr);
  assert.match(duplicate.stdout, /BLOCKED/);
  assert.match(duplicate.stderr, /already active/);
});

test("preview fails closed for incomplete or unknown candidate state", () => {
  const root = project();
  assert.notEqual(run(root, ["preview", "--feature-dir", "specs/001-first"]).status, 0);

  fs.writeFileSync(path.join(root, ".specify/source-ownership.json"), "{malformed");
  const unknown = run(root, previewArgs("specs/001-first", ["src/a.js"]));
  assert.equal(unknown.status, 2);
  assert.match(unknown.stdout, /UNKNOWN/);
});

test("status prints each reservation's normalized bounded surface", () => {
  const root = project();
  assert.equal(run(root, claimArgs("specs/001-first", ["src\\app\\.", "test/a.test.js"], ["runtime:test-db"])).status, 0);

  const result = run(root, ["status"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /path: src\/app/);
  assert.match(result.stdout, /path: test\/a\.test\.js/);
  assert.match(result.stdout, /resource: runtime:test-db/);
});

test("surface revision is complete and a failed overlap preserves the reservation", () => {
  const root = project();
  assert.equal(run(root, claimArgs("specs/001-first", ["src/original.js"])).status, 0);
  assert.equal(run(root, claimArgs("specs/002-second", ["src/shared/"])).status, 0);
  const registryPath = path.join(root, ".specify/source-ownership.json");
  const before = fs.readFileSync(registryPath, "utf8");

  const conflict = run(root, reviseArgs("specs/001-first", ["src/original.js", "src/shared/child.js"]));
  assert.notEqual(conflict.status, 0);
  assert.match(conflict.stderr, /F002|specs\/002-second/);
  assert.equal(fs.readFileSync(registryPath, "utf8"), before);

  const revised = run(root, reviseArgs("specs/001-first", ["src/revised.js", "test/revised.test.js"]));
  assert.equal(revised.status, 0, revised.stderr);
  assert.match(revised.stdout, /REVISED/);
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  assert.deepEqual(registry.reservations[0].surface.paths, ["src/revised.js", "test/revised.test.js"]);
  assert.equal(registry.reservations[0].acquiredAt, JSON.parse(before).reservations[0].acquiredAt);
});

test("surface revision rejects shared-resource overlap without changing the prior surface", () => {
  const root = project();
  assert.equal(run(root, claimArgs("specs/001-first", ["src/first.js"])).status, 0);
  assert.equal(run(root, claimArgs("specs/002-second", ["src/second.js"], ["runtime:shared-db"])).status, 0);
  const registryPath = path.join(root, ".specify/source-ownership.json");
  const before = fs.readFileSync(registryPath, "utf8");

  const conflict = run(root, reviseArgs("specs/001-first", ["src/first.js", "src/new.js"], ["runtime:shared-db"]));
  assert.notEqual(conflict.status, 0);
  assert.match(conflict.stderr, /runtime:shared-db/);
  assert.equal(fs.readFileSync(registryPath, "utf8"), before);
});

test("competing complete-surface revisions cannot both acquire an overlap", async () => {
  const root = project();
  assert.equal(run(root, claimArgs("specs/001-first", ["clients/one.js"])).status, 0);
  assert.equal(run(root, claimArgs("specs/002-second", ["servers/two.js"])).status, 0);

  const results = await Promise.all([
    concurrentClaim(root, reviseArgs("specs/001-first", ["clients/one.js", "shared/new.js"])),
    concurrentClaim(root, reviseArgs("specs/002-second", ["servers/two.js", "shared/new.js"])),
  ]);
  assert.deepEqual(results.map((result) => result.code).sort(), [0, 2]);

  const registry = JSON.parse(fs.readFileSync(path.join(root, ".specify/source-ownership.json"), "utf8"));
  assert.equal(registry.reservations.length, 2);
  assert.equal(registry.reservations.filter((entry) => entry.surface.paths.includes("shared/new.js")).length, 1);
});
