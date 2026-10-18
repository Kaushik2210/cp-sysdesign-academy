import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    // Locally use the installed Edge (no browser download); CI installs Chromium.
    channel: process.env.CI ? undefined : "msedge",
  },
  webServer: {
    command: "node scripts/serve-out.mjs 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});