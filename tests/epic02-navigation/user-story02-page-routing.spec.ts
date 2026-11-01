// These tests open each route directly, so they use Playwright's base `test`
// instead of the UITestUtils fixture, which would first load the home page and
// double the requests. No page object is used here, so BasePage wiring is not needed.
import { test, expect, type Response } from "@playwright/test";

// A branded error page can keep "Empower" in its <title>, so a title check alone
// would accept a 404 or 500 as success. page.goto() returns the main-document
// response (after redirects), which lets each test assert the HTTP status too.
function expectSuccessfulResponse(response: Response | null, path: string): void {
  expect(response, `${path}: navigation returned no response`).not.toBeNull();
  expect(response!.ok(), `${path}: unexpected HTTP ${response!.status()}`).toBe(true);
}

test.describe("EPIC-02 | Navigation | Page Routing @navigation @regression", () => {

  test("TC-13 | /tools page loads successfully", async ({ page }) => {
    const response = await page.goto(process.env.QA_URL + "/tools");
    expectSuccessfulResponse(response, "/tools");
    await expect(page).toHaveTitle(/Empower/);
  });

  test("TC-14 | /about-us page loads successfully", async ({ page }) => {
    const response = await page.goto(process.env.QA_URL + "/about-us");
    expectSuccessfulResponse(response, "/about-us");
    await expect(page).toHaveTitle(/Empower/);
  });

  test("TC-15 | /contact page loads successfully", async ({ page }) => {
    const response = await page.goto(process.env.QA_URL + "/contact");
    expectSuccessfulResponse(response, "/contact");
    await expect(page).toHaveTitle(/Empower/);
  });

  test("TC-16 | /privacy page loads successfully", async ({ page }) => {
    const response = await page.goto(process.env.QA_URL + "/privacy");
    expectSuccessfulResponse(response, "/privacy");
    await expect(page).toHaveTitle(/Empower/);
  });

  test("TC-17 | /login-v1 page loads successfully", async ({ page }) => {
    const response = await page.goto(process.env.QA_URL + "/login-v1");
    expectSuccessfulResponse(response, "/login-v1");
    await expect(page).toHaveTitle(/Login/i);
  });

});
