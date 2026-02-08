import React, { useState, useRef, useEffect } from 'react';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import StatusPill from '../components/StatusPill';
import { formatXLM } from '../utils/payment';
import {
    initializePaymentFetch,
    fetchMarketplaceTools,
    processQueryWithGroq
} from '../services/groqService';
import envConfig from '../config/env';
import './AgentInterface.css';

const AgentInterface = () => {
    const [messages, setMessages] = useState([
        {
            type: 'system',
            content: 'Welcome to AgentPay with AI!',
            timestamp: new Date(),
            id: 'msg-0'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [availableTools, setAvailableTools] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [expandedResponses, setExpandedResponses] = useState(new Set());
    const [audioBlobs, setAudioBlobs] = useState({});
    const messagesEndRef = useRef(null);
    const messageIdRef = useRef(1);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const initialize = async () => {
            console.log("Starting initialization...");
            try {
                const privateKey = envConfig.EVM_PRIVATE_KEY;
                console.log("Private key loaded:", privateKey ? "Yes (hidden)" : "No");

                if (!privateKey) {
                    addMessage('system', 'Warning: EVM private key not configured. Check .env file.');
                    return;
                }

                console.log("Initializing payment fetch...");
                const paymentInitialized = initializePaymentFetch(privateKey);
                console.log("Payment initialization result:", paymentInitialized);

                if (!paymentInitialized) {
                    addMessage('system', 'Failed to initialize payment system. Check console for details.');
                    return;
                }

                console.log("Fetching marketplace tools...");
                const tools = await fetchMarketplaceTools();
                console.log("Tools fetched:", tools.length);

                if (tools.length === 0) {
                    addMessage('system', 'No tools available from marketplace. Is backend running?');
                } else {
                    setAvailableTools(tools);
                    setIsInitialized(true);
                    addMessage('system', `✅ Initialization complete! ${tools.length} tools available. Payment system ready.`);
                }
            } catch (error) {
                console.error("Initialization error:", error);
                addMessage('system', `Initialization failed: ${error.message}`);
            }
        };

        initialize();
    }, []);


    const addMessage = (type, content, extra = {}) => {
        const messageId = `msg-${messageIdRef.current++}`;
        setMessages(prev => [...prev, {
            type,
            content,
            timestamp: new Date(),
            id: messageId,
            ...extra
        }]);
        return messageId;
    };

    const generateAudio = async (text, messageId) => {
        try {
            const backendUrl = envConfig.BACKEND_URL || 'http://localhost:3000';
            const endpoint = `${backendUrl}/tools/get_audio`;
            console.log('Audio endpoint:', endpoint, 'for message:', messageId);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            console.log('Audio response status:', response.status);

            if (!response.ok) {
                throw new Error(`Failed to generate audio: ${response.status} - Check backend URL: ${endpoint}`);
            }

            const audioData = await response.blob();
            const audioUrl = URL.createObjectURL(audioData);

            console.log('Audio URL created:', audioUrl);

            setAudioBlobs(prev => ({
                ...prev,
                [messageId]: audioUrl
            }));
        } catch (error) {
            console.error('Error generating audio:', error);
            addMessage('system', `Error generating audio: ${error.message}`);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isProcessing) return;

        if (!isInitialized) {
            addMessage('system', ' System not initialized. Please wait or refresh the page.');
            return;
        }

        const userQuery = inputValue;
        addMessage('user', userQuery);
        setInputValue('');
        setIsProcessing(true);

        try {
            // Process query with Groq AI
            const result = await processQueryWithGroq(
                userQuery,
                availableTools,
                (progress) => {
                    // Handle progress updates
                    switch (progress.step) {
                        case 'analyzing':
                            addMessage('system', progress.message);
                            break;
                        case 'tool_selected':
                            addMessage('system', `${progress.message}\nArguments: ${JSON.stringify(progress.args, null, 2)}`);
                            break;
                        case 'payment_required':
                            addMessage('payment-request', progress.message, {
                                amount: progress.amount,
                                toolName: progress.toolName,
                                agentIcon: 'AI'
                            });
                            break;
                        case 'processing_payment':
                            addMessage('system', progress.message);
                            break;
                        case 'payment_confirmed':
                            addMessage('payment-confirm', progress.message, {
                                txHash: progress.txHash
                            });
                            break;
                        case 'generating_response':
                            addMessage('system', progress.message);
                            break;
                    }
                }
            );

            // Add delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));

            if (result.success) {
                // Display final AI response
                addMessage('agent', result.finalResponse, {
                    agent: result.toolUsed ? `AI Agent (used ${result.toolUsed})` : 'AI Agent',
                    agentIcon: 'AI',
                    toolUsed: result.toolUsed,
                    cost: result.cost,
                    audioUrl: result.toolResponse?.type === 'audio' ? result.toolResponse.url : null
                });

                // If a tool was used, show the raw tool response in a dropdown
                if (result.toolUsed && result.toolResponse) {
                    addMessage('tool-response', 'Raw Tool Response', {
                        toolName: result.toolUsed,
                        response: result.toolResponse
                    });
                }
            } else {
                addMessage('agent', `Error: ${result.finalResponse}`, {
                    agent: 'AI Agent',
                    agentIcon: 'AI'
                });
            }
        } catch (error) {
            console.error('Error processing message:', error);
            addMessage('system', `Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="agent-interface simplified">
            <main className="chat-area-full">
                <div className="messages-container">
                    {messages.map((message) => (
                        <div key={message.id} className={`message message-${message.type}`}>
                            {message.type === 'user' && (
                                <div className="message-content user-message">
                                    <div className="message-text">{message.content}</div>
                                    <div className="message-time">
                                        {message.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            )}

                            {message.type === 'agent' && (
                                <div className="message-content agent-message">
                                    <div className="agent-avatar">{message.agentIcon}</div>
                                    <div>
                                        <div className="agent-label">
                                            {message.agent}
                                            {message.cost > 0 && ` • Cost: ${formatXLM(message.cost)}`}
                                        </div>
                                        <div className="message-text">
                                            {message.content.split('\n').map((line, i) => (
                                                <React.Fragment key={i}>
                                                    {line.startsWith('```') ? (
                                                        <pre className="code-block">{line.replace(/```\w*/g, '')}</pre>
                                                    ) : (
                                                        <p>{line}</p>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        {message.audioUrl && (
                                            <div className="audio-player-container">
                                                <div className="audio-source-label">Audio from tool response:</div>
                                                <audio controls className="audio-player">
                                                    <source src={message.audioUrl} type="audio/wav" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            </div>
                                        )}
                                        {audioBlobs[message.id] && (
                                            <div className="audio-player-container">
                                                <audio controls className="audio-player">
                                                    <source src={audioBlobs[message.id]} type="audio/wav" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            </div>
                                        )}

                                        <div className="message-time">
                                            {message.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {message.type === 'system' && (
                                <div className="message-content system-message">
                                    <div className="message-text">{message.content}</div>
                                </div>
                            )}

                            {message.type === 'payment-request' && (
                                <div className="message-content payment-message">
                                    <GlassCard className="payment-card">
                                        <div>
                                            <div className="payment-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="2" y="5" width="20" height="14" rx="2" />
                                                    <line x1="2" y1="10" x2="22" y2="10" />
                                                </svg>
                                            </div>
                                            <h4>HTTP 402: Payment Required</h4>
                                            <p className="payment-details">
                                                Tool: <strong>{message.toolName}</strong> {message.agentIcon}
                                                <br />
                                                Amount: <strong>{formatXLM(message.amount)}</strong>
                                            </p>
                                        </div>
                                        <StatusPill status="pending" text="Processing Payment..." />
                                    </GlassCard>
                                </div>
                            )}

                            {message.type === 'payment-confirm' && (
                                <div className="message-content payment-message">
                                    <GlassCard className="payment-card success">
                                        <div>
                                            <div className="payment-icon success">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <path d="M9 12l2 2 4-4" />
                                                </svg>
                                            </div>
                                            <h4>Payment Confirmed</h4>
                                            <p className="payment-details">
                                                Transaction verified on Ethereum Sepolia
                                                <br />
                                                <span className="tx-hash">{message.txHash}</span>
                                            </p>
                                        </div>
                                        <StatusPill status="success" text="Confirmed" />
                                    </GlassCard>
                                </div>
                            )}

                            {message.type === 'tool-response' && (
                                <div className="message-content tool-response-message">
                                    <GlassCard className="tool-response-card">
                                        <div
                                            className="tool-response-header"
                                            onClick={() => {
                                                setExpandedResponses(prev => {
                                                    const newSet = new Set(prev);
                                                    if (newSet.has(message.id)) {
                                                        newSet.delete(message.id);
                                                    } else {
                                                        newSet.add(message.id);
                                                    }
                                                    return newSet;
                                                });
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="tool-response-icon">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M4 7h16M4 12h16M4 17h16" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4>Raw Tool Response</h4>
                                                    <p className="tool-response-subtitle">
                                                        Tool: <strong>{message.toolName}</strong>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`dropdown-arrow ${expandedResponses.has(message.id) ? 'expanded' : ''}`}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M6 9l6 6 6-6" />
                                                </svg>
                                            </div>
                                        </div>
                                        {expandedResponses.has(message.id) && (
                                            <div className="tool-response-content">
                                                <pre className="json-response">
                                                    {JSON.stringify(message.response, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </GlassCard>
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="input-area">
                    <div className="input-container">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything... (e.g., 'What's the weather in San Francisco?')"
                            rows="1"
                            disabled={isProcessing || !isInitialized}
                        />
                        <div className="input-footer">
                            <div className="estimated-cost">
                                {isInitialized
                                    ? `${availableTools.length} tools available • AI will select the best one`
                                    : 'Initializing...'}
                            </div>
                            <Button
                                variant="primary"
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isProcessing || !isInitialized}
                            >
                                {isProcessing ? 'Processing...' : 'Send'}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AgentInterface;
