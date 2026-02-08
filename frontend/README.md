# AgentPay: AI Agent with Pay-Per-Use Tools (Ethereum Sepolia)

An autonomous AI agent that can discover, pay for, and use paid API tools on the **Ethereum Sepolia** network using USDC. Built with **x402** for seamless micropayments.

![AgentPay Demo](https://via.placeholder.com/800x400?text=AgentPay+Interface)

## 🚀 Features

- **Autonomous Tool Discovery**: The agent scans a marketplace for available tools.
- **Pay-Per-Use Model**: Each tool has a cost (e.g., `0.04 USDC`) that is paid on-demand.
- **Seamless EVM Payments**: Integrated with **x402** and **viem** to handle ERC-20 (USDC) transfers automatically.
- **Smart Tool Selection**: The AI (Llama 3 via Groq) intelligently selects the most cost-effective tool for your query.
- **Audio & Data Tools**: Supports diverse tools like Weather API, Job Search (Adzuna), and Text-to-Speech generation.

## 🛠️ Architecture

1.  **Frontend (React + Vite)**:
    *   Chat interface for user interaction.
    *   `GroqService` handles AI logic and tool selection.
    *   `viem` handles wallet management and transaction signing.
2.  **Backend (Node.js + Express)**:
    *   Hosts the paid tools API.
    *   Verifies **x402** payments on Ethereum Sepolia.
    *   Proxies requests to external APIs (OpenWeather, Adzuna, etc.).
3.  **Payment Layer**:
    *   **Network**: Ethereum Sepolia Testnet.
    *   **Currency**: USDC (Sepolia Testnet).
    *   **Contract**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`.

## 📦 Prerequisites

- **Node.js**: v18+
- **Ethereum Wallet**: Private key for a testnet wallet.
- **Tokens**:
    *   **Sepolia ETH** (for gas): [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
    *   **Sepolia USDC** (for payments): [Circle Faucet](https://faucet.circle.com/)

## 🔧 Setup Guide

### 1. Clone & Install
```bash
git clone <repo-url>
cd Agentx402
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
# AI Provider
VITE_GROQ_API_KEY=your_groq_api_key

# Payment Wallet (Testnet ONLY)
# Must start with 0x...
VITE_EVM_PRIVATE_KEY=your_private_key_here

# Backend URL
VITE_MARKETPLACE_URL=https://agent-x40agent-x402-backend.onrender.com
```

### 3. Setup Backend
Navigate to the backend directory and install dependencies:
```bash
cd MarketplaceBackend
npm install
```
Create a `.env` file for the backend **in the `MarketplaceBackend` folder**:
```env
# Your Wallet Address (to receive payments)
EVM_WALLET_ADDRESS=your_public_wallet_address

# API Keys for Tools (Optional, but recommended)
ADZUNA_APP_ID=...
ADZUNA_APP_KEY=...
GROQ_API_KEY=...
```

### 4. Run the Project
**Terminal 1 (Backend):**
```bash
# From project root
./start-backend.sh
```

**Terminal 2 (Frontend):**
```bash
# From project root
npm run dev
```

## 🎮 Usage

1.  Open `http://localhost:5173`.
2.  Wait for initialization (check console for "Payment client initialized").
3.  Ask a question requiring a tool:
    *   *"What is the weather in Tustin, CA?"* (Costs ~0.04 USDC)
    *   *"Find me python jobs in London."* (Costs ~0.05 USDC)
    *   *"Convert this text to audio: Hello World."* (Costs ~0.03 USDC)
4.  Watch the agent:
    *   Select the tool.
    *   **Pay** the USDC fee on-chain.
    *   **Execute** the tool and show the result.

## 📄 License
MIT
