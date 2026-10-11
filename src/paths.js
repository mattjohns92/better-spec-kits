import path from "node:path";
import os from "node:os";

export const managedFiles = [
  ["skills/speckit-design/SKILL.md", ".github/skills/speckit-design/SKILL.md"],
  ["skills/speckit-plan/SKILL.md", ".github/skills/speckit-plan/SKILL.md"],
  ["skills/speckit-tasks/SKILL.md", ".github/skills/speckit-tasks/SKILL.md"],
  ["skills/speckit-analyze/SKILL.md", ".github/skills/speckit-analyze/SKILL.md"],
  ["skills/speckit-implement/SKILL.md", ".github/skills/speckit-implement/SKILL.md"],
  ["skills/speckit-review/SKILL.md", ".github/skills/speckit-review/SKILL.md"],
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
