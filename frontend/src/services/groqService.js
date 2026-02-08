import Groq from "groq-sdk";
import { x402Client } from "@x402/core/client";
import { ExactEvmSchemeV1 } from "@x402/evm/v1";
import { toClientEvmSigner } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { createPublicClient, createWalletClient, http, parseAbi, parseUnits } from "viem";
import { API_CONFIG } from '../config/api';

import { yellowService } from './yellowService.js';

// Initialize Groq AI
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

// Initialize x402 client for EVM payments
let x402PaymentClient = null;
let evmSchemeClient = null;
let walletAddress = null;
let walletClient = null; // Store wallet client for signing
let publicClient = null; // For reading blockchain state

// Store original tool data separately
const toolDataMap = new Map();


export const initializePaymentFetch = async (privateKey) => {
    try {
        // Ensure private key starts with 0x
        if (!privateKey.startsWith('0x')) {
            privateKey = `0x${privateKey}`;
        }

        // Create viem account from private key
        const account = privateKeyToAccount(privateKey);
        walletAddress = account.address;

        // Create wallet client for signing and store it
        walletClient = createWalletClient({
            account,
            chain: sepolia,
            transport: http()
        });

        // Create public client for reading state
        publicClient = createPublicClient({
            chain: sepolia,
            transport: http()
        });

        // Create EVM signer for x402
        const evmSigner = toClientEvmSigner({
            address: account.address,
            signTypedData: async (params) => {
                return await walletClient.signTypedData(params);
            }
        });

        // Create EVM scheme client and store it
        evmSchemeClient = new ExactEvmSchemeV1(evmSigner);

        // Initialize x402 client with EVM scheme
        x402PaymentClient = x402Client.fromConfig({
            schemes: [
                {
                    network: `eip155:${sepolia.id}`, // Sepolia network ID
                    client: evmSchemeClient,
                    x402Version: 1
                }
            ]
        });


        // Initialize Yellow Network Service (REAL SDK!)
        const yellowInitSuccess = await yellowService.initialize(privateKey);

        if (yellowInitSuccess) {
            console.log('✅ Yellow Network SDK (Erc20Service) initialized successfully!');
        } else {
            console.warn('[Yellow] Service failed to initialize. Payments will default to EVM.');
        }

        console.log('x402 EVM payment client initialized successfully for Ethereum Network');
        console.log('Wallet address:', account.address);
        return true;
    } catch (error) {
        console.error('Failed to initialize x402 EVM payment client:', error);
        return false;
    }
};

const sanitizeParameters = (params) => {
    if (!params || typeof params !== 'object') {
        return {
            type: "object",
            properties: {},
            required: []
        };
    }

    // Create a clean parameters object with only allowed fields
    const sanitized = {
        type: params.type || "object"
    };

    // Only add properties if they exist and are valid
    if (params.properties && typeof params.properties === 'object') {
        const cleanProperties = {};
        for (const [key, value] of Object.entries(params.properties)) {
            if (value && typeof value === 'object') {
                // Only include allowed property fields
                cleanProperties[key] = {
                    type: value.type || "string",
                    ...(value.description && { description: value.description }),
                    ...(value.enum && Array.isArray(value.enum) && { enum: value.enum })
                };
            }
        }
        sanitized.properties = cleanProperties;
    } else {
        sanitized.properties = {};
    }

    // Only add required if it exists and is a valid array
    if (params.required && Array.isArray(params.required)) {
        sanitized.required = params.required.filter(item => typeof item === 'string');
    }

    return sanitized;
};

/**
 * Fetch available tools from marketplace
 * @returns {Promise<Array>} Array of tool objects
 */
