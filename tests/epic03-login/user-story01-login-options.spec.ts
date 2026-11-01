import { LoginPage } from "../../pages/LoginPage";
import { test, expect } from "../../utilities/UITestUtils";

test.describe("EPIC-03 | Login Page | Login Options @login @smoke", () => {

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    await page.goto("./login-v1");
    await page.waitForLoadState("domcontentloaded");
    loginPage = new LoginPage(page);
  });

  test("TC-18 | Login selection page heading is visible", async ({ page }) => {
    await expect(loginPage.pageHeading).toBeVisible();
  });

  test("TC-19 | Login page displays 5 login options", async ({ page }) => {
    const count = await loginPage.getLoginOptionCount();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("TC-20 | Workplace login routes to empower-retirement portal", async ({ page }) => {
    const href = await loginPage.getWorkplaceLoginHref();
    expect(href, "Workplace login link has no href").not.toBeNull();
    // Compare the parsed hostname rather than a substring of the whole URL:
    // a substring check would also accept https://attacker.example/?next=empower-retirement.com
    expect(new URL(href!, page.url()).hostname).toMatch(/(^|\.)empower-retirement\.com$/);
  });

  test("TC-21 | Personal Dashboard login routes to expected portal", async ({ page }) => {
    const href = await loginPage.getPersonalDashboardHref();
    expect(href).toMatch(/personalcapital|empower-retirement/);
  });

  test("TC-22 | Individual account login routes to empower-retirement portal", async ({ page }) => {
    const href = await loginPage.getIndividualAccountHref();
    expect(href, "Individual account login link has no href").not.toBeNull();
    expect(new URL(href!, page.url()).hostname).toMatch(/(^|\.)empower-retirement\.com$/);
  });

});
