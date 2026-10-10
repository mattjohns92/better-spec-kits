import path from "node:path";
import { exists, hash } from "./io.js";
import { managedFiles, metadataPath } from "./paths.js";

export function detectProject(project) {
  return {
    path: project,
    specKit: exists(path.join(project, ".specify")),
    betterSpecKit: exists(metadataPath(project)),
    constitution: exists(path.join(project, ".specify", "memory", "constitution.md")),
  };
}

export function classifyFile(project, packageRoot, sourceRel, destinationRel) {
  const source = path.join(packageRoot, sourceRel);
  const destination = path.join(project, destinationRel);
  if (!exists(destination)) return "new";
  if (hash(source) === hash(destination)) return "current";

  // Never infer ownership from keywords or frontmatter: these are easy to
  // preserve in a customised skill. Only byte-identical files are safe to skip.
  // Until upstream release checksums are bundled, replacements need approval.
  return "custom";
}

export function buildPlan(project, packageRoot) {
  return managedFiles.map(([sourceRel, destinationRel]) => ({
    sourceRel, destinationRel,
    classification: classifyFile(project, packageRoot, sourceRel, destinationRel),
  }));
}
