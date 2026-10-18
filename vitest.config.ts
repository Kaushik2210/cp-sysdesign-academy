import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // Playwright specs live in e2e/ and are run by `pnpm e2e`.
    exclude: ["e2e/**", "node_modules/**", "out/**", ".next/**"],
  },
});