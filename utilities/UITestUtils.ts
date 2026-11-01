import { test as base_test, expect } from "@playwright/test";

// Extends the base test so every test starts on the configured base URL
// (use.baseURL in playwright.config.ts, selected by evn).
export const test = base_test.extend({
  page: async ({ page, baseURL }, use) => {
    if (!baseURL) {
      throw new Error("baseURL is not configured; check playwright.config.ts.");
    }
    await page.goto(baseURL);
    await use(page);
  },
});

export { expect };
