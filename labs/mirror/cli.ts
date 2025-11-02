
import { parsePSIR } from "@metabuilder/shared/psir/index.js";
import { crossover } from "@metabuilder/shared/genesis/index.js";
import { readFileSync } from "node:fs";
import { argv } from "node:process";

console.log("Mirror Lab");
const idx = argv.indexOf("--file");
if (idx < 0 || !argv[idx + 1]) {
  console.log("Usage: mirror-lab --file <path-to-psir>");
  process.exit(1);
}
const filename = argv[idx + 1];
const ast = parsePSIR(readFileSync(filename, "utf8"));
console.log("System:", ast.name);
console.log("Entities:", ast.entities.length);
// Example: produce crossover with self to show deduping
const hybrid = crossover(ast, ast);
console.log("Hybrid name:", hybrid.name);
console.log("Total entities:", hybrid.entities.length);
