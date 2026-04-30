import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';

test.describe('LLM Aggregator UI Tests @UI', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('should display the product branding', async () => {
    await expect(dashboard.heading).toHaveText('LLM Aggregator');
    await expect(dashboard.subtitle).toContainText('model comparison');
  });

  test('should update price when selecting a different model', async () => {
    // Select GPT-4o
    await dashboard.selectModelForInsight('GPT-4o');
    let prices = await dashboard.getPrice();
    expect(prices.input).toBe('$5.00');
    expect(prices.output).toBe('$15.00');

    // Select Llama 3
    await dashboard.selectModelForInsight('Llama 3 (70B)');
    prices = await dashboard.getPrice();
    expect(prices.input).toBe('$0.65');
    expect(prices.output).toBe('$2.75');
  });

  test('should render the Current Assignments table', async () => {
    await expect(dashboard.page.locator('h2').filter({ hasText: 'Current Assignments' })).toBeVisible();

    const headers = dashboard.assignmentsTable.locator('th');
    await expect(headers.nth(0)).toHaveText('User');
    await expect(headers.nth(1)).toHaveText('Model');
    await expect(headers.nth(2)).toHaveText('Provider');
    await expect(headers.nth(3)).toHaveText('Price (In/Out)');
    await expect(headers.nth(4)).toHaveText('Status');

    await expect(dashboard.assignmentsTable).toContainText('Dmytro Krylov');
  });

  test('should allow assigning a model to a user', async () => {
    await dashboard.assignModelToUser('Alice Smith', 'Gemini 1.5 Pro');

    // Check for success toast
    await expect(dashboard.toast).toBeVisible();
    await expect(dashboard.toast).toHaveText('Successfully assigned!');
  });
});
