import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const manifestPath = (project) => path.join(project, ".specify", "extensions", "bug", "extension.yml");
const expectedRepository = "https://github.com/github/spec-kit";
const expectedCommands = ["speckit.bug.assess", "speckit.bug.fix", "speckit.bug.test"];

function runNative(args, project) {
  const result = spawnSync("specify", args, { cwd: project, encoding: "utf8", windowsHide: true });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.error?.message ?? result.stderr ?? "",
  };
}

function partial(message) {
  return { state: "partial", available: false, message };
}

function version(value) {
  const match = String(value).match(/(\d+)\.(\d+)\.(\d+)/);
  return match ? match.slice(1).map(Number) : null;
}

function atLeast(actual, minimum) {
  for (let index = 0; index < actual.length; index++) {
    if (actual[index] !== minimum[index]) return actual[index] > minimum[index];
  }
  return true;
}

function readManifest(project) {
  const file = manifestPath(project);
  if (!fs.existsSync(file)) return null;
  try {
    return parse(fs.readFileSync(file, "utf8"));
  } catch {
    return undefined;
  }
}

function validateManifest(manifest, specifyVersion) {
  if (!manifest || manifest.extension?.id !== "bug") return "The installed extension manifest does not identify Bug.";
  if (manifest.extension.repository !== expectedRepository) return "The Bug extension source is not the official github/spec-kit repository.";
  if (!version(manifest.extension.version)) return "The Bug extension version could not be verified.";
  const minimum = String(manifest.requires?.speckit_version ?? "").match(/^>=(\d+)\.(\d+)\.(\d+)$/);
  if (!minimum || !atLeast(specifyVersion, minimum.slice(1).map(Number))) return "The Bug extension's Spec Kit compatibility requirement could not be verified or is not met.";
  const commands = manifest.provides?.commands;
  if (!Array.isArray(commands) || expectedCommands.some((name) => !commands.some((command) => command.name === name))) {
    return "The Bug extension manifest does not declare all expected Assess, Fix, and Test commands.";
  }
  return null;
}

function extensionListState(output) {
  if (/\bno extensions installed\b/i.test(output)) return { state: "absent", commandCount: 0 };
  const block = output.split(/\r?\n(?:\s*\r?\n)+/).find((entry) => entry.split(/\r?\n/).some((line) => line.trim() === "bug"));
  if (!block) return { state: "absent", commandCount: 0 };
  const status = block.match(/Status:\s*(Enabled|Disabled)\b/i)?.[1]?.toLowerCase() ?? "unknown";
  const commandCount = Number(block.match(/Commands:\s*(\d+)/i)?.[1] ?? 0);
  return { state: status, commandCount };
}

function extensionInfo(runCommand, project) {
  return runCommand(["extension", "info", "bug"], project);
}

function inspectCurrent(project, runCommand) {
  if (!fs.existsSync(path.join(project, ".specify"))) {
    return { result: partial("Spec Kit is not initialized; initialize it, then run Better Spec Kit update to provision Bug.") };
  }

  const versionResult = runCommand(["--version"], project);
  const specifyVersion = version(versionResult.stdout);
  if (versionResult.status !== 0 || !specifyVersion) {
    return { result: partial(`The Spec Kit CLI version could not be verified: ${versionResult.stderr || versionResult.stdout || "specify is unavailable"}`) };
  }

  const existingManifest = readManifest(project);
  if (existingManifest === undefined) return { result: partial("The installed Bug manifest is invalid YAML; existing extension files were left untouched.") };
  if (existingManifest) {
    const problem = validateManifest(existingManifest, specifyVersion);
    if (problem) return { result: partial(`${problem} Existing extension files were left untouched.`) };
  }

  const list = runCommand(["extension", "list"], project);
  if (list.status !== 0) return { result: partial(`Spec Kit could not inspect installed extensions: ${list.stderr || list.stdout || "extension list failed"}`) };
  const installed = extensionListState(list.stdout);

  if (existingManifest) {
    if (installed.state === "enabled" && installed.commandCount >= expectedCommands.length) {
      return { result: { state: "present-enabled", available: true, message: "The official Bug extension is installed and enabled; its version and files were preserved." } };
    }
    if (installed.state === "disabled") {
      return { result: { state: "present-disabled", available: false, message: "The official Bug extension is installed but disabled; it was left disabled." } };
    }
    return { result: partial("The official Bug extension is present, but its enabled state or registered commands could not be verified; it was left untouched.") };
  }

  if (installed.state !== "absent") {
    return { result: partial("Spec Kit did not confirm that Bug is absent; no installation was attempted to avoid replacing existing state.") };
  }

  return {
    result: { state: "absent", available: false, message: "The official Bug extension is not installed." },
    specifyVersion,
  };
}

export function inspectBug({ project, runCommand = runNative }) {
  return inspectCurrent(project, runCommand).result;
}

export function provisionBug({ project, runCommand = runNative }) {
  const current = inspectCurrent(project, runCommand);
  if (current.result.state !== "absent") return current.result;
  const { specifyVersion } = current;

  const info = extensionInfo(runCommand, project);
  if (info.status !== 0) return partial(`Spec Kit could not inspect the Bug extension: ${info.stderr || info.stdout || "extension info failed"}`);

  const catalogVersion = version(info.stdout);
  if (!/^ID:\s*bug\s*$/im.test(info.stdout) || !info.stdout.includes(expectedRepository) || !catalogVersion) {
    return partial("The Bug catalog entry could not be verified as the official extension; nothing was installed.");
  }
  if (!atLeast(specifyVersion, [0, 9, 0])) {
    return partial("The installed Spec Kit version is older than the official Bug extension minimum (0.9.0).");
  }

  const add = runCommand(["extension", "add", "bug"], project);
  if (add.status !== 0) return partial(`Native Bug provisioning failed: ${add.stderr || add.stdout || `specify exited with code ${add.status}`}`);

  const installedManifest = readManifest(project);
  if (installedManifest === undefined) return partial("The native installer produced an invalid Bug manifest; Better Spec Kit remains installed.");
  if (!installedManifest) return partial("The native installer reported success but did not produce a public Bug manifest; provisioning is unverified.");
  const problem = validateManifest(installedManifest, specifyVersion);
  if (problem) return partial(`${problem} Better Spec Kit remains installed.`);

  const after = runCommand(["extension", "list"], project);
  if (after.status !== 0 || extensionListState(after.stdout).state !== "enabled" || extensionListState(after.stdout).commandCount < expectedCommands.length) {
    return partial("The Bug extension was added, but its enabled state or active integration registration could not be verified.");
  }

  return { state: "provisioned", available: true, message: `Official Bug extension v${installedManifest.extension.version} was provisioned and enabled by Spec Kit.` };
}
