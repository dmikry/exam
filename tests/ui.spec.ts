import { test, expect } from '@playwright/test';

test.describe('Dashboard UI Tests', () => {

  test('should display the main dashboard heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('AI Services Dashboard');
  });

  test('should render the Clients & Subscriptions table with data', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h2').filter({ hasText: 'Clients & Subscriptions' })).toBeVisible();

    const clientsTable = page.locator('table').first();
    const headers = clientsTable.locator('th');

    await expect(headers.nth(0)).toHaveText('Client Name');
    await expect(headers.nth(1)).toHaveText('Email');
    await expect(headers.nth(2)).toHaveText('Subscribed Service');
    await expect(headers.nth(3)).toHaveText('Provider');
    await expect(headers.nth(4)).toHaveText('Tier');

    const rows = clientsTable.locator('tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(1);

    await expect(clientsTable).toContainText('Dmytro Krylov');
  });

  test('should render the Available AI Services table with data', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h2').filter({ hasText: 'Available AI Services' })).toBeVisible();

    const servicesTable = page.locator('table').nth(1);

    await expect(servicesTable).toContainText('GPT-4');
    await expect(servicesTable).toContainText('OpenAI');
    await expect(servicesTable).toContainText('Claude 3 Opus');
    await expect(servicesTable).toContainText('Gemini 1.5 Pro');
  });
});
