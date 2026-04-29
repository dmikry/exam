import { test, expect } from '@playwright/test';

test.describe('API Endpoint Tests', () => {

  test('/services endpoint should return an array of services', async ({ request }) => {
    const response = await request.get('/services');
    expect(response.ok()).toBeTruthy();

    const services = await response.json();
    expect(Array.isArray(services)).toBeTruthy();
    expect(services.length).toBeGreaterThan(0);

    expect(services[0]).toHaveProperty('id');
    expect(services[0]).toHaveProperty('name');
    expect(services[0]).toHaveProperty('provider');
    expect(services[0]).toHaveProperty('description');
  });

  test('/clients endpoint should return an array of clients', async ({ request }) => {
    const response = await request.get('/clients');
    expect(response.ok()).toBeTruthy();

    const clients = await response.json();
    expect(Array.isArray(clients)).toBeTruthy();

    expect(clients[0]).toHaveProperty('id');
    expect(clients[0]).toHaveProperty('name');
    expect(clients[0]).toHaveProperty('email');
  });

  test('POST /clients should create a new client', async ({ request }) => {
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

  test('POST /services should create a new service', async ({ request }) => {
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

  test('/subscriptions endpoint should return an array of subscriptions', async ({ request }) => {
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
