import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const recordName = "source-ownership.json";
const lockName = "source-ownership.lock";
const lockWaitBuffer = new Int32Array(new SharedArrayBuffer(4));
const lockWaitLimitMs = 5000;

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

function bugIdentity(root, directory) {
  if (typeof directory !== "string" || !/^\.specify\/bugs\/[a-z0-9][a-z0-9-]*$/.test(directory)) {
    throw new OwnershipError("Bug identity must be one exact .specify/bugs/<slug> assessment directory.");
  }
  const bugsRoot = fs.realpathSync(path.join(root, ".specify", "bugs"));
  const folder = path.resolve(root, directory);
  const realFolder = fs.realpathSync(folder);
  const relative = path.relative(bugsRoot, realFolder);
  if (!relative || relative.includes(path.sep) || relative.startsWith("..") || !fs.statSync(folder).isDirectory()) {
    throw new OwnershipError("Bug assessment directory does not resolve under .specify/bugs/.");
  }
  if (!fs.statSync(path.join(folder, "assessment.md"), { throwIfNoEntry: false })?.isFile()) {
    throw new OwnershipError("Bug assessment directory has no assessment.md.");
  }
  return { type: "bug", id: path.basename(folder), directory };
}

function workItemFromOptions(root, options) {
  const supplied = [options.featureDirectory, options.quickId, options.bugDirectory].filter(Boolean).length;
  if (supplied !== 1) throw new OwnershipError("Supply exactly one Feature directory, QUICK ID, or Bug assessment directory.");
  if (options.featureDirectory) return featureIdentity(root, options.featureDirectory);
  if (options.quickId) return quickIdentity(root, options.quickId);
  return bugIdentity(root, options.bugDirectory);
}

function validateWorkItem(root, workItem) {
  if (workItem?.type === "feature") {
    const resolved = featureIdentity(root, workItem.directory);
    if (resolved.id !== workItem.id) throw new OwnershipError("Stored Feature identity no longer matches its brief.");
    return resolved;
  }
  if (workItem?.type === "quick") return quickIdentity(root, workItem.id);
  if (workItem?.type === "bug") {
    const resolved = bugIdentity(root, workItem.directory);
    if (resolved.id !== workItem.id) throw new OwnershipError("Stored Bug identity no longer matches its assessment directory.");
    return resolved;
  }
  throw new OwnershipError("Stored work-item identity is invalid or unsupported.");
}

function display(workItem) {
  return workItem.type === "feature" ? `${workItem.id} (${workItem.directory})` : workItem.type === "bug" ? `BUG ${workItem.id}` : workItem.id;
}

function itemKey(workItem) {
  return `${workItem.type}:${workItem.id}`;
}

function normalizePath(root, input) {
  if (typeof input !== "string" || !input.trim()) throw new OwnershipError("Implementation surface paths must be non-empty strings.");
  const value = input.trim().replace(/\\/g, "/");
  if (value.startsWith("/") || /^[a-zA-Z]:/.test(value) || value.includes("\0")) throw new OwnershipError(`Surface path must be repository-relative: ${input}`);
  const segments = value.split("/").filter((segment) => segment && segment !== ".");
  if (!segments.length || segments.includes("..") || segments.some((segment) => /[*?{}\[\]]/.test(segment))) {
    throw new OwnershipError(`Surface path is unsafe or not fully enumerated: ${input}`);
  }
  const normalized = segments.join("/");
  if (normalized === ".specify/source-ownership.json" || normalized.startsWith(".specify/source-ownership.lock")) {
    throw new OwnershipError("The ownership registry and operation lock cannot be part of an implementation surface.");
  }
  let cursor = root;
  for (const segment of segments) {
    cursor = path.join(cursor, segment);
    const entry = fs.lstatSync(cursor, { throwIfNoEntry: false });
    if (entry?.isSymbolicLink()) throw new OwnershipError(`Surface path traverses a symbolic link: ${normalized}`);
  }
  return normalized;
}

