import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const states = new Set(["ON", "WAITING_FOR_USER", "STOP_REQUESTED", "BLOCKED", "STOPPED", "DONE", "OFF"]);
const controlFields = new Set(["version", "state", "workItem", "sessionId", "reason"]);

function off(reason) {
  return { version: 1, state: "OFF", workItem: null, sessionId: null, reason };
}

function validWorkItem(workItem) {
  if (!workItem || typeof workItem !== "object" || Array.isArray(workItem)) return false;
  if (workItem.type === "feature") {
    return Object.keys(workItem).sort().join(",") === "directory,type" && typeof workItem.directory === "string" && /^specs\/\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workItem.directory);
  }
  if (workItem.type === "quick") {
    return Object.keys(workItem).sort().join(",") === "id,type" && typeof workItem.id === "string" && /^Q\d{3,}$/.test(workItem.id);
  }
  if (workItem.type === "bug") {
    return Object.keys(workItem).sort().join(",") === "id,type" && typeof workItem.id === "string" && /^B\d{3,}$/.test(workItem.id);
  }
  return false;
}

function validState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) return false;
  if (Object.keys(state).some((key) => !controlFields.has(key))) return false;
  if (state.version !== 1 || !states.has(state.state)) return false;
  if (state.state !== "OFF" && !validWorkItem(state.workItem)) return false;
  if (state.state === "OFF" && state.workItem !== null) return false;
  if (state.sessionId !== null && (typeof state.sessionId !== "string" || state.sessionId.length > 512)) return false;
  if (state.reason !== undefined && (typeof state.reason !== "string" || state.reason.length > 300)) return false;
  return true;
}

function controlPath(projectRoot) {
  return path.join(projectRoot, ".specify", "auto-mode.json");
}

export function loadAutoState(projectRoot) {
  const file = controlPath(projectRoot);
  if (!fs.existsSync(file)) return off("control-record-missing");

  try {
    const state = JSON.parse(fs.readFileSync(file, "utf8"));
    return validState(state) ? state : off("control-record-invalid");
  } catch {
    return off("control-record-invalid");
  }
}

export function saveAutoState(projectRoot, state) {
  if (!validState(state)) throw new TypeError("Invalid Auto Mode control state.");
  const file = controlPath(projectRoot);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  return state;
}

function eventName(event) {
  return event?.hook_event_name ?? event?.event;
}

export function decideAgentStop(event, state) {
  if (!validState(state) || state.state !== "ON") return { decision: "allow" };
  if (!event || !["Stop", "agentStop"].includes(eventName(event))) return { decision: "allow" };

  const sessionId = event.session_id ?? event.sessionId;
  if (typeof sessionId !== "string" || !sessionId) return { decision: "allow" };
  if (state.sessionId && state.sessionId !== sessionId) return { decision: "allow" };

  const decision = {
    decision: "block",
    reason:
      "Auto Mode is ON for the selected work item. Continue only through deterministic authoritative stages; stop for any human decision, blocker, stop request, unsupported transition, or non-progressing remediation.",
  };
  if (!state.sessionId) decision.bindSessionId = sessionId;
  return decision;
}

export function sessionStartContext(event, state) {
  if (!validState(state) || state.state !== "ON" || !["SessionStart", "sessionStart"].includes(eventName(event))) return {};
  const item = state.workItem.type === "feature" ? state.workItem.directory : state.workItem.id;
  return {
    additionalContext: `Auto Mode is ON for ${item}. Do not start work from this hook alone. Only continue when the user's prompt applies to this selected work item; if the prior question or run context is unavailable, report the exact manual continuation instead of guessing.`,
  };
}

function runHook() {
  let event;
  try {
    event = JSON.parse(fs.readFileSync(0, "utf8"));
  } catch {
    process.stdout.write("{}");
    return;
  }

  const projectRoot = typeof event.cwd === "string" ? path.resolve(event.cwd) : process.cwd();
  const state = loadAutoState(projectRoot);
  let output;

  if (["SessionStart", "sessionStart"].includes(eventName(event))) {
    output = sessionStartContext(event, state);
  } else {
    output = decideAgentStop(event, state);
    if (output.bindSessionId) {
      const { bindSessionId, ...decision } = output;
      try {
        saveAutoState(projectRoot, { ...state, sessionId: bindSessionId });
        output = decision;
      } catch {
        output = { decision: "allow" };
      }
    }
  }

  process.stdout.write(JSON.stringify(output));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runHook();
