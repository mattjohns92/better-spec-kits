import { spawnSync } from "node:child_process";

function has(command) {
  const result = spawnSync(command, ["--version"], { stdio: "ignore", shell: process.platform === "win32" });
  return result.status === 0;
}
export function integrationStatus() {
  return {
    copilotCli: has("copilot"),
    npx: has("npx"),
  };
}
