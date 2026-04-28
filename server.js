const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- In-Memory Data Stores ---
const clients_db = {};
const services_db = {};
const subscriptions_db = {};

// Pre-populate data
const servicesData = [
    { name: "GPT-4", description: "Large Multimodal Model", provider: "OpenAI" },
    { name: "Claude 3 Opus", description: "Advanced Reasoning Model", provider: "Anthropic" },
    { name: "Gemini 1.5 Pro", description: "Multimodal AI", provider: "Google" },
    { name: "Midjourney v6", description: "Image Generation", provider: "Midjourney" }
];

servicesData.forEach(s => {
    const id = uuidv4();
    services_db[id] = { id, ...s };
});

const clientsData = [
    { name: "Dmytro Krylov", email: "dmytro@example.com" },
    { name: "Alice Smith", email: "alice@example.com" },
    { name: "Bob Johnson", email: "bob@example.com" },
    { name: "Eva Green", email: "eva@example.com" }
];

clientsData.forEach(c => {
    const id = uuidv4();
    clients_db[id] = { id, ...c };
});

const s_ids = Object.keys(services_db);
const c_ids = Object.keys(clients_db);

// Assign random subscriptions
c_ids.forEach((c_id, index) => {
    const sub_id = uuidv4();
    subscriptions_db[sub_id] = {
        id: sub_id,
        client_id: c_id,
        service_id: s_ids[index % s_ids.length], // distribute evenly
        tier: index % 2 === 0 ? "Pro" : "Basic",
        active_since: new Date().toISOString()
    };
});

// --- Frontend Endpoint ---
app.get('/', (req, res) => {
    const clients = Object.values(clients_db);
    const services = Object.values(services_db);
    const subscriptions = Object.values(subscriptions_db);

    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>AI Services Dashboard</title>
        <style>
            body { font-family: system-ui, sans-serif; padding: 20px; background-color: #f4f4f9; color: #333; }
            h1 { color: #2c3e50; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 30px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #3498db; color: white; }
            tr:hover { background-color: #f5f5f5; }
        </style>
    </head>
    <body>
        <h1>AI Services Dashboard</h1>
        
        <h2>Clients & Subscriptions</h2>
        <table>
            <tr>
                <th>Client Name</th>
                <th>Email</th>
                <th>Subscribed Service</th>
                <th>Provider</th>
                <th>Tier</th>
            </tr>`;

    clients.forEach(client => {
        const clientSubs = subscriptions.filter(sub => sub.client_id === client.id);
        if (clientSubs.length > 0) {
            clientSubs.forEach(sub => {
                const service = services_db[sub.service_id];
                html += `
                <tr>
                    <td>${client.name}</td>
                    <td>${client.email}</td>
                    <td>${service ? service.name : 'Unknown'}</td>
                    <td>${service ? service.provider : 'Unknown'}</td>
                    <td>${sub.tier}</td>
                </tr>`;
            });
        } else {
            html += `
                <tr>
                    <td>${client.name}</td>
                    <td>${client.email}</td>
                    <td colspan="3">No subscriptions</td>
                </tr>`;
        }
    });

    html += `
        </table>

        <h2>Available AI Services</h2>
        <table>
            <tr>
                <th>Service Name</th>
                <th>Provider</th>
                <th>Description</th>
            </tr>`;
            
    services.forEach(service => {
        html += `
            <tr>
                <td>${service.name}</td>
                <td>${service.provider}</td>
                <td>${service.description}</td>
            </tr>`;
    });

    html += `
        </table>
    </body>
    </html>`;

    res.send(html);
});

// --- Endpoints: Clients ---

app.post('/clients', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
    }
    const client_id = uuidv4();
    const new_client = { id: client_id, name, email };
    clients_db[client_id] = new_client;
    res.status(201).json(new_client);
});

app.get('/clients', (req, res) => {
    res.json(Object.values(clients_db));
});

app.get('/clients/:client_id', (req, res) => {
    const client = clients_db[req.params.client_id];
    if (!client) {
        return res.status(404).json({ error: "Client not found" });
    }
    res.json(client);
});

// --- Endpoints: AI Services ---

app.post('/services', (req, res) => {
    const { name, description, provider } = req.body;
    if (!name || !description || !provider) {
        return res.status(400).json({ error: "Name, description, and provider are required" });
    }
    const service_id = uuidv4();
    const new_service = { id: service_id, name, description, provider };
    services_db[service_id] = new_service;
    res.status(201).json(new_service);
});

app.get('/services', (req, res) => {
    res.json(Object.values(services_db));
});

// --- Endpoints: Subscriptions ---

app.post('/subscriptions', (req, res) => {
    const { client_id, service_id, tier } = req.body;
    
    if (!clients_db[client_id]) {
        return res.status(404).json({ error: "Client not found" });
    }
    if (!services_db[service_id]) {
        return res.status(404).json({ error: "Service not found" });
    }
    if (!tier) {
        return res.status(400).json({ error: "Tier is required" });
    }

    const sub_id = uuidv4();
    const new_sub = {
        id: sub_id,
        client_id,
        service_id,
        tier,
        active_since: new Date().toISOString()
    };
    subscriptions_db[sub_id] = new_sub;
    res.status(201).json(new_sub);
});

app.get('/subscriptions', (req, res) => {
    res.json(Object.values(subscriptions_db));
});

app.get('/clients/:client_id/subscriptions', (req, res) => {
    const { client_id } = req.params;
    if (!clients_db[client_id]) {
        return res.status(404).json({ error: "Client not found" });
    }
    
    const client_subs = Object.values(subscriptions_db).filter(sub => sub.client_id === client_id);
    res.json(client_subs);
});

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
