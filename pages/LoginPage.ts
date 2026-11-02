import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  // Page Locators:
  // empower.com/login-v1 is a "choose your login path" page — no username/password fields.
  // It presents 5 distinct login options routing to different portals.
  public readonly pageHeading = this.locator("h1");
  public readonly allLoginButtons = this.locator("a:has-text('Log in')");
  public readonly workplaceLoginBtn = this.locator("a:has-text('Log in')").nth(0);
  public readonly personalDashboardBtn = this.locator("a:has-text('Log in')",).nth(1);
  public readonly individualAccountBtn = this.locator("a:has-text('Log in')",).nth(2);

  // Page Actions:
  public async getLoginOptionCount(): Promise<number> {
    return this.allLoginButtons.count();
  }

  public async getWorkplaceLoginHref(): Promise<string | null> {
    return this.workplaceLoginBtn.getAttribute("href");
  }

  public async getPersonalDashboardHref(): Promise<string | null> {
    return this.personalDashboardBtn.getAttribute("href");
  }

  public async getIndividualAccountHref(): Promise<string | null> {
    return this.individualAccountBtn.getAttribute("href");
  }
}
