import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import 'dotenv/config';
import dns from "dns";
import fetch from 'node-fetch';
import { Agent } from 'https';

dns.setDefaultResultOrder("ipv4first");

// Force IPv4 for all DNS lookups
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    options.family = 4;
    return originalLookup(hostname, options, callback);
};

const app = express();
const httpsAgent = new Agent({ family: 4 });

app.use(express.json());

// Enable CORS for frontend
app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173', "https://agent-x402.vercel.app", "*"],
    credentials: true
}));

const BASE_URL = "https://api.adzuna.com/v1/api";

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const EVM_WALLET_ADDRESS = process.env.EVM_WALLET_ADDRESS;

if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    throw new Error("Missing ADZUNA_APP_ID or ADZUNA_APP_KEY");
}

if (!EVM_WALLET_ADDRESS) {
    console.warn("⚠️  Warning: EVM_WALLET_ADDRESS not set - payments will not work");
}

// Tool prices in USDC
const TOOL_PRICES = {
    "get_weather1": "0.04",
    "get_weather2": "0.02",
    "get_weather3": "0.01",
    "get_audio": "0.03",
    "adzuna_search_jobs": "0.05",
    "adzuna_top_companies": "0.02",
    "adzuna_get_categories": "0.01",
    "adzuna_salary_histogram": "0.02",
    "adzuna_geodata": "0.02",
    "adzuna_salary_history": "0.02",
};

// Simple payment check middleware
function requirePayment(toolName) {
    return (req, res, next) => {
        const paymentHeader = req.headers['x-402-payment'];

        if (!paymentHeader) {
            // Return 402 Payment Required
            return res.status(402).json({
                error: "Payment Required",
                price: TOOL_PRICES[toolName],
                currency: "USDC",
                network: "sepolia",
                asset: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
                payTo: EVM_WALLET_ADDRESS,
                description: `Payment for ${toolName}`
            });
        }

        // TODO: Validate payment here
        // For now, we'll accept any payment header
        console.log(`[Payment] Received payment for ${toolName}:`, paymentHeader.substring(0, 50) + '...');
        next();
    };
}

// Mock weather database
const weatherData = {
    "San Francisco, CA": {
        temperature: "72°F",
        condition: "Sunny",
        humidity: "65%"
    },
    "New York, NY": {
        temperature: "65°F",
        condition: "Cloudy",
        humidity: "70%"
    },
    "London, UK": {
        temperature: "58°F",
        condition: "Rainy",
        humidity: "85%"
    }
};

// Marketplace Tools Definition (with USDC prices)
const MARKETPLACE_TOOLS = [
    {
        name: "get_weather1",
        description: "Get the current weather for a location. COSTS: 0.04 USDC per call",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "The city and state, e.g. San Francisco, CA"
                }
            },
            required: ["location"]
        }
    },
    {
        name: "get_weather2",
        description: "Get the current weather for a location. COSTS: 0.02 USDC per call",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "The city and state, e.g. San Francisco, CA"
                }
            },
            required: ["location"]
        }
    },
    {
        name: "get_weather3",
        description: "Get the current weather for a location. COSTS: 0.01 USDC per call",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "The city and state, e.g. San Francisco, CA"
                }
            },
            required: ["location"]
        }
    },
    {
        name: "get_audio",
        description: "Convert text to speech. RETURNS: WAV audio. COSTS: 0.03 USDC",
        parameters: {
            type: "object",
            properties: {
                text: {
                    type: "string",
                    description: "Text to convert into speech"
                },
                voice: {
                    type: "string",
                    description: "Voice name (default: autumn)",
                    enum: ["autumn"],
                    default: "autumn"
                }
            },
            required: ["text"]
        }
    },
    {
        name: "adzuna_search_jobs",
        description: "Search job listings across countries using Adzuna. RETURNS: job list with salaries, company, location. COSTS: 0.05 USDC per call",
        parameters: {
            type: "object",
            properties: {
                country: {
                    type: "string",
                    description: "ISO 3166-1 alpha-2 country code, e.g. gb, us, in"
                },
                keywords: {
                    type: "string",
                    description: "Job search keywords, e.g. python developer"
                },
                location: {
                    type: "string",
                    description: "City or region, e.g. London, Bangalore"
                },
                page: {
                    type: "number",
                    description: "Page number (starts from 1)",
                    default: 1
                },
                resultsPerPage: {
                    type: "number",
                    description: "Results per page (max 50)",
                    default: 10
                }
            },
            required: ["country"]
        }
    },
    {
        name: "adzuna_get_categories",
        description: "Get valid job category tags for a country. REQUIRED before filtered searches. COSTS: 0.01 USDC per call",
        parameters: {
            type: "object",
            properties: {
                country: {
                    type: "string",
                    description: "ISO 3166-1 alpha-2 country code"
                }
            },
            required: ["country"]
        }
    },
    {
        name: "adzuna_salary_histogram",
        description: "Get salary distribution histogram for matching jobs. RETURNS: salary buckets. COSTS: 0.02 USDC per call",
        parameters: {
            type: "object",
            properties: {
                country: {
                    type: "string",
                    description: "ISO 3166-1 alpha-2 country code"
                },
                keywords: {
                    type: "string",
                    description: "Job keywords"
                }
            },
            required: ["country"]
        }
    },
    {
        name: "adzuna_top_companies",
        description: "Get top hiring companies ranked by open positions. COSTS: 0.02 USDC per call",
        parameters: {
            type: "object",
            properties: {
                country: {
                    type: "string",
                    description: "ISO 3166-1 alpha-2 country code"
                }
            },
            required: ["country"]
        }
    },
    {
        name: "adzuna_geodata",
        description: "Get job count and average salary by region. Useful for relocation analysis. COSTS: 0.02 USDC per call",
        parameters: {
            type: "object",
            properties: {
                country: {
                    type: "string",
                    description: "ISO 3166-1 alpha-2 country code"
                }
            },
            required: ["country"]
        }
    },
    {
        name: "adzuna_salary_history",
        description: "Get historical salary trends over time. RETURNS: monthly averages. COSTS: 0.02 USDC per call",
        parameters: {
            type: "object",
            properties: {
                country: {
                    type: "string",
                    description: "ISO 3166-1 alpha-2 country code"
                }
            },
            required: ["country"]
        }
    }
];

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Weather Tool Endpoints
app.post("/tools/get_weather1", requirePayment("get_weather1"), (req, res) => {
    const { location } = req.body;
    const weather = weatherData[location];

    if (weather) {
        res.json({
            success: true,
            result: `${weather.condition}, ${weather.temperature}, Humidity: ${weather.humidity}`,
            data: weather
        });
    } else {
        res.json({
            success: false,
            result: "Weather data not available for this location"
        });
    }
});

