import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { decideAgentStop, loadAutoState, saveAutoState, sessionStartContext } from "../hooks/speckit-auto.mjs";

function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bsk-auto-mode-"));
  fs.mkdirSync(path.join(root, ".specify"), { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function activeState(overrides = {}) {
  return {
    version: 1,
    state: "ON",
    workItem: { type: "feature", directory: "specs/024-auto-mode-workflow-progression" },
    sessionId: "session-1",
    ...overrides,
  };
}

test("missing control state fails safe to OFF", (t) => {
  const root = project(t);
  const state = loadAutoState(root);

  assert.equal(state.state, "OFF");
  assert.equal(state.workItem, null);
  assert.equal(state.reason, "control-record-missing");
});

test("malformed and unsupported control state fail safe to OFF", (t) => {
  const root = project(t);
  const statePath = path.join(root, ".specify/auto-mode.json");
  fs.writeFileSync(statePath, "{not-json", "utf8");
  assert.equal(loadAutoState(root).state, "OFF");
  fs.writeFileSync(statePath, JSON.stringify({ version: 99, state: "ON" }), "utf8");
  assert.equal(loadAutoState(root).state, "OFF");
  fs.writeFileSync(statePath, JSON.stringify({ version: 1, state: "ON", workItem: { type: "feature", directory: "../../outside" } }), "utf8");
  assert.equal(loadAutoState(root).state, "OFF");
});

test("valid selected-work control state round-trips only Auto control fields", (t) => {
  const root = project(t);
  const expected = activeState();

  saveAutoState(root, expected);

  assert.deepEqual(loadAutoState(root), expected);
  const saved = JSON.parse(fs.readFileSync(path.join(root, ".specify/auto-mode.json"), "utf8"));
  assert.deepEqual(Object.keys(saved).sort(), ["sessionId", "state", "version", "workItem"].sort());
});

test("agentStop only blocks for the active matching session", () => {
  const event = { hook_event_name: "Stop", session_id: "session-1", stop_reason: "end_turn", stop_hook_active: false };

  assert.equal(decideAgentStop(event, activeState()).decision, "block");
  assert.equal(decideAgentStop(event, activeState({ state: "OFF" })).decision, "allow");
  assert.equal(decideAgentStop({ ...event, session_id: "session-2" }, activeState()).decision, "allow");
  assert.equal(decideAgentStop({ ...event, stop_hook_active: true }, activeState()).decision, "block");
  assert.equal(decideAgentStop(event, activeState({ state: "WAITING_FOR_USER" })).decision, "allow");
  assert.equal(decideAgentStop(event, activeState({ state: "STOP_REQUESTED" })).decision, "allow");
  assert.equal(decideAgentStop({ hook_event_name: "Stop" }, activeState()).decision, "allow");
});

test("sessionStart adds context without requesting a stage invocation", () => {
  const idle = sessionStartContext({}, { state: "OFF" });
  assert.deepEqual(idle, {});

  const active = sessionStartContext({ hook_event_name: "SessionStart", session_id: "session-2" }, activeState());
  assert.match(active.additionalContext, /Auto Mode is ON/);
  assert.match(active.additionalContext, /specs\/024-auto-mode-workflow-progression/);
  assert.match(active.additionalContext, /only continue when the user's prompt applies to this selected work item/i);
  assert.equal(active.prompt, undefined);
});
