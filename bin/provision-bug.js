#!/usr/bin/env node
import path from "node:path";
import { provisionBug } from "../src/bug-extension.js";

const project = path.resolve(process.argv[2] ?? process.cwd());
const result = provisionBug({ project });
const report = result.available ? console.log : console.warn;
report(`Bug extension (${result.state}): ${result.message}`);
