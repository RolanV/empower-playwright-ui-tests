import { BasePage } from "./BasePage";

export class NavigationPage extends BasePage {

  // Page Locators:
  public readonly loginLink        = this.locator("(//span[@class='z-10'])[1]");
  public readonly openAccountLink  = this.locator("text=Open an account").first();

  // Page Actions:
  public async clickLogin() {
    await this.loginLink.click();
  }

}
