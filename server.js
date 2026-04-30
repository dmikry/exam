const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// --- In-Memory Data Stores ---
let clients_db = {};
let services_db = {};
let subscriptions_db = {};

// --- Persistence Helpers ---
function loadData() {
    if (fs.existsSync(DB_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            clients_db = data.clients || {};
            services_db = data.services || {};
            subscriptions_db = data.subscriptions || {};
            console.log('Data loaded from db.json');
        } catch (e) {
            console.error('Error loading data:', e);
            seedData();
        }
    } else {
        seedData();
    }
}

function saveData() {
    const data = {
        clients: clients_db,
        services: services_db,
        subscriptions: subscriptions_db
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function seedData() {
    console.log('Seeding initial data...');
    const servicesData = [
        { name: "GPT-4o", description: "OpenAI's most advanced multimodal model", provider: "OpenAI", inputPrice: 5.0, outputPrice: 15.0 },
        { name: "Claude 3.5 Sonnet", description: "Anthropic's latest high-reasoning model", provider: "Anthropic", inputPrice: 3.0, outputPrice: 15.0 },
        { name: "Gemini 1.5 Pro", description: "Google's powerful multimodal AI", provider: "Google", inputPrice: 3.5, outputPrice: 10.5 },
        { name: "Llama 3 (70B)", description: "Meta's state-of-the-art open model", provider: "Meta", inputPrice: 0.65, outputPrice: 2.75 }
    ];

    servicesData.forEach(s => {
        const id = uuidv4();
        services_db[id] = { id, ...s };
    });

    const clientsData = [
        { name: "Dmytro Krylov", email: "dmytro@example.com" },
        { name: "Alice Smith", email: "alice@example.com" },
        { name: "Bob Johnson", email: "bob@example.com" }
    ];

    clientsData.forEach(c => {
        const id = uuidv4();
        clients_db[id] = { id, ...c };
    });

    const s_ids = Object.keys(services_db);
    const c_ids = Object.keys(clients_db);

    c_ids.forEach((c_id, index) => {
        const sub_id = uuidv4();
        subscriptions_db[sub_id] = {
            id: sub_id,
            client_id: c_id,
            service_id: s_ids[index % s_ids.length],
            tier: "Pro",
            active_since: new Date().toISOString()
        };
    });
    saveData();
}

loadData();

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LLM Aggregator Dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #6366f1;
                --primary-hover: #4f46e5;
                --bg: #0f172a;
                --card-bg: #1e293b;
                --text: #f8fafc;
                --text-dim: #94a3b8;
                --accent: #10b981;
                --border: #334155;
            }
            body { 
                font-family: 'Outfit', sans-serif; 
                margin: 0; 
                background-color: var(--bg); 
                color: var(--text); 
                line-height: 1.5;
            }
            .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
            header { margin-bottom: 40px; text-align: center; }
            h1 { font-size: 3rem; margin: 0; background: linear-gradient(to right, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            p.subtitle { color: var(--text-dim); font-size: 1.1rem; }
            
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
            @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
            
            .card { 
                background: var(--card-bg); 
                border-radius: 20px; 
                padding: 30px; 
                border: 1px solid var(--border);
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            }
            .card h2 { margin-top: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 10px; }
            
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 8px; color: var(--text-dim); font-weight: 500; }
            select, input { 
                width: 100%; 
                padding: 12px; 
                background: #0f172a; 
                border: 1px solid var(--border); 
                border-radius: 10px; 
                color: white; 
                font-family: inherit;
                font-size: 1rem;
                box-sizing: border-box;
            }
            select:focus { border-color: var(--primary); outline: none; }
            
            .price-display { 
                background: rgba(99, 102, 241, 0.1); 
                border-radius: 15px; 
                padding: 20px; 
                margin-top: 20px;
                border: 1px dashed var(--primary);
            }
            .price-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .price-item { text-align: center; }
            .price-value { font-size: 1.5rem; font-weight: 700; color: var(--accent); }
            .price-label { font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; }

            button { 
                width: 100%; 
                padding: 14px; 
                background: var(--primary); 
                color: white; 
                border: none; 
                border-radius: 10px; 
                font-size: 1rem; 
                font-weight: 600; 
                cursor: pointer; 
                transition: background 0.2s;
            }
            button:hover { background: var(--primary-hover); }
            
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 15px; color: var(--text-dim); border-bottom: 2px solid var(--border); }
            td { padding: 15px; border-bottom: 1px solid var(--border); }
            .tag { padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
            .tag-pro { background: rgba(16, 185, 129, 0.2); color: #10b981; }
            
            .toast {
                position: fixed; bottom: 20px; right: 20px; padding: 15px 25px; 
                background: var(--accent); color: white; border-radius: 10px;
                transform: translateY(100px); transition: transform 0.3s; z-index: 1000;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>LLM Aggregator</h1>
                <p class="subtitle">The ultimate destination for model comparison and cost optimization</p>
            </header>

            <div class="grid">
                <!-- Aggregator Card -->
                <div class="card">
                    <h2>🔍 Model Insights</h2>
                    <div class="form-group">
                        <label for="modelSelect">Select LLM Model</label>
                        <select id="modelSelect" onchange="updatePrice()">
                            ${services.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="price-display">
                        <div class="price-grid">
                            <div class="price-item">
                                <div class="price-label">Input / 1M tokens</div>
                                <div id="inputPrice" class="price-value">$0.00</div>
                            </div>
                            <div class="price-item">
                                <div class="price-label">Output / 1M tokens</div>
                                <div id="outputPrice" class="price-value">$0.00</div>
                            </div>
                        </div>
                        <p id="modelDesc" style="margin-top: 15px; font-size: 0.9rem; color: var(--text-dim);"></p>
                    </div>
                </div>

                <!-- Assignment Card -->
                <div class="card">
                    <h2>🔗 Assign to User</h2>
                    <div class="form-group">
                        <label for="userSelect">Choose User</label>
                        <select id="userSelect">
                            ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="assignModelSelect">Select Model</label>
                        <select id="assignModelSelect">
                            ${services.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <button onclick="assignModel()">Assign Model Now</button>
                </div>
            </div>

            <div class="card">
                <h2>📊 Current Assignments</h2>
                <div id="subscriptionsTable">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Model</th>
                                <th>Provider</th>
                                <th>Price (In/Out)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clients.map(client => {
                                const clientSubs = subscriptions.filter(sub => sub.client_id === client.id);
                                return clientSubs.map(sub => {
                                    const service = services_db[sub.service_id];
                                    return `
                                        <tr>
                                            <td><strong>${client.name}</strong><br><small style="color:var(--text-dim)">${client.email}</small></td>
                                            <td>${service ? service.name : 'Unknown'}</td>
                                            <td>${service ? service.provider : 'Unknown'}</td>
                                            <td>$${service ? service.inputPrice : '0'}/$${service ? service.outputPrice : '0'}</td>
                                            <td><span class="tag tag-pro">${sub.tier}</span></td>
                                        </tr>
                                    `;
                                }).join('');
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="toast" class="toast">Successfully assigned!</div>

        <script>
            const services = ${JSON.stringify(services_db)};
            
            function updatePrice() {
                const id = document.getElementById('modelSelect').value;
                const service = services[id];
                if (service) {
                    document.getElementById('inputPrice').innerText = '$' + service.inputPrice.toFixed(2);
                    document.getElementById('outputPrice').innerText = '$' + service.outputPrice.toFixed(2);
                    document.getElementById('modelDesc').innerText = service.description;
                }
            }

            async function assignModel() {
                const client_id = document.getElementById('userSelect').value;
                const service_id = document.getElementById('assignModelSelect').value;
                
                const response = await fetch('/subscriptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ client_id, service_id, tier: 'Pro' })
                });

                if (response.ok) {
                    showToast();
                    setTimeout(() => location.reload(), 1000);
                }
            }

            function showToast() {
                const toast = document.getElementById('toast');
                toast.style.transform = 'translateY(0)';
                setTimeout(() => toast.style.transform = 'translateY(100px)', 3000);
            }

            updatePrice();
        </script>
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
    saveData();
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
    const { name, description, provider, inputPrice, outputPrice } = req.body;
    if (!name || !description || !provider) {
        return res.status(400).json({ error: "Name, description, and provider are required" });
    }
    const service_id = uuidv4();
    const new_service = { 
        id: service_id, 
        name, 
        description, 
        provider,
        inputPrice: inputPrice || 0,
        outputPrice: outputPrice || 0
    };
    services_db[service_id] = new_service;
    saveData();
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
    saveData();
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
