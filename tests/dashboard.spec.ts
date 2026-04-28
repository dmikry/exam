import { test, expect } from '@playwright/test';

test.describe('AI Services API and Dashboard', () => {

  test('should display the main dashboard heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('AI Services Dashboard');
  });

  test('should render the Clients & Subscriptions table with data', async ({ page }) => {
    await page.goto('/');

    // Check heading
    await expect(page.locator('h2').filter({ hasText: 'Clients & Subscriptions' })).toBeVisible();

    // Verify table headers
    const clientsTable = page.locator('table').first();
    const headers = clientsTable.locator('th');

    await expect(headers.nth(0)).toHaveText('Client Name');
    await expect(headers.nth(1)).toHaveText('Email');
    await expect(headers.nth(2)).toHaveText('Subscribed Service');
    await expect(headers.nth(3)).toHaveText('Provider');
    await expect(headers.nth(4)).toHaveText('Tier');

    // Verify there are data rows (at least 1 header + mocked data rows)
    const rows = clientsTable.locator('tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(1);

    // Check that Dmytro Krylov is in the table (from our mock data)
    await expect(clientsTable).toContainText('Dmytro Krylov');
  });

  test('should render the Available AI Services table with data', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h2').filter({ hasText: 'Available AI Services' })).toBeVisible();

    const servicesTable = page.locator('table').nth(1);

    // Check if the table contains the mock services
    await expect(servicesTable).toContainText('GPT-4');
    await expect(servicesTable).toContainText('OpenAI');
    await expect(servicesTable).toContainText('Claude 3 Opus');
    await expect(servicesTable).toContainText('Gemini 1.5 Pro');
  });

  test('API: /services endpoint should return an array of services', async ({ request }) => {
    const response = await request.get('/services');
    expect(response.ok()).toBeTruthy();

    const services = await response.json();
    expect(Array.isArray(services)).toBeTruthy();
    expect(services.length).toBeGreaterThan(0);

    // Verify structure of the first service
    expect(services[0]).toHaveProperty('id');
    expect(services[0]).toHaveProperty('name');
    expect(services[0]).toHaveProperty('provider');
    expect(services[0]).toHaveProperty('description');
  });

  test('API: /clients endpoint should return an array of clients', async ({ request }) => {
    const response = await request.get('/clients');
    expect(response.ok()).toBeTruthy();

    const clients = await response.json();
    expect(Array.isArray(clients)).toBeTruthy();

    // Verify structure of the first client
    expect(clients[0]).toHaveProperty('id');
    expect(clients[0]).toHaveProperty('name');
    expect(clients[0]).toHaveProperty('email');
  });

  test('API: POST /clients should create a new client', async ({ request }) => {
    const newClient = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    const response = await request.post('/clients', {
      data: newClient
    });
    
    expect(response.status()).toBe(201);
    
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.name).toBe(newClient.name);
    expect(body.email).toBe(newClient.email);
  });

  test('API: POST /services should create a new service', async ({ request }) => {
    const newService = {
      name: 'Stable Diffusion 3',
      description: 'Open source image generation',
      provider: 'Stability AI'
    };

    const response = await request.post('/services', {
      data: newService
    });
    
    expect(response.status()).toBe(201);
    
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.name).toBe(newService.name);
    expect(body.provider).toBe(newService.provider);
  });

  test('API: /subscriptions endpoint should return an array of subscriptions', async ({ request }) => {
    const response = await request.get('/subscriptions');
    expect(response.ok()).toBeTruthy();

    const subs = await response.json();
    expect(Array.isArray(subs)).toBeTruthy();
    expect(subs.length).toBeGreaterThan(0);
    
    expect(subs[0]).toHaveProperty('id');
    expect(subs[0]).toHaveProperty('client_id');
    expect(subs[0]).toHaveProperty('service_id');
    expect(subs[0]).toHaveProperty('tier');
  });
});
