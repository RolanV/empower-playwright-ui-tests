import { FrameLocator, Locator, Page } from '@playwright/test';

export class BasePage {

  // Each page object owns the Playwright Page it was created with.
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  protected frameLocator(selector: string): FrameLocator {
    return this.page.frameLocator(selector);
  }

}
