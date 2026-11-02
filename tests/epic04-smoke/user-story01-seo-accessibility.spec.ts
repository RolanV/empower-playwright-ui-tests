import { HomePage } from "../../pages/HomePage";
import { test, expect } from "../../utilities/UITestUtils";
import { ERROR_SIGNATURES } from "../../utilities/errorSignatures";


test.describe("EPIC-04 | Smoke | SEO @smoke @seo", () => {

  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test("TC-23 | Home page has meta description with meaningful content", async ({ page }) => {
    const content = await homePage.getMetaDescriptionContent();
    expect(content, "Home page has no meta description content").not.toBeNull();
    // Trimmed, so leading/trailing whitespace cannot count toward the length.
    expect(content!.trim().length, "Meta description is shorter than 51 characters once trimmed").toBeGreaterThan(50);
  });

  test("TC-24 | Home page has og:title set for social sharing", async ({ page }) => {
    const ogTitle = page.locator("meta[property='og:title']");
    const content = await ogTitle.getAttribute("content");
    expect(content, "og:title has no content attribute").not.toBeNull();
    expect(content!.trim(), "og:title content is empty or whitespace-only").not.toBe("");
  });

  test("TC-25 | Login page has canonical URL pointing to empower.com", async ({ page }) => {
    await page.goto("./login-v1");
    const canonical = page.locator("link[rel='canonical']");
    const href = await canonical.getAttribute("href");
    expect(href, "Login page has no canonical href").not.toBeNull();
    // Hostname comparison: a substring check would accept e.g. empower.com.attacker.example
    expect(new URL(href!, page.url()).hostname).toMatch(/(^|\.)empower\.com$/);
  });

});

test.describe("EPIC-04 | Smoke | Accessibility @smoke @accessibility", () => {

  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test("TC-27 | First 10 images on home page have alt attributes", async ({ page }) => {
    // Without this, a page with no images would pass because the loop never runs.
    // Web-first assertion: retries until an image is attached or the expect timeout ends.
    await expect(homePage.allImages, "Home page has no <img> elements to check").not.toHaveCount(0);
    const total = await homePage.getImageCount();
    const checkCount = Math.min(total, 10);

    for (let i = 0; i < checkCount; i++) {
      const alt = await homePage.getImageAlt(i);
      // alt="" is valid for decorative images; null/missing is not
      expect(alt, `Image at index ${i} is missing alt attribute`).not.toBeNull();
    }
  });

  test("TC-28 | Login page heading is visible and has text", async ({ page }) => {
    await page.goto("./login-v1");
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading, "Login page h1 has no non-whitespace text").toHaveText(/\S/);
  });

});

test.describe("EPIC-04 | Smoke | Security @smoke @security", () => {

  // TC-29 and TC-30 check only the scheme of the configured base URL and of the
  // final page URL, which would catch a redirect down to http. They do not test
  // http-to-https redirects, HSTS, TLS configuration or other security headers.
  test("TC-29 | Home page: base URL and final page URL both use https", async ({ page, baseURL }) => {
    expect(baseURL, "Security tests require an https base URL").toMatch(/^https:\/\//);
    expect(new URL(page.url()).protocol, "Home page ended on a non-https URL").toBe("https:");
  });

  test("TC-30 | Login page: base URL and final page URL both use https", async ({ page, baseURL }) => {
    expect(baseURL, "Security tests require an https base URL").toMatch(/^https:\/\//);
    await page.goto("./login-v1");
    expect(new URL(page.url()).protocol, "Login page ended on a non-https URL").toBe("https:");
  });

  // Checks visible body text for the specific markers in ERROR_SIGNATURES only.
  // It does not cover hidden markup, comments, headers, the console or other pages,
  // so it cannot establish the absence of all information disclosure.
  test("TC-31 | Home page body shows no stack-trace, uncaught-exception or SQL error markers", async ({ page }) => {
    const bodyText = await page.locator("body").innerText();
    const found = ERROR_SIGNATURES.filter(([, pattern]) => pattern.test(bodyText)).map(([label]) => label);
    expect(found, "Error markers found in visible home page text").toEqual([]);
  });

});
