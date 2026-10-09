import fs from "node:fs";
import path from "node:path";
import { problemSchema, type ProblemData } from "./problem";

const DIR = path.join(process.cwd(), "content", "problems");

export function getProblem(id: string): ProblemData {
  const file = path.join(DIR, `${id}.json`);
  if (!fs.existsSync(file)) throw new Error(`Unknown problem "${id}"`);
  const parsed = problemSchema.safeParse(JSON.parse(fs.readFileSync(file, "utf8")));
  if (!parsed.success) throw new Error(`Invalid problem ${id}: ${parsed.error.message}`);
  if (parsed.data.id !== id) throw new Error(`Problem file ${id}.json has id "${parsed.data.id}"`);
  return parsed.data;
}

export function getAllProblems(): ProblemData[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => getProblem(f.replace(/\.json$/, "")));
}
