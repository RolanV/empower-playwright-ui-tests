import { HomePage } from "../../pages/HomePage";
import { NavigationPage } from "../../pages/NavigationPage";
import { test, expect } from "../../utilities/UITestUtils";

test.describe("EPIC-01 | Home Page | Page Load @homepage @smoke", () => {

  let homePage: HomePage;
  let navPage: NavigationPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    navPage = new NavigationPage(page);
  });

  test("TC-01 | Page title contains 'Empower'", async ({ page }) => {
    await expect(page).toHaveTitle(/Empower/);
  });

  test("TC-02 | 2 heading is visible on load", async ({ page }) => {
    await expect(homePage.heroHeading).toBeVisible();
  });

  test("TC-03 | Login link is visible in navigation", async ({ page }) => {
    await expect(navPage.loginLink).toBeVisible();
  });

  test("TC-04 | 'Open an account' CTA is visible", async ({ page }) => {
    await expect(navPage.openAccountLink).toBeVisible();
  });

  test("TC-05 | Login link navigates to /login-v1", async ({ page }) => {
    await navPage.clickLogin();
    await expect(page).toHaveURL(/login/);
  });

});
