import { NavigationPage } from "../../pages/NavigationPage";
import { test, expect } from "../../utilities/UITestUtils";

test.describe("EPIC-02 | Navigation | Nav Links @navigation @smoke", () => {

  let navPage: NavigationPage;

  test.beforeEach(async ({ page }) => {
    navPage = new NavigationPage(page);
    
  });

  test("TC-10 | Login link is present in nav", { tag: "@homepage" }, async ({ page }) => {
    await expect(navPage.loginLink).toBeVisible();
  });

  test("TC-11 | 'Open an account' link is present in nav", { tag: "@homepage" }, async ({ page }) => {
    await expect(navPage.openAccountLink).toBeVisible();
  });

  test("TC-12 | Clicking Login navigates to login page", { tag: "@homepage" }, async ({ page }) => {
    await navPage.clickLogin();
    await expect(page).toHaveURL(/login/);
  });

});