app.post("/tools/get_weather2", requirePayment("get_weather2"), (req, res) => {
    const { location } = req.body;
    const weather = weatherData[location];

    if (weather) {
        res.json({
            success: true,
            result: `${weather.condition}, ${weather.temperature}, Humidity: ${weather.humidity}`,
            data: weather
        });
    } else {
        res.json({
            success: false,
            result: "Weather data not available for this location"
        });
    }
});

app.post("/tools/get_weather3", requirePayment("get_weather3"), (req, res) => {
    const { location } = req.body;
    const weather = weatherData[location];

    if (weather) {
        res.json({
            success: true,
            result: `${weather.condition}, ${weather.temperature}, Humidity: ${weather.humidity}`,
            data: weather
        });
    } else {
        res.json({
            success: false,
            result: "Weather data not available for this location"
        });
    }
});

// Adzuna Job Search Endpoints
app.post("/tools/adzuna_search_jobs", requirePayment("adzuna_search_jobs"), async (req, res) => {
    try {
        const {
            country,
            keywords,
            location,
            page = 1,
            resultsPerPage = 10
        } = req.body;

        const url = `${BASE_URL}/jobs/${country}/search/${page}`;

        const params = {
            app_id: ADZUNA_APP_ID,
            app_key: ADZUNA_APP_KEY,
            results_per_page: resultsPerPage
        };

        if (keywords) params.what = keywords;
        if (location) params.where = location;

        const query = new URLSearchParams(params).toString();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const apiRes = await fetch(`${url}?${query}`, { signal: controller.signal, agent: httpsAgent });
        clearTimeout(timeoutId);
        const data = await apiRes.json();

        if (!apiRes.ok) {
            return res.status(apiRes.status).json({
                success: false,
                result: "Adzuna job search failed",
                error: data
            });
        }

        res.json({
            success: true,
            result: "Adzuna job search completed",
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            result: "Internal error",
            error: err.message
        });
    }
});

app.post("/tools/adzuna_get_categories", requirePayment("adzuna_get_categories"), async (req, res) => {
    try {
        const { country } = req.body;

        const params = {
            app_id: ADZUNA_APP_ID,
            app_key: ADZUNA_APP_KEY
        };

        const query = new URLSearchParams(params).toString();
        const url = `${BASE_URL}/jobs/${country}/categories?${query}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const apiRes = await fetch(url, { signal: controller.signal, agent: httpsAgent });
        clearTimeout(timeoutId);
        const data = await apiRes.json();

        if (!apiRes.ok) {
            return res.status(apiRes.status).json({
                success: false,
                result: "Failed to fetch categories",
                error: data
            });
        }

        res.json({
            success: true,
            result: "Categories fetched",
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            result: "Internal error",
            error: err.message
        });
    }
});

app.post("/tools/adzuna_salary_histogram", requirePayment("adzuna_salary_histogram"), async (req, res) => {
    try {
        const { country, keywords, location, category } = req.body;

        const params = {
            app_id: ADZUNA_APP_ID,
            app_key: ADZUNA_APP_KEY
        };

        if (keywords) params.what = keywords;
        if (location) params.where = location;
        if (category) params.category = category;

        const query = new URLSearchParams(params).toString();
        const url = `${BASE_URL}/jobs/${country}/histogram?${query}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const apiRes = await fetch(url, { signal: controller.signal, agent: httpsAgent });
        clearTimeout(timeoutId);
        const data = await apiRes.json();

        if (!apiRes.ok) {
            return res.status(apiRes.status).json({
                success: false,
                result: "Failed to fetch salary histogram",
                error: data
            });
        }

        res.json({
            success: true,
            result: "Salary histogram fetched",
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            result: "Internal error",
            error: err.message
        });
    }
});

