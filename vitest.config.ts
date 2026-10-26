import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig keeps JSX as "preserve" for Next.js; vitest needs it transformed to import .tsx modules.
  esbuild: { jsx: "automatic" },
  test: {
    include: ["tests/**/*.test.ts"],
    // Playwright specs live in e2e/ and are run by `pnpm e2e`.
    exclude: ["e2e/**", "node_modules/**", "out/**", ".next/**"],
  },
});