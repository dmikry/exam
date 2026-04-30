import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly modelSelect: Locator;
  readonly inputPrice: Locator;
  readonly outputPrice: Locator;
  readonly modelDescription: Locator;
  readonly userSelect: Locator;
  readonly assignModelSelect: Locator;
  readonly assignButton: Locator;
  readonly toast: Locator;
  readonly assignmentsTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.subtitle = page.locator('p.subtitle');
    this.modelSelect = page.locator('#modelSelect');
    this.inputPrice = page.locator('#inputPrice');
    this.outputPrice = page.locator('#outputPrice');
    this.modelDescription = page.locator('#modelDesc');
    this.userSelect = page.locator('#userSelect');
    this.assignModelSelect = page.locator('#assignModelSelect');
    this.assignButton = page.locator('button:has-text("Assign Model Now")');
    this.toast = page.locator('#toast');
    this.assignmentsTable = page.locator('table');
  }

  async goto() {
    await this.page.goto('/');
  }

  async selectModelForInsight(label: string) {
    await this.modelSelect.selectOption({ label });
  }

  async assignModelToUser(userName: string, modelName: string) {
    await this.userSelect.selectOption({ label: userName });
    await this.assignModelSelect.selectOption({ label: modelName });
    await this.assignButton.click();
  }

  async getPrice() {
    const input = await this.inputPrice.innerText();
    const output = await this.outputPrice.innerText();
    return { input, output };
  }
}
