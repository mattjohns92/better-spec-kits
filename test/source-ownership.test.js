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
  fs.mkdirSync(path.join(root, ".specify"), { recursive: true });
  for (const directory of ["specs/001-first", "specs/002-second"]) {
    fs.mkdirSync(path.join(root, directory), { recursive: true });
    fs.writeFileSync(path.join(root, directory, "brief.md"), `---\nid: F${directory.slice(6, 9)}\nfeature_directory: ${directory}\n---\n`);
  }
  fs.mkdirSync(path.join(root, "specs/.scope"), { recursive: true });
  fs.writeFileSync(path.join(root, "specs/.scope/Q123-test.md"), "---\nid: Q123\n---\n");
  fs.mkdirSync(path.join(root, "specs/quick/Q124-test"), { recursive: true });
  fs.writeFileSync(path.join(root, "specs/quick/Q124-test/brief.md"), "---\nid: Q124\n---\n");
  return root;
}

function run(root, args, token) {
  const env = { ...process.env };
  delete env.BSK_SOURCE_OWNERSHIP_TOKEN;
  if (token) env.BSK_SOURCE_OWNERSHIP_TOKEN = token;
  return spawnSync(process.execPath, [helper, ...args, "--root", root], {
    encoding: "utf8",
    env,
  });
}

function claimArgs(directory) {
  return ["claim", "--feature-dir", directory];
}

function tokenFrom(result) {
  return result.stdout.match(/^TOKEN=(\S+)$/m)?.[1];
}

async function concurrentClaim(root, directory) {
  const child = spawn(process.execPath, [helper, ...claimArgs(directory), "--root", root], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8").on("data", (value) => { stdout += value; });
  child.stderr.setEncoding("utf8").on("data", (value) => { stderr += value; });
  const [code] = await once(child, "close");
  return { code, stdout, stderr };
}

test("competing processes cannot claim shared source simultaneously", async () => {
  const root = project();
  const results = await Promise.all([
    concurrentClaim(root, "specs/001-first"),
    concurrentClaim(root, "specs/002-second"),
  ]);

  assert.equal(results.filter((result) => result.code === 0).length, 1, results.map((result) => result.stderr).join("\n"));
  assert.equal(results.filter((result) => result.code !== 0).length, 1);
  assert.match(run(root, ["status"]).stdout, /^HELD /m);
});

test("same-item claims are blocked and a matching token is required", () => {
  const root = project();
  const first = run(root, claimArgs("specs/001-first"));
  const token = tokenFrom(first);

  assert.equal(first.status, 0, first.stderr);
  assert.ok(token);
  assert.notEqual(run(root, claimArgs("specs/001-first"), token).status, 0);
  const status = run(root, ["status"]);
  assert.equal(status.status, 0);
  assert.match(status.stdout, /^HELD /m);
  assert.ok(!status.stdout.includes(token));
  assert.equal(run(root, ["check", "--feature-dir", "specs/001-first"], token).status, 0);
  assert.notEqual(run(root, ["check", "--feature-dir", "specs/001-first"], "wrong-token").status, 0);
});

test("release removes only the verified claim and allows later reacquisition", () => {
  const root = project();
  const first = run(root, claimArgs("specs/001-first"));
  const token = tokenFrom(first);
  assert.equal(first.status, 0, first.stderr);

  const released = run(root, ["release", "--feature-dir", "specs/001-first"], token);
  assert.equal(released.status, 0, released.stderr);
  assert.match(run(root, ["status"]).stdout, /^FREE$/m);
  assert.notEqual(run(root, ["release", "--feature-dir", "specs/001-first"], token).status, 0);
  assert.equal(run(root, claimArgs("specs/002-second")).status, 0);
});

test("item-local preparation can proceed without disturbing held source ownership", () => {
  const root = project();
  const first = run(root, claimArgs("specs/001-first"));
  const token = tokenFrom(first);
  assert.equal(first.status, 0, first.stderr);

  const preparation = path.join(root, "specs/002-second/analysis.md");
  fs.writeFileSync(preparation, "Item-local preparation evidence");
  assert.equal(fs.readFileSync(preparation, "utf8"), "Item-local preparation evidence");
  assert.equal(run(root, ["check", "--feature-dir", "specs/001-first"], token).status, 0);
  assert.match(run(root, ["status"]).stdout, /^HELD F001/m);
});

test("malformed state is unknown, blocks claims, and requires explicit recovery", () => {
  const root = project();
  const record = path.join(root, ".specify/source-ownership.json");
  fs.writeFileSync(record, "{malformed");

  assert.match(run(root, ["status"]).stdout, /^UNKNOWN/m);
  assert.notEqual(run(root, claimArgs("specs/001-first")).status, 0);
  assert.notEqual(run(root, ["recover", "--feature-dir", "specs/001-first"]).status, 0);

  const recovered = run(root, ["recover", "--feature-dir", "specs/001-first", "--confirm-inspected"]);
  assert.equal(recovered.status, 0, recovered.stderr);
  assert.ok(tokenFrom(recovered));
  assert.equal(run(root, ["check", "--feature-dir", "specs/001-first"], tokenFrom(recovered)).status, 0);
});

test("held ownership requires confirmed recovery and replaces the previous token", () => {
  const root = project();
  const first = run(root, claimArgs("specs/001-first"));
  const oldToken = tokenFrom(first);
  assert.equal(first.status, 0, first.stderr);

  assert.notEqual(run(root, ["recover", "--feature-dir", "specs/002-second"]).status, 0);
  const recovered = run(root, ["recover", "--feature-dir", "specs/002-second", "--confirm-inspected"]);
  const newToken = tokenFrom(recovered);
  assert.equal(recovered.status, 0, recovered.stderr);
  assert.ok(newToken);
  assert.notEqual(newToken, oldToken);
  assert.notEqual(run(root, ["check", "--feature-dir", "specs/001-first"], oldToken).status, 0);
  assert.equal(run(root, ["check", "--feature-dir", "specs/002-second"], newToken).status, 0);
});

test("feature directories must resolve under specs and quick IDs must be exact", () => {
  const root = project();
  assert.notEqual(run(root, ["claim", "--feature-dir", "../outside"]).status, 0);
  assert.notEqual(run(root, ["claim", "--quick-id", "Q12"]).status, 0);
  const legacy = run(root, ["claim", "--quick-id", "Q123"]);
  assert.equal(legacy.status, 0, legacy.stderr);
  assert.equal(run(root, ["release", "--quick-id", "Q123"], tokenFrom(legacy)).status, 0);
  assert.equal(run(root, ["claim", "--quick-id", "Q124"]).status, 0);
});

test("duplicate Feature IDs are rejected instead of selecting by directory", () => {
  const root = project();
  const duplicate = path.join(root, "specs/003-duplicate");
  fs.mkdirSync(duplicate, { recursive: true });
  fs.writeFileSync(path.join(duplicate, "brief.md"), "---\nid: F001\nfeature_directory: specs/003-duplicate\n---\n");

  assert.notEqual(run(root, claimArgs("specs/001-first")).status, 0);
});