
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { psir, appfactory } from "@metabuilder/shared";
import { argv } from "node:process";

function usage() {
  console.log("Usage: app-factory --file <path-to-psir>");
}

const idx = argv.indexOf("--file");
if (idx < 0 || !argv[idx + 1]) {
  usage();
  process.exit(1);
}
const file = argv[idx + 1];
const txt = readFileSync(file, "utf8");
const ast = psir.parsePSIR(txt);
// call optional validator if available (safe in TS environment)
if (typeof (psir as any).validatePSIR === "function") {
  (psir as any).validatePSIR(ast);
}
const assets = appfactory.generateHelloApp(ast);
for (const asset of assets) {
  const full = resolve(process.cwd(), asset.path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, asset.content, "utf8");
  console.log("Wrote", full);
}
console.log("Done. Generated", assets.length, "files.");
