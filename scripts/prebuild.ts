/* Runs before `next build`: validates content, then generates search index, sitemap and stats. */
import { spawnSync } from "node:child_process";

for (const script of ["validate-content", "gen-search-index", "gen-sitemap"]) {
  const r = spawnSync("pnpm", ["exec", "tsx", `scripts/${script}.ts`], { stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
