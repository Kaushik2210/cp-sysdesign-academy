/* Runs every reference solution against its test cases. Implemented fully in Phase 3. */
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content", "problems");
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")) : [];
console.log(`verify-solutions: ${files.length} problems found, nothing to verify yet.`);