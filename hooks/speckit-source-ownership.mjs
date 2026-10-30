import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const recordName = "source-ownership.json";
const lockName = "source-ownership.lock";

class OwnershipError extends Error {}

function pathsFor(root) {
  const specify = path.join(root, ".specify");
  return { record: path.join(specify, recordName), lock: path.join(specify, lockName) };
}

function featureIdentity(root, directory) {
  if (typeof directory !== "string" || !/^specs\/[0-9]{3}-[a-z0-9-]+$/.test(directory)) {
    throw new OwnershipError("Feature identity must be one exact numbered specs directory.");
  }
  const specsRoot = path.resolve(root, "specs");
  const folder = path.resolve(root, directory);
  const realSpecsRoot = fs.realpathSync(specsRoot);
  const realFolder = fs.realpathSync(folder);
  const relative = path.relative(realSpecsRoot, realFolder);
  if (!relative || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative) || !fs.statSync(folder, { throwIfNoEntry: false })?.isDirectory()) {
    throw new OwnershipError("Feature directory does not resolve under specs/.");
  }
  const briefPath = path.join(folder, "brief.md");
  if (!fs.existsSync(briefPath)) throw new OwnershipError("Feature directory has no Scope brief.md.");
  const brief = fs.readFileSync(briefPath, "utf8");
  const frontmatter = brief.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  const id = frontmatter?.match(/^id:\s*(F\d{3})\s*$/m)?.[1];
  const recordedDirectory = frontmatter?.match(/^feature_directory:\s*(["']?)([^"'\r\n]+)\1\s*$/m)?.[2];
  if (!id || recordedDirectory !== directory) {
    throw new OwnershipError("Feature brief identity does not match the selected directory.");
  }
  const matches = fs
    .readdirSync(specsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^[0-9]{3}-[a-z0-9-]+$/.test(entry.name))
    .filter((entry) => {
      const candidate = path.join(specsRoot, entry.name, "brief.md");
      if (!fs.existsSync(candidate)) return false;
      const candidateText = fs.readFileSync(candidate, "utf8");
      const candidateFrontmatter = candidateText.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
      return candidateFrontmatter?.match(/^id:\s*(F\d{3})\s*$/m)?.[1] === id;
    });
  if (matches.length !== 1 || matches[0].name !== path.basename(directory)) {
    throw new OwnershipError(`Feature ${id} must resolve to exactly one Scope brief.`);
  }
  return { type: "feature", id, directory };
}

function quickIdentity(root, id) {
  if (typeof id !== "string" || !/^Q\d{3}$/.test(id)) throw new OwnershipError("QUICK identity must be one exact Q### ID.");
  const matches = [];
  const locations = [
    { directory: path.join(root, "specs", "quick"), pattern: new RegExp(`^${id}-[a-z0-9-]+$`), brief: "brief.md" },
    { directory: path.join(root, "specs", ".scope"), pattern: new RegExp(`^${id}-[a-z0-9-]+\\.md$`), brief: null },
  ];
  for (const location of locations) {
    if (!fs.existsSync(location.directory)) continue;
    for (const entry of fs.readdirSync(location.directory, { withFileTypes: true })) {
      if (!location.pattern.test(entry.name)) continue;
      if (location.brief ? !entry.isDirectory() : !entry.isFile()) continue;
      const record = location.brief ? path.join(location.directory, entry.name, location.brief) : path.join(location.directory, entry.name);
      if (!fs.existsSync(record)) continue;
      const text = fs.readFileSync(record, "utf8");
      const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
      if (frontmatter?.match(/^id:\s*(Q\d{3})\s*$/m)?.[1] === id) matches.push(record);
    }
  }
  if (matches.length !== 1) throw new OwnershipError(`QUICK ${id} must resolve to exactly one authoritative Scope record.`);
  return { type: "quick", id };
}

function workItemFromOptions(root, options) {
  if (options.featureDirectory && !options.quickId) return featureIdentity(root, options.featureDirectory);
  if (options.quickId && !options.featureDirectory) return quickIdentity(root, options.quickId);
  throw new OwnershipError("Supply exactly one resolved Feature directory or exact QUICK ID.");
}

function validateWorkItem(root, workItem) {
  if (workItem?.type === "feature") {
    const resolved = featureIdentity(root, workItem.directory);
    if (resolved.id !== workItem.id) throw new OwnershipError("Stored Feature identity no longer matches its brief.");
    return resolved;
  }
  if (workItem?.type === "quick") return quickIdentity(root, workItem.id);
  throw new OwnershipError("Stored work-item identity is invalid or unsupported.");
}

function display(workItem) {
  return workItem.type === "feature" ? `${workItem.id} (${workItem.directory})` : workItem.id;
}

function digest(token) {
  return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

function newClaim(workItem) {
  const token = crypto.randomBytes(32).toString("base64url");
  return {
    token,
    record: { version: 1, workItem, tokenDigest: digest(token), acquiredAt: new Date().toISOString() },
  };
}

function writeClaim(file, record) {
  const descriptor = fs.openSync(file, "wx", 0o600);
  try {
    fs.writeFileSync(descriptor, `${JSON.stringify(record, null, 2)}\n`, "utf8");
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
}

function readClaim(root, file) {
  if (!fs.existsSync(file)) return null;
  let record;
  try {
    record = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    throw new OwnershipError("Ownership state is UNKNOWN because the claim record is malformed.");
  }
  if (!record || record.version !== 1 || !/^[a-f0-9]{64}$/.test(record.tokenDigest ?? "") || Number.isNaN(Date.parse(record.acquiredAt))) {
    throw new OwnershipError("Ownership state is UNKNOWN because the claim record is invalid or unsupported.");
  }
  return { ...record, workItem: validateWorkItem(root, record.workItem) };
}

function withLock(root, operation) {
  const paths = pathsFor(root);
  fs.mkdirSync(path.dirname(paths.record), { recursive: true });
  try {
    fs.mkdirSync(paths.lock);
  } catch (error) {
    if (error.code === "EEXIST") throw new OwnershipError("Ownership state is UNKNOWN because an operation lock exists; explicit recovery is required.");
    throw error;
  }
  try {
    return operation(paths);
  } finally {
    fs.rmSync(paths.lock, { recursive: true, force: true });
  }
}

function assertToken(record, workItem, token) {
  if (!record) throw new OwnershipError("No ownership claim is held.");
  if (record.workItem.type !== workItem.type || record.workItem.id !== workItem.id || record.workItem.directory !== workItem.directory) {
    throw new OwnershipError(`Source ownership is held by ${display(record.workItem)}.`);
  }
  const supplied = Buffer.from(digest(token ?? ""), "hex");
  const expected = Buffer.from(record.tokenDigest, "hex");
  if (!crypto.timingSafeEqual(supplied, expected)) throw new OwnershipError("Ownership token is missing or does not match.");
}

export function status({ root = process.cwd() } = {}) {
  const resolvedRoot = path.resolve(root);
  const paths = pathsFor(resolvedRoot);
  if (fs.existsSync(paths.lock)) return { state: "UNKNOWN", reason: "ownership operation lock exists" };
  try {
    const record = readClaim(resolvedRoot, paths.record);
    return record ? { state: "HELD", workItem: record.workItem } : { state: "FREE" };
  } catch (error) {
    return { state: "UNKNOWN", reason: error.message };
  }
}

export function claim({ root = process.cwd(), featureDirectory, quickId } = {}) {
  const resolvedRoot = path.resolve(root);
  const workItem = workItemFromOptions(resolvedRoot, { featureDirectory, quickId });
  return withLock(resolvedRoot, (paths) => {
    const existing = readClaim(resolvedRoot, paths.record);
    if (existing) throw new OwnershipError(`Source ownership is already held by ${display(existing.workItem)}.`);
    const result = newClaim(workItem);
    writeClaim(paths.record, result.record);
    return { workItem, token: result.token };
  });
}

export function check({ root = process.cwd(), featureDirectory, quickId, token } = {}) {
  const resolvedRoot = path.resolve(root);
  const workItem = workItemFromOptions(resolvedRoot, { featureDirectory, quickId });
  const paths = pathsFor(resolvedRoot);
  if (fs.existsSync(paths.lock)) throw new OwnershipError("Ownership state is UNKNOWN because an operation is in progress or requires recovery.");
  assertToken(readClaim(resolvedRoot, paths.record), workItem, token);
  return { state: "HELD", workItem };
}

export function release({ root = process.cwd(), featureDirectory, quickId, token } = {}) {
  const resolvedRoot = path.resolve(root);
  const workItem = workItemFromOptions(resolvedRoot, { featureDirectory, quickId });
  return withLock(resolvedRoot, (paths) => {
    assertToken(readClaim(resolvedRoot, paths.record), workItem, token);
    fs.unlinkSync(paths.record);
    return { state: "FREE" };
  });
}

export function recover({ root = process.cwd(), featureDirectory, quickId, confirmed = false } = {}) {
  if (!confirmed) throw new OwnershipError("Recovery requires explicit confirmation after inspecting and accepting the current repository state.");
  const resolvedRoot = path.resolve(root);
  const workItem = workItemFromOptions(resolvedRoot, { featureDirectory, quickId });
  return withLock(resolvedRoot, (paths) => {
    fs.rmSync(paths.record, { force: true });
    const result = newClaim(workItem);
    writeClaim(paths.record, result.record);
    return { workItem, token: result.token };
  });
}

function parseArguments(argv) {
  const [command, ...args] = argv;
  const options = { token: process.env.BSK_SOURCE_OWNERSHIP_TOKEN };
  for (let index = 0; index < args.length; index++) {
    const key = args[index];
    if (!key.startsWith("--")) throw new OwnershipError(`Unexpected argument: ${key}`);
    if (key === "--confirm-inspected") {
      options.confirmed = true;
      continue;
    }
    const value = args[++index];
    if (!value || value.startsWith("--")) throw new OwnershipError(`Missing value for ${key}.`);
    const name = { "--root": "root", "--feature-dir": "featureDirectory", "--quick-id": "quickId" }[key];
    if (!name || options[name] !== undefined) throw new OwnershipError(`Unknown or duplicate option: ${key}`);
    options[name] = value;
  }
  return { command, options };
}

export function main(argv = process.argv.slice(2)) {
  const { command, options } = parseArguments(argv);
  if (command === "status") {
    const result = status(options);
    console.log(result.state === "HELD" ? `HELD ${display(result.workItem)}` : result.state);
    if (result.state === "UNKNOWN") {
      console.error(result.reason);
      process.exitCode = 2;
    }
    return result;
  }
  const operation = { claim, check, release, recover }[command];
  if (!operation) throw new OwnershipError("Operation must be status, claim, check, release, or recover.");
  const result = operation(options);
  if (result.token) console.log(`TOKEN=${result.token}`);
  console.log(result.state ? result.state : `HELD ${display(result.workItem)}`);
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