app.post("/tools/adzuna_top_companies", requirePayment("adzuna_top_companies"), async (req, res) => {
    try {
        const { country, keywords, location, category } = req.body;

        const params = {
            app_id: ADZUNA_APP_ID,
            app_key: ADZUNA_APP_KEY
        };

        if (keywords) params.what = keywords;
        if (location) params.where = location;
        if (category) params.category = category;

        const query = new URLSearchParams(params).toString();
        const url = `${BASE_URL}/jobs/${country}/top_companies?${query}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const apiRes = await fetch(url, { signal: controller.signal, agent: httpsAgent });
        clearTimeout(timeoutId);
        const data = await apiRes.json();

        if (!apiRes.ok) {
            return res.status(apiRes.status).json({
                success: false,
                result: "Failed to fetch top companies",
                error: data
            });
        }

        res.json({
            success: true,
            result: "Top companies fetched",
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            result: "Internal error",
            error: err.message
        });
    }
});

app.post("/tools/adzuna_geodata", requirePayment("adzuna_geodata"), async (req, res) => {
    try {
        const { country, keywords, location, category } = req.body;

        const params = {
            app_id: ADZUNA_APP_ID,
            app_key: ADZUNA_APP_KEY
        };

        if (keywords) params.what = keywords;
        if (location) params.where = location;
        if (category) params.category = category;

        const query = new URLSearchParams(params).toString();
        const url = `${BASE_URL}/jobs/${country}/geodata?${query}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const apiRes = await fetch(url, { signal: controller.signal, agent: httpsAgent });
        clearTimeout(timeoutId);
        const data = await apiRes.json();

        if (!apiRes.ok) {
            return res.status(apiRes.status).json({
                success: false,
                result: "Failed to fetch geodata",
                error: data
            });
        }

        res.json({
            success: true,
            result: "Geographic job data fetched",
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            result: "Internal error",
            error: err.message
        });
    }
});

app.post("/tools/adzuna_salary_history", requirePayment("adzuna_salary_history"), async (req, res) => {
    try {
        const { country, keywords, location, category, months } = req.body;

        const params = {
            app_id: ADZUNA_APP_ID,
            app_key: ADZUNA_APP_KEY
        };

        if (keywords) params.what = keywords;
        if (location) params.where = location;
        if (category) params.category = category;
        if (months) params.months = months;

        const query = new URLSearchParams(params).toString();
        const url = `${BASE_URL}/jobs/${country}/history?${query}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const apiRes = await fetch(url, { signal: controller.signal, agent: httpsAgent });
        clearTimeout(timeoutId);
        const data = await apiRes.json();

        if (!apiRes.ok) {
            return res.status(apiRes.status).json({
                success: false,
                result: "Failed to fetch salary history",
                error: data
            });
        }

        res.json({
            success: true,
            result: "Salary history fetched",
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            result: "Internal error",
            error: err.message
        });
    }
});

// Audio Generation Endpoint
app.post("/tools/get_audio", requirePayment("get_audio"), async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "text required" });
    }

    const wav = await groq.audio.speech.create({
        model: "canopylabs/orpheus-v1-english",
        voice: "autumn",
        response_format: "wav",
        input: text,
    });

    const buffer = Buffer.from(await wav.arrayBuffer());

    res.setHeader("Content-Type", "audio/wav");
    res.send(buffer);
});

// Marketplace Tools List
app.get("/tools", (req, res) => {
    console.log('[Server] Fetching marketplace tools list');
    res.json(MARKETPLACE_TOOLS);
});

app.get("/tools/info", (req, res) => {
    res.json(MARKETPLACE_TOOLS);
});

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "MCP Tool Server is running (Base Sepolia/EVM - Manual 402)" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 MCP Tool Server running on port ${PORT}`);
    console.log(`📍 Tool endpoint: POST /tools/{tool_name}`);
    console.log(`💰 Payment Network: Sepolia (EVM)`);
    console.log(`💵 Payment Token: USDC`);
    console.log(`📝 Marketplace: GET /tools`);
    console.log(`⚡ Payment Mode: Manual 402 (no middleware)`);
});

