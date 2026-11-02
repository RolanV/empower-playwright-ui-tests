import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  // Page Locators:
  public readonly heroHeading = this.locator("h2").first();
  public readonly footerPrivacyLink = this.locator("(//li[@class='flex flex-row gap-x-3'])[4]");
  public readonly footerContactLink = this.locator("text=Contact us").last();
  public readonly footerAboutLink = this.locator("text=About us").last();
  public readonly metaDescription = this.locator("meta[name='description']");
  public readonly allImages = this.locator("img");

  // Page Actions:
  public async clickFooterPrivacy() {
    await this.footerPrivacyLink.scrollIntoViewIfNeeded();
    await this.footerPrivacyLink.click();
  }

  public async getMetaDescriptionContent(): Promise<string | null> {
    return this.metaDescription.getAttribute("content");
  }

  public async getImageCount(): Promise<number> {
    return this.allImages.count();
  }

  public async getImageAlt(index: number): Promise<string | null> {
    return this.allImages.nth(index).getAttribute("alt");
  }
}
