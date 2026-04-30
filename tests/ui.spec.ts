import { test, expect } from '@playwright/test';

test.describe('LLM Aggregator UI Tests @UI', () => {

  test('should display the product branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('LLM Aggregator');
    await expect(page.locator('p.subtitle')).toContainText('model comparison');
  });

  test('should update price when selecting a different model', async ({ page }) => {
    await page.goto('/');
    
    // Select GPT-4o (should be default or first)
    const modelSelect = page.locator('#modelSelect');
    await modelSelect.selectOption({ label: 'GPT-4o' });
    
    // Check price
    await expect(page.locator('#inputPrice')).toHaveText('$5.00');
    await expect(page.locator('#outputPrice')).toHaveText('$15.00');
    
    // Select Llama 3
    await modelSelect.selectOption({ label: 'Llama 3 (70B)' });
    await expect(page.locator('#inputPrice')).toHaveText('$0.65');
    await expect(page.locator('#outputPrice')).toHaveText('$2.75');
  });

  test('should render the Current Assignments table', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h2').filter({ hasText: 'Current Assignments' })).toBeVisible();
    
    const table = page.locator('table');
    const headers = table.locator('th');
    
    await expect(headers.nth(0)).toHaveText('User');
    await expect(headers.nth(1)).toHaveText('Model');
    await expect(headers.nth(2)).toHaveText('Provider');
    await expect(headers.nth(3)).toHaveText('Price (In/Out)');
    await expect(headers.nth(4)).toHaveText('Status');

    // Check mock data
    await expect(table).toContainText('Dmytro Krylov');
  });

  test('should allow assigning a model to a user', async ({ page }) => {
    await page.goto('/');
    
    // Select Alice Smith
    await page.locator('#userSelect').selectOption({ label: 'Alice Smith' });
    // Select Gemini 1.5 Pro
    await page.locator('#assignModelSelect').selectOption({ label: 'Gemini 1.5 Pro' });
    
    // Intercept reload or check toast
    await page.locator('button:has-text("Assign Model Now")').click();
    
    // Check for success toast
    const toast = page.locator('#toast');
    await expect(toast).toBeVisible();
    await expect(toast).toHaveText('Successfully assigned!');
  });
});
