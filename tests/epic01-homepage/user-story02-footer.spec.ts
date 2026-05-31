import { HomePage } from "../../pages/HomePage";
import { test, expect } from "../../utilities/UITestUtils";

test.describe("EPIC-01 | Home Page | Footer Links @homepage @regression", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test("TC-06 | Footer Privacy link is visible", async ({ page }) => {
    await homePage.footerPrivacyLink.scrollIntoViewIfNeeded();
    await expect(homePage.footerPrivacyLink).toBeVisible();
  });

  test("TC-07 | Footer Privacy link navigates to /privacy", async ({
    page,
  }) => {
    await homePage.clickFooterPrivacy();
    await expect(page).toHaveURL(/privacy/);
  });

  test("TC-08 | Footer Contact link is visible", async ({ page }) => {
    await homePage.footerContactLink.scrollIntoViewIfNeeded();
    await expect(homePage.footerContactLink).toBeVisible();
  });

  test("TC-09 | Footer About us link is visible", async ({ page }) => {
    await homePage.footerAboutLink.scrollIntoViewIfNeeded();
    await expect(homePage.footerAboutLink).toBeVisible();
  });
});
