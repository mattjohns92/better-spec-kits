import path from "node:path";
import os from "node:os";

export const managedFiles = [
  ["skills/speckit-auto/SKILL.md", ".github/skills/speckit-auto/SKILL.md"],
  ["skills/speckit-design/SKILL.md", ".github/skills/speckit-design/SKILL.md"],
  ["skills/speckit-clarify/SKILL.md", ".github/skills/speckit-clarify/SKILL.md"],
  ["skills/speckit-plan/SKILL.md", ".github/skills/speckit-plan/SKILL.md"],
  ["skills/speckit-tasks/SKILL.md", ".github/skills/speckit-tasks/SKILL.md"],
  ["skills/speckit-analyze/SKILL.md", ".github/skills/speckit-analyze/SKILL.md"],
  ["skills/speckit-remediate/SKILL.md", ".github/skills/speckit-remediate/SKILL.md"],
  ["skills/speckit-implement/SKILL.md", ".github/skills/speckit-implement/SKILL.md"],
  ["skills/speckit-review/SKILL.md", ".github/skills/speckit-review/SKILL.md"],
  ["skills/speckit-summary/SKILL.md", ".github/skills/speckit-summary/SKILL.md"],
  ["skills/speckit-preview/SKILL.md", ".github/skills/speckit-preview/SKILL.md"],
  ["skills/speckit-preflight/SKILL.md", ".github/skills/speckit-preflight/SKILL.md"],
  ["skills/speckit-status/SKILL.md", ".github/skills/speckit-status/SKILL.md"],
  ["skills/speckit-release/SKILL.md", ".github/skills/speckit-release/SKILL.md"],
  ["skills/speckit-query/SKILL.md", ".github/skills/speckit-query/SKILL.md"],
  ["skills/speckit-scope/SKILL.md", ".github/skills/speckit-scope/SKILL.md"],
  ["skills/speckit-quick/SKILL.md", ".github/skills/speckit-quick/SKILL.md"],
  ["instructions/work-item-identity.instructions.md", ".github/instructions/work-item-identity.instructions.md"],
  ["instructions/shared-source-ownership.instructions.md", ".github/instructions/shared-source-ownership.instructions.md"],
  ["instructions/scope-handoffs.instructions.md", ".github/instructions/scope-handoffs.instructions.md"],
  ["instructions/speckit-specify-scope.instructions.md", ".github/instructions/speckit-specify-scope.instructions.md"],
  ["hooks/speckit-auto.json", ".github/hooks/speckit-auto.json"],
  ["hooks/speckit-auto.mjs", ".github/hooks/speckit-auto.mjs"],
  ["hooks/speckit-source-ownership.mjs", ".github/hooks/speckit-source-ownership.mjs"],
];

export function metadataPath(project) {
  return path.join(project, ".specify", "better-spec-kit.json");
}

export function backupBase() {
  if (process.platform === "win32" && process.env.LOCALAPPDATA) {
    return path.join(process.env.LOCALAPPDATA, "BetterSpecKit", "backups");
  }
  return path.join(os.homedir(), ".better-spec-kit", "backups");
}
