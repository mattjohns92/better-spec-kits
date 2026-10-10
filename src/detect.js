import path from "node:path";
import { exists, hash, read } from "./io.js";
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

  const text = read(destination);
  if (/Better Spec Kit|UI UX Pro Max|Ponytail/i.test(text)) return "better-spec-kit";

  // Conservative recognition: only known Spec Kit skill destinations can be upgraded
  // automatically. Unknown/custom files require explicit approval.
  const normalized = destinationRel.replaceAll("\\", "/");
  if (/^\.github\/skills\/speckit-(plan|tasks|implement)\/SKILL\.md$/.test(normalized)) {
    const looksLikeSkill = /^---[\s\S]*?(name|description):/m.test(text) || /speckit/i.test(text);
    if (looksLikeSkill) return "spec-kit";
  }
  return "custom";
}

export function buildPlan(project, packageRoot) {
  return managedFiles.map(([sourceRel, destinationRel]) => ({
    sourceRel, destinationRel,
    classification: classifyFile(project, packageRoot, sourceRel, destinationRel),
  }));
}
