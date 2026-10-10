import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { classifyFile, detectProject } from "../src/detect.js";

function temp() { return fs.mkdtempSync(path.join(os.tmpdir(), "bsk-test-")); }
function write(file, text) { fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file,text); }

test("detects Spec Kit and Better Spec Kit metadata", () => {
  const p=temp(); fs.mkdirSync(path.join(p,".specify"),{recursive:true});
  write(path.join(p,".specify","better-spec-kit.json"),"{}");
  assert.equal(detectProject(p).specKit,true);
  assert.equal(detectProject(p).betterSpecKit,true);
});

test("new destination is classified new", () => {
  const p=temp(), pkg=temp(); write(path.join(pkg,"x"),"new");
  assert.equal(classifyFile(p,pkg,"x",".github/skills/speckit-plan/SKILL.md"),"new");
});

test("unknown managed content requires review", () => {
  const p=temp(), pkg=temp(); write(path.join(pkg,"x"),"new");
  write(path.join(p,".github/skills/speckit-plan/SKILL.md"),"my completely custom workflow");
  assert.equal(classifyFile(p,pkg,"x",".github/skills/speckit-plan/SKILL.md"),"custom");
});

test("upstream-looking skill is still treated as custom without a verified checksum", () => {
  const p=temp(), pkg=temp(); write(path.join(pkg,"x"),"new");
  write(path.join(p,".github/skills/speckit-plan/SKILL.md"),"---\nname: speckit-plan\ndescription: Spec Kit planning\n---\n");
  assert.equal(classifyFile(p,pkg,"x",".github/skills/speckit-plan/SKILL.md"),"custom");
});
