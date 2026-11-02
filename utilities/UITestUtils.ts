import { test as base_test, expect } from "@playwright/test";

// Extends the base test so every test starts on the configured base URL
// (use.baseURL in playwright.config.ts, selected by evn).
//
// Known limitation: tests that go straight to another route (the login-options
// spec, TC-25, TC-28 and TC-30 open /login-v1) still load the home page first.
// That looks redundant, but whether it sets cookies, consent or other state the
// login page relies on cannot be shown from source; confirm it in a browser run
// against an authorized target before removing it.
export const test = base_test.extend({
  page: async ({ page, baseURL }, use) => {
    if (!baseURL) {
      throw new Error("baseURL is not configured; check playwright.config.ts.");
    }
    // Fail setup when the home page itself does not load, so tests never run
    // against an error page. Messages report the status only, never the URL.
    const response = await page.goto(baseURL);
    if (!response) {
      throw new Error("Home page navigation returned no response.");
    }
    if (!response.ok()) {
      throw new Error(`Home page navigation failed with HTTP ${response.status()}.`);
    }
    await use(page);
  },
});

export { expect };