function normalizeSurface(root, paths, resources) {
  if (!Array.isArray(paths) || !Array.isArray(resources)) throw new OwnershipError("A complete surface must declare path and resource arrays.");
  const normalizedPaths = [...new Set(paths.map((entry) => normalizePath(root, entry)))].sort();
  const normalizedResources = [
    ...new Set(
      resources.map((entry) => {
        if (typeof entry !== "string" || !entry.trim() || /[*?{}\[\]]/.test(entry) || entry.includes("\0")) {
          throw new OwnershipError("Shared resource identifiers must be non-empty canonical exact values.");
        }
        return entry.trim();
      }),
    ),
  ].sort();
  if (!normalizedPaths.length && !normalizedResources.length) throw new OwnershipError("The complete implementation surface must include at least one path or shared resource.");
  return { paths: normalizedPaths, resources: normalizedResources };
}

function pathOverlap(first, second) {
  const left = process.platform === "win32" ? first.toLowerCase() : first;
  const right = process.platform === "win32" ? second.toLowerCase() : second;
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function surfaceOverlap(first, second) {
  if (!first || !second) return true;
  if (first.paths.some((left) => second.paths.some((right) => pathOverlap(left, right)))) return true;
  return first.resources.some((resource) => second.resources.includes(resource));
}

function reservation(workItem, surface) {
  return { workItem, surface, acquiredAt: new Date().toISOString() };
}

function writeRegistry(file, registry) {
  const temporary = `${file}.${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.tmp`;
  const descriptor = fs.openSync(temporary, "wx", 0o600);
  try {
    fs.writeFileSync(descriptor, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
  try {
    fs.renameSync(temporary, file);
  } catch (error) {
    fs.rmSync(temporary, { force: true });
    throw error;
  }
}

function validateReservation(root, entry) {
  if (!entry || Number.isNaN(Date.parse(entry.acquiredAt))) throw new OwnershipError("Ownership state is UNKNOWN because a reservation is invalid.");
  const workItem = validateWorkItem(root, entry.workItem);
  if (entry.surface === null) return { ...entry, workItem, legacy: true };
  const surface = normalizeSurface(root, entry.surface?.paths, entry.surface?.resources);
  if (JSON.stringify(surface) !== JSON.stringify(entry.surface)) throw new OwnershipError("Ownership state is UNKNOWN because a reservation surface is not normalized.");
  return { ...entry, workItem, surface };
}

function readRegistry(root, file) {
  if (!fs.existsSync(file)) return { version: 3, reservations: [] };
  let record;
  try {
    record = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    throw new OwnershipError("Ownership state is UNKNOWN because the reservation registry is malformed.");
  }
  const legacyRecord = record?.version === 1 && /^[a-f0-9]{64}$/.test(record.tokenDigest ?? "");
  const currentRecord = record?.version === 2 && !Object.hasOwn(record, "tokenDigest");
  if (legacyRecord || currentRecord) {
    const legacy = validateReservation(root, { workItem: record.workItem, surface: null, acquiredAt: record.acquiredAt });
    return { version: 3, reservations: [legacy], legacy: true };
  }
  if (record?.version !== 3 || !Array.isArray(record.reservations)) {
    throw new OwnershipError("Ownership state is UNKNOWN because the reservation registry is invalid or unsupported.");
  }
  const reservations = record.reservations.map((entry) => validateReservation(root, entry));
  const identities = new Set();
  for (let index = 0; index < reservations.length; index++) {
    const key = itemKey(reservations[index].workItem);
    if (identities.has(key)) throw new OwnershipError("Ownership state is UNKNOWN because a work item has duplicate reservations.");
    identities.add(key);
    for (let other = 0; other < index; other++) {
      if (surfaceOverlap(reservations[index].surface, reservations[other].surface)) {
        throw new OwnershipError("Ownership state is UNKNOWN because active reservations overlap.");
      }
    }
  }
  return { version: 3, reservations };
}

function withLock(root, operation) {
  const paths = pathsFor(root);
  fs.mkdirSync(path.dirname(paths.record), { recursive: true });
  const deadline = Date.now() + lockWaitLimitMs;
  while (true) {
    try {
      fs.mkdirSync(paths.lock);
      break;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      if (Date.now() >= deadline) {
        throw new OwnershipError("Ownership state is UNKNOWN because an operation lock remains held; explicit recovery is required.");
      }
      Atomics.wait(lockWaitBuffer, 0, 0, 10);
    }
  }
  try {
    return operation(paths);
  } finally {
    fs.rmSync(paths.lock, { recursive: true, force: true });
  }
}

function assertNoConflicts(reservations, workItem, surface) {
  const sameItem = reservations.find((entry) => itemKey(entry.workItem) === itemKey(workItem));
  if (sameItem) throw new OwnershipError(`A fresh implementation entry for ${display(workItem)} is blocked; its reservation is already active.`);
  const legacy = reservations.find((entry) => entry.legacy || !entry.surface);
  if (legacy) throw new OwnershipError(`Surface is unknown; all implementation is blocked by legacy reservation ${display(legacy.workItem)}.`);
  for (const current of reservations) {
    if (surfaceOverlap(current.surface, surface)) {
      const overlapPath = surface.paths.find((candidate) => current.surface.paths.some((reserved) => pathOverlap(candidate, reserved)));
      const overlapResource = surface.resources.find((candidate) => current.surface.resources.includes(candidate));
      throw new OwnershipError(
        `Entire work item ${display(workItem)} is blocked by overlapping reservation ${display(current.workItem)}${overlapPath ? ` at ${overlapPath}` : overlapResource ? ` for resource ${overlapResource}` : ""}.`,
      );
    }
  }
}

function conflictsFor(reservations, workItem, surface) {
  return reservations
    .filter((entry) => itemKey(entry.workItem) !== itemKey(workItem))
    .map((entry) => {
      if (entry.legacy || !entry.surface) return { workItem: entry.workItem, unknown: true, paths: [], resources: [] };
      return {
        workItem: entry.workItem,
        unknown: false,
        paths: surface.paths.filter((candidate) => entry.surface.paths.some((reserved) => pathOverlap(candidate, reserved))),
        resources: surface.resources.filter((candidate) => entry.surface.resources.includes(candidate)),
      };
    })
    .filter((entry) => entry.unknown || entry.paths.length || entry.resources.length);
}

export function preview({ root = process.cwd(), featureDirectory, quickId, bugDirectory, paths = [], resources = [] } = {}) {
  const resolvedRoot = path.resolve(root);
  const workItem = workItemFromOptions(resolvedRoot, { featureDirectory, quickId, bugDirectory });
  const surface = normalizeSurface(resolvedRoot, paths, resources);
  const registryPaths = pathsFor(resolvedRoot);
  if (fs.existsSync(registryPaths.lock)) return { state: "UNKNOWN", reason: "ownership operation lock exists" };
  try {
    const registry = readRegistry(resolvedRoot, registryPaths.record);
    if (registry.reservations.some((entry) => itemKey(entry.workItem) === itemKey(workItem))) {
      return { state: "BLOCKED", reason: `A fresh implementation entry for ${display(workItem)} is blocked; its reservation is already active.` };
    }
    const conflicts = conflictsFor(registry.reservations, workItem, surface);
    if (conflicts.some((entry) => entry.unknown)) return { state: "UNKNOWN", reason: "an active legacy reservation has an unknown surface" };
    if (conflicts.length) return { state: "CONFLICT", workItem, surface, conflicts };
    return { state: "CLEAR AT INSPECTION", workItem, surface };
  } catch (error) {
    return { state: "UNKNOWN", reason: error.message };
  }
}

export function status({ root = process.cwd() } = {}) {
  const resolvedRoot = path.resolve(root);
  const paths = pathsFor(resolvedRoot);
  if (fs.existsSync(paths.lock)) return { state: "UNKNOWN", reason: "ownership operation lock exists" };
  try {
    const registry = readRegistry(resolvedRoot, paths.record);
    return registry.reservations.length ? { state: "RESERVED", reservations: registry.reservations } : { state: "FREE", reservations: [] };
  } catch (error) {
    return { state: "UNKNOWN", reason: error.message };
  }
}

export function claim({ root = process.cwd(), featureDirectory, quickId, bugDirectory, paths = [], resources = [] } = {}) {
  const resolvedRoot = path.resolve(root);
  const workItem = workItemFromOptions(resolvedRoot, { featureDirectory, quickId, bugDirectory });
  const surface = normalizeSurface(resolvedRoot, paths, resources);
  return withLock(resolvedRoot, (paths) => {
    const registry = readRegistry(resolvedRoot, paths.record);
    assertNoConflicts(registry.reservations, workItem, surface);
    writeRegistry(paths.record, { version: 3, reservations: [...registry.reservations, reservation(workItem, surface)] });
    return { workItem, surface };
  });
}

export function revise({ root = process.cwd(), featureDirectory, quickId, bugDirectory, paths = [], resources = [] } = {}) {
  const resolvedRoot = path.resolve(root);
  const workItem = workItemFromOptions(resolvedRoot, { featureDirectory, quickId, bugDirectory });
  const surface = normalizeSurface(resolvedRoot, paths, resources);
  return withLock(resolvedRoot, (registryPaths) => {
    const registry = readRegistry(resolvedRoot, registryPaths.record);
    const current = registry.reservations.find((entry) => itemKey(entry.workItem) === itemKey(workItem));
    if (!current) throw new OwnershipError(`No reservation is held by ${display(workItem)}; a surface revision requires an active reservation.`);
    const conflicts = conflictsFor(registry.reservations, workItem, surface);
    const unknown = conflicts.find((entry) => entry.unknown);
    if (unknown) throw new OwnershipError(`Surface is unknown; revision is blocked by legacy reservation ${display(unknown.workItem)}.`);
    if (conflicts.length) {
      const conflict = conflicts[0];
      const overlapPath = conflict.paths[0];
      const overlapResource = conflict.resources[0];
      throw new OwnershipError(
        `Entire surface revision for ${display(workItem)} is blocked by overlapping reservation ${display(conflict.workItem)}${overlapPath ? ` at ${overlapPath}` : overlapResource ? ` for resource ${overlapResource}` : ""}.`,
      );
    }
    const reservations = registry.reservations.map((entry) => (entry === current ? { ...entry, surface } : entry));
    writeRegistry(registryPaths.record, { version: 3, reservations });
    return { workItem, surface };
  });
}

export function release({ root = process.cwd(), featureDirectory, quickId, bugDirectory } = {}) {
  const resolvedRoot = path.resolve(root);
  const workItem = workItemFromOptions(resolvedRoot, { featureDirectory, quickId, bugDirectory });
  return withLock(resolvedRoot, (paths) => {
    const registry = readRegistry(resolvedRoot, paths.record);
    const remaining = registry.reservations.filter((entry) => itemKey(entry.workItem) !== itemKey(workItem));
    if (remaining.length === registry.reservations.length) throw new OwnershipError(`No reservation is held by ${display(workItem)}.`);
    writeRegistry(paths.record, { version: 3, reservations: remaining });
    return { state: remaining.length ? "RESERVED" : "FREE" };
  });
}

export function recover({ root = process.cwd(), featureDirectory, quickId, bugDirectory, paths = [], resources = [], confirmed = false, discardAll = false } = {}) {
  if (!confirmed) throw new OwnershipError("Recovery requires explicit confirmation after inspecting and accepting the current repository state.");
  if (discardAll && !confirmed) throw new OwnershipError("Discarding an unreadable registry requires explicit inspection and acceptance.");
  const resolvedRoot = path.resolve(root);
  const workItem = workItemFromOptions(resolvedRoot, { featureDirectory, quickId, bugDirectory });
  const surface = normalizeSurface(resolvedRoot, paths, resources);
  return withLock(resolvedRoot, (paths) => {
    let registry;
    try {
      registry = readRegistry(resolvedRoot, paths.record);
    } catch (error) {
      if (!discardAll) throw new OwnershipError(`${error.message} Use --confirm-discard-all only after accepting that all unreadable reservations are abandoned.`);
      registry = { version: 3, reservations: [] };
    }
    const remaining = registry.reservations.filter((entry) => itemKey(entry.workItem) !== itemKey(workItem));
    if (remaining.length === registry.reservations.length && registry.reservations.length) {
      throw new OwnershipError(`Recovery can replace only the exact reservation for ${display(workItem)}.`);
    }
    assertNoConflicts(remaining, workItem, surface);
    writeRegistry(paths.record, { version: 3, reservations: [...remaining, reservation(workItem, surface)] });
    return { workItem, surface };
  });
}

function parseArguments(argv) {
  const [command, ...args] = argv;
  const options = { paths: [], resources: [] };
  for (let index = 0; index < args.length; index++) {
    const key = args[index];
    if (!key.startsWith("--")) throw new OwnershipError(`Unexpected argument: ${key}`);
    if (key === "--confirm-inspected") {
      options.confirmed = true;
      continue;
    }
    if (key === "--confirm-discard-all") {
      options.discardAll = true;
      continue;
    }
    const value = args[++index];
    if (!value || value.startsWith("--")) throw new OwnershipError(`Missing value for ${key}.`);
    if (key === "--path" || key === "--resource") {
      options[key === "--path" ? "paths" : "resources"].push(value);
      continue;
    }
    const name = { "--root": "root", "--feature-dir": "featureDirectory", "--quick-id": "quickId", "--bug-dir": "bugDirectory" }[key];
    if (!name || options[name] !== undefined) throw new OwnershipError(`Unknown or duplicate option: ${key}`);
    options[name] = value;
  }
  return { command, options };
}

export function main(argv = process.argv.slice(2)) {
  const { command, options } = parseArguments(argv);
  if (command === "status") {
    const result = status(options);
    console.log(result.state);
    for (const entry of result.reservations ?? []) {
      console.log(`${display(entry.workItem)}${entry.surface ? ` [${entry.surface.paths.length} paths, ${entry.surface.resources.length} resources]` : " [legacy surface unknown; global conflict]"}`);
      for (const surfacePath of entry.surface?.paths ?? []) console.log(`  path: ${surfacePath}`);
      for (const resource of entry.surface?.resources ?? []) console.log(`  resource: ${resource}`);
    }
    if (result.state === "UNKNOWN") {
      console.error(result.reason);
      process.exitCode = 2;
    }
    return result;
  }
  if (command === "preview") {
    const result = preview(options);
    console.log(result.state);
    for (const conflict of result.conflicts ?? []) {
      const paths = conflict.paths.map((overlap) => `path ${overlap}`).join(", ");
      const resources = conflict.resources.map((overlap) => `resource ${overlap}`).join(", ");
      console.log(`${display(conflict.workItem)}: ${[paths, resources].filter(Boolean).join(", ")}`);
    }
    if (result.reason) console.error(result.reason);
    if (result.state === "UNKNOWN") process.exitCode = 2;
    return result;
  }
  const operation = { claim, revise, release, recover }[command];
  if (!operation) throw new OwnershipError("Operation must be status, preview, claim, revise, release, or recover.");
  const result = operation(options);
  console.log(result.state ? result.state : `${command === "revise" ? "REVISED" : "RESERVED"} ${display(result.workItem)}`);
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
