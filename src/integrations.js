import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const browserDependencies = {
  "@playwright/test": "Playwright dependency",
  playwright: "Playwright dependency",
  cypress: "Cypress dependency",
};

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

export function runtimeCapabilityStatus(project) {
  const projectSignals = [];
  const unknownSignals = [];

  try {
    const rootFiles = fs.readdirSync(project);
    if (rootFiles.some((name) => name.startsWith("playwright.config."))) {
      projectSignals.push("Playwright config");
    }
    if (rootFiles.some((name) => name.startsWith("cypress.config."))) {
      projectSignals.push("Cypress config");
    }
  } catch {
    unknownSignals.push("project root could not be read");
  }

  const packageJson = path.join(project, "package.json");
  if (fs.existsSync(packageJson)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(packageJson, "utf8"));
      const dependencies = {
        ...manifest.dependencies,
        ...manifest.devDependencies,
        ...manifest.optionalDependencies,
      };
      for (const [name, label] of Object.entries(browserDependencies)) {
        if (Object.hasOwn(dependencies, name) && !projectSignals.includes(label)) {
          projectSignals.push(label);
        }
      }
    } catch {
      unknownSignals.push("package.json could not be parsed");
    }
  }

  return { projectSignals, unknownSignals, hostSession: "UNKNOWN" };
}
