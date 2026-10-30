import fs from "node:fs";
import path from "node:path";
import { copy, ensureDir, exists, read, writeJson } from "./io.js";
import { backupBase, metadataPath } from "./paths.js";

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function ignoreOwnershipRecord(project) {
  const ignoreFile = path.join(project, ".specify", ".gitignore");
  const current = exists(ignoreFile) ? read(ignoreFile) : "";
  const required = ["source-ownership.json", "source-ownership.lock/"];
  const lines = current.split(/\r?\n/).map((line) => line.trim());
  const missing = required.filter((entry) => !lines.includes(entry));
  if (!missing.length) return;
  const lineEnding = current.includes("\r\n") ? "\r\n" : "\n";
  const prefix = current && !current.endsWith("\n") ? lineEnding : "";
  ensureDir(path.dirname(ignoreFile));
  fs.appendFileSync(ignoreFile, `${prefix}${missing.join(lineEnding)}${lineEnding}`, "utf8");
}

export function install({ project, packageRoot, plan, version, installConstitution = false, allowCustom = false }) {
  const custom = plan.filter(x => x.classification === "custom");
  if (custom.length && !allowCustom) {
    throw new Error("Customised/unknown managed files require explicit approval.");
  }

  ignoreOwnershipRecord(project);

  const changing = plan.filter(x => x.classification !== "current");
  const replacing = changing.filter(x => exists(path.join(project, x.destinationRel)));
  let backupRoot = null;

  if (replacing.length) {
    const projectName = path.basename(project).replace(/[^a-zA-Z0-9._-]/g, "_") || "project";
    backupRoot = path.join(backupBase(), projectName, stamp());
    for (const item of replacing) {
      copy(path.join(project, item.destinationRel), path.join(backupRoot, item.destinationRel));
    }
  }

  for (const item of changing) {
    copy(path.join(packageRoot, item.sourceRel), path.join(project, item.destinationRel));
  }

  if (installConstitution) {
    const src = path.join(packageRoot, "constitution", "constitution.md");
    const dst = path.join(project, ".specify", "memory", "constitution.md");
    if (exists(dst)) {
      backupRoot ??= path.join(backupBase(), path.basename(project), stamp());
      copy(dst, path.join(backupRoot, ".specify", "memory", "constitution.md"));
    }
    copy(src, dst);
  }

  // Keep the previous install record recoverable on updates.
  if (exists(metadataPath(project))) {
    backupRoot ??= path.join(backupBase(), path.basename(project), stamp());
    copy(metadataPath(project), path.join(backupRoot, ".specify", "better-spec-kit.json"));
  }

  writeJson(metadataPath(project), {
    name: "better-spec-kit",
    version,
    constitutionInstalled: installConstitution,
    installedAt: new Date().toISOString(),
  });

  return { changed: changing.length, backupRoot };
}
