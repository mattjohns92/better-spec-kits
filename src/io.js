import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

export function exists(file) { return fs.existsSync(file); }
export function read(file) { return fs.readFileSync(file, "utf8"); }
export function hash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
export function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
export function copy(source, destination) {
  ensureDir(path.dirname(destination));
  fs.copyFileSync(source, destination);
}
export function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}
