import { HomePage } from "../../pages/HomePage";
import { test, expect } from "../../utilities/UITestUtils";

test.describe("EPIC-01 | Home Page | Page Load @homepage @smoke", () => {

  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test("TC-01 | Page title contains 'Empower'", async ({ page }) => {
    await expect(page).toHaveTitle(/Empower/);
  });

  test("TC-02 | h2 heading is visible on load", async ({ page }) => {
    await expect(homePage.heroHeading).toBeVisible();
  });

});