export const fetchMarketplaceTools = async () => {
    try {
        const response = await fetch(API_CONFIG.MARKETPLACE_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch tools: ${response.status}`);
        }
        const tools = await response.json();

        console.log('Raw tools from marketplace:', tools);

        // Clear previous tool data
        toolDataMap.clear();

        // Transform to Groq function format
        const functionDeclarations = tools.map(tool => {
            // Extract price from description (e.g., "COSTS: 0.04 USDC")
            const priceMatch = tool.description?.match(/COSTS?:\s*(\d+(?:\.\d+)?)\s*USDC/i);
            const extractedPrice = priceMatch ? parseFloat(priceMatch[1]) : 0.00;

            // Store original tool data with extracted price
            toolDataMap.set(tool.name, {
                ...tool,
                price: extractedPrice
            });

            // Create a clean function declaration for Groq
            const declaration = {
                type: "function",
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: sanitizeParameters(tool.parameters)
                }
            };

            console.log(`Formatted tool: ${tool.name}, Price: ${extractedPrice} USDC`, declaration);

            return declaration;
        });

        console.log('Function declarations for Groq:', JSON.stringify(functionDeclarations, null, 2));

        return functionDeclarations;
    } catch (error) {
        console.error('Error fetching marketplace tools:', error);
        return [];
    }
};


export const callPaidTool = async (toolName, args) => {
    const SERVER_URL = "https://agent-x40agent-x402-backend.onrender.com";



    try {
        console.log(`\nCalling paid tool: ${toolName}`);
        console.log(`Arguments:`, args);

        if (!x402PaymentClient) {
            throw new Error('Payment client not initialized. Please provide EVM private key.');
        }

        const url = `${SERVER_URL}/tools/${toolName}`;

        // First attempt - will get 402 Payment Required
        let response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(args)
        });

        // If 402, handle payment and retry
        if (response.status === 402) {
            console.log('Payment required, processing payment...');

            const paymentInfo = await response.json();
            console.log('Payment info:', paymentInfo);

            // Execute Yellow Network Payment via NitroLite
            // Only attempt if initialized
            let txHash;
            let yellowSuccess = false;

            // Check if service is initialized before attempting usage
            if (yellowService.isInitialized) {
                console.log('Executing Access Payment on Yellow Network (NitroLite)...');
                try {
                    const paymentResult = await yellowService.pay(
                        paymentInfo.payTo,
                        paymentInfo.price.toString(),
                        'USDC'
                    );

                    if (paymentResult && (paymentResult.id || paymentResult.signature)) {
                        console.log("Yellow payment successful");
                        txHash = paymentResult.id || paymentResult.signature;
                        yellowSuccess = true;
                    }
                } catch (err) {
                    console.error("Yellow payment failed:", err.message);
                    // Fallback to EVM below
                }
            } else {
                console.warn("Yellow Service not initialized. Skipping.");
            }

            // Fallback to EVM if Yellow failed or wasn't available
            if (!yellowSuccess) {
                console.log('Falling back to Standard EVM Access Transaction...');
                const amount = parseUnits(paymentInfo.price.toString(), 6);

                txHash = await walletClient.writeContract({
                    address: paymentInfo.asset,
                    abi: parseAbi(['function transfer(address to, uint256 amount) returns (bool)']),
                    functionName: 'transfer',
                    args: [paymentInfo.payTo, amount]
                });

                console.log('EVM Transaction sent! Hash:', txHash);
                const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
                console.log('EVM Transaction confirmed:', receipt.blockNumber);
            }

            // Construct Proof Header
            const paymentProof = JSON.stringify({
                txHash: txHash,
                network: yellowSuccess ? (paymentInfo.network || 'yellow-testnet') : 'ethereum-network',
                from: walletAddress,
                timestamp: Date.now()
            });

            // Retry request with real transaction hash
            response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-402-payment": paymentProof
                },
                body: JSON.stringify(args)
            });
            console.log('Request retried with payment proof');
        }

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        // Handle different response types based on tool name and content type
        const contentType = response.headers.get('content-type');

        let data;
        if (contentType && contentType.includes('audio/wav')) {
            // For audio tools, return blob info instead of trying to parse as JSON
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            console.log(audioUrl)
            data = {
                type: 'audio',
                url: audioUrl,
                format: 'wav',
                size: blob.size
            };
        } else if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // Default to text
            data = await response.text();
        }

        console.log(`Tool response:`, data);

        return {
            success: true,
            data: data,
            toolName: toolName
        };
    } catch (error) {
        console.error("Tool call error:", error.message);
        return {
            success: false,
            error: error.message,
            toolName: toolName
        };
    }
};


export const processQueryWithGroq = async (userQuery, availableTools, onProgress) => {
    try {

        onProgress?.({ step: 'analyzing', message: 'Analyzing your request with AI...' });

        const messages = [
            {
                role: "system",
                content: `You are an autonomous agent that can use MCP tools from a paid marketplace.

IMPORTANT RULES:
1. First analyze the user's query to determine if a tool is needed
2. If multiple tools provide the same capability, ALWAYS choose the lowest-cost tool
3. Only call a tool if it is absolutely necessary to answer the question
4. Construct arguments exactly according to the tool's parameter schema
5. Be concise and helpful in your responses

Each tool has a monetary cost stated in its description. Consider cost when selecting tools.`
            },
            {
                role: "user",
                content: userQuery
            }
        ];

        // Step 2: Send query to Groq with tools
        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant", // Current supported Groq model
            messages: messages,
            tools: availableTools,
            tool_choice: "auto",
            temperature: 0.5,
            max_tokens: 4096
        });

        const responseMessage = response.choices[0].message;

        // Step 3: Check if Groq wants to call a function
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            const toolCall = responseMessage.tool_calls[0];
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);

            onProgress?.({
                step: 'tool_selected',
                message: `AI selected tool: ${functionName}`,
                toolName: functionName,
                args: functionArgs
            });

            // Step 4: Get tool pricing info
            const toolData = toolDataMap.get(functionName);
            const toolPrice = toolData?.price || 0;

            onProgress?.({
                step: 'payment_required',
                message: `Payment required: ${toolPrice} USDC`,
                amount: toolPrice,
                toolName: functionName
            });

            // Step 5: Call the paid tool (payment happens automatically via x402)
            onProgress?.({ step: 'processing_payment', message: 'Processing payment...' });

            const toolResponse = await callPaidTool(functionName, functionArgs);

            if (!toolResponse.success) {
                throw new Error(`Tool execution failed: ${toolResponse.error}`);
            }

            onProgress?.({
                step: 'payment_confirmed',
                message: 'Payment confirmed! Processing result...',
                txHash: '0x' + Date.now() + '...' // In real implementation, extract from x402 response
            });

            // Step 6: Send tool response back to Groq for final answer
            onProgress?.({ step: 'generating_response', message: 'Generating final response...' });

            messages.push(responseMessage);
            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                name: functionName,
                content: JSON.stringify(toolResponse.data)
            });

            const finalResponse = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: messages,
                temperature: 0.5,
                max_tokens: 4096
            });

            return {
                success: true,
                finalResponse: finalResponse.choices[0].message.content,
                toolUsed: functionName,
                toolArgs: functionArgs,
                toolResponse: toolResponse.data,
                cost: toolPrice
            };
        } else {
            // No tool needed, return direct response
            return {
                success: true,
                finalResponse: responseMessage.content,
                toolUsed: null,
                cost: 0
            };
        }
    } catch (error) {
        console.error('Error processing query with Groq:', error);
        return {
            success: false,
            error: error.message,
            finalResponse: `Sorry, I encountered an error: ${error.message}`
        };
    }
};

export const simpleGroqQuery = async (query) => {
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: query }],
            temperature: 0.7,
            max_tokens: 1024
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error with simple query:', error);
        return `Error: ${error.message}`;
    }
};
