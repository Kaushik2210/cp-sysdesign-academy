import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig keeps JSX as "preserve" for Next.js; vitest (Vite 8, oxc) needs it transformed to import .tsx modules.
  oxc: { jsx: { runtime: "automatic" } },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["tests/**/*.test.ts"],
    // Playwright specs live in e2e/ and are run by `pnpm e2e`.
    exclude: ["e2e/**", "node_modules/**", "out/**", ".next/**"],
  },
});