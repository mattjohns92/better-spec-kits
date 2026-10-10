import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function choose(question, options, defaultIndex = 0) {
  const rl = readline.createInterface({ input, output });
  try {
    console.log(`\n${question}`);
    options.forEach((o, i) => console.log(`  ${i === defaultIndex ? "›" : " "} ${i + 1}. ${o}`));
    const answer = (await rl.question(`Choose [${defaultIndex + 1}]: `)).trim();
    if (!answer) return defaultIndex;
    const n = Number(answer);
    if (Number.isInteger(n) && n >= 1 && n <= options.length) return n - 1;
    return defaultIndex;
  } finally { rl.close(); }
}

export async function yesNo(question, defaultYes = true) {
  return (await choose(question, defaultYes ? ["Yes","No"] : ["No","Yes"], 0)) === 0;
}
