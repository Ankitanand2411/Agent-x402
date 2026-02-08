import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-glow"></div>
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title animate-fade-in">
                            Monetize AI Agents with <br />
                            <span className="gradient-text">Internet-Native Payments</span>
                        </h1>
                        <p className="hero-subtitle animate-fade-in">
                            Pay-per-task AI tools powered by Yellow and x402 protocol. <br />
                            No subscriptions. No API keys. Just instant, micropayments.
                        </p>
                        <div className="hero-ctas animate-fade-in">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => navigate('/agent')}
                            >
                                Start Using Agents
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => navigate('/marketplace')}
                            >
                                Explore Marketplace
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-subtitle">
                        Four simple steps to execute AI agents with instant payments
                    </p>

                    <div className="flow-scroll-container">
                        <div className="flow-scroll-track">
                            <div className="flow-step">
                                <div className="step-number">1</div>
                                <GlassCard>
                                    <div className="step-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                    </div>
                                    <h3>User Sends Task</h3>
                                    <p>Submit your request to an AI agent or tool</p>
                                </GlassCard>
                            </div>
                            <div className="flow-step">
                                <div className="step-number">2</div>
                                <GlassCard>
                                    <div className="step-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="5" width="20" height="14" rx="2" />
                                            <path d="M12 9v6M15 12H9" />
                                        </svg>
                                    </div>
                                    <h3>Agent Requests Payment</h3>
                                    <p>Receives HTTP 402 with payment details</p>
                                </GlassCard>
                            </div>
                            <div className="flow-step">
                                <div className="step-number">3</div>
                                <GlassCard>
                                    <div className="step-icon">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                                        </svg>
                                    </div>
                                    <h3>Payment Settles via Yellow SDK</h3>
                                    <p>Instant micropayment in stablecoins</p>
                                </GlassCard>
                            </div>
                            <div className="flow-step">
                                <div className="step-number">4</div>
                                <GlassCard>
                                    <div className="step-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <h3>Agent Executes & Returns</h3>
                                    <p>Get your result immediately</p>
                                </GlassCard>
                            </div>
                            <div className="flow-step">
                                <div className="step-number">1</div>
                                <GlassCard>
                                    <div className="step-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                    </div>
                                    <h3>User Sends Task</h3>
                                    <p>Submit your request to an AI agent or tool</p>
                                </GlassCard>
                            </div>
                            <div className="flow-step">
                                <div className="step-number">2</div>
                                <GlassCard>
                                    <div className="step-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="5" width="20" height="14" rx="2" />
                                            <path d="M12 9v6M15 12H9" />
                                        </svg>
                                    </div>
                                    <h3>Agent Requests Payment</h3>
                                    <p>Receives HTTP 402 with payment details</p>
                                </GlassCard>
                            </div>
                            <div className="flow-step">
                                <div className="step-number">3</div>
                                <GlassCard>
                                    <div className="step-icon">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                                        </svg>
                                    </div>
                                    <h3>Payment Settles via Yellow SDK</h3>
                                    <p>Instant micropayment in stablecoins</p>
                                </GlassCard>
                            </div>
                            <div className="flow-step">
                                <div className="step-number">4</div>
                                <GlassCard>
                                    <div className="step-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <h3>Agent Executes & Returns</h3>
                                    <p>Get your result immediately</p>
                                </GlassCard>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="use-cases">
                <div className="container">
                    <h2 className="section-title">Use Cases</h2>
                    <p className="section-subtitle">
                        Unlock new possibilities with pay-per-use AI
                    </p>

                    <div className="usecases-scroll-container">
                        <div className="usecases-scroll-track">
                            {/* First set */}
                            <GlassCard hover className="use-case-card">
                                <div className="use-case-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <path d="M7 7h10M7 12h10M7 17h6" />
                                    </svg>
                                </div>
                                <h3>API Monetization</h3>
                                <p>
                                    Turn any API into a revenue stream with instant micropayments.
                                    No complex billing systems required.
                                </p>
                            </GlassCard>

                            <GlassCard hover className="use-case-card">
                                <div className="use-case-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="5" y="7" width="14" height="12" rx="2" />
                                        <circle cx="9" cy="12" r="1" fill="currentColor" />
                                        <circle cx="15" cy="12" r="1" fill="currentColor" />
                                        <path d="M12 3v4M8 7V5M16 7V5" />
                                    </svg>
                                </div>
                                <h3>AI Agent Execution</h3>
                                <p>
                                    Run specialized AI agents on-demand. Pay only for what you use,
                                    when you use it.
                                </p>
                            </GlassCard>

                            <GlassCard hover className="use-case-card">
                                <div className="use-case-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                        <path d="M8 10h8M8 14h4" />
                                    </svg>
                                </div>
                                <h3>Pay-per-Prompt Tools</h3>
                                <p>
                                    Access premium AI models without subscriptions.
                                    Each prompt is a separate transaction.
                                </p>
                            </GlassCard>

                            <GlassCard hover className="use-case-card">
                                <div className="use-case-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <h3>Subscription-less Access</h3>
                                <p>
                                    Try expensive AI tools without commitment.
                                    Perfect for occasional users.
                                </p>
                            </GlassCard>

                            {/* Duplicate set for seamless loop */}
                            <GlassCard hover className="use-case-card">
                                <div className="use-case-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <path d="M7 7h10M7 12h10M7 17h6" />
                                    </svg>
                                </div>
                                <h3>API Monetization</h3>
                                <p>
                                    Turn any API into a revenue stream with instant micropayments.
                                    No complex billing systems required.
                                </p>
                            </GlassCard>

                            <GlassCard hover className="use-case-card">
                                <div className="use-case-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="5" y="7" width="14" height="12" rx="2" />
                                        <circle cx="9" cy="12" r="1" fill="currentColor" />
                                        <circle cx="15" cy="12" r="1" fill="currentColor" />
                                        <path d="M12 3v4M8 7V5M16 7V5" />
                                    </svg>
                                </div>
                                <h3>AI Agent Execution</h3>
                                <p>
                                    Run specialized AI agents on-demand. Pay only for what you use,
                                    when you use it.
                                </p>
                            </GlassCard>

                            <GlassCard hover className="use-case-card">
                                <div className="use-case-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                        <path d="M8 10h8M8 14h4" />
                                    </svg>
                                </div>
                                <h3>Pay-per-Prompt Tools</h3>
                                <p>
                                    Access premium AI models without subscriptions.
                                    Each prompt is a separate transaction.
                                </p>
                            </GlassCard>

                            <GlassCard hover className="use-case-card">
                                <div className="use-case-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <h3>Subscription-less Access</h3>
                                <p>
                                    Try expensive AI tools without commitment.
                                    Perfect for occasional users.
                                </p>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why x402 + Yellow SDK */}
            <section className="why-section">
                <div className="container">
                    <h2 className="section-title">Why x402 + Yellow SDK?</h2>
                    <p className="section-subtitle">
                        The internet's payment standard <strong>meets</strong> state channel scalability
                    </p>

                    <div className="features-scroll-container">
                        <div className="features-scroll-track">
                            {/* First set of features */}
                            <div className="feature">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                                    </svg>
                                </div>
                                <h3>Instant Settlement</h3>
                                <p>Payments confirm instantly on Ethereum Network</p>
                            </div>

                            <div className="feature">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                    </svg>
                                </div>
                                <h3>No Subscriptions</h3>
                                <p>Pay per use, not per month</p>
                            </div>

                            <div className="feature">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="7" cy="17" r="3" />
                                        <path d="M9.59 14.59l8-8M15 6h4v4M17 8l-4 4" />
                                    </svg>
                                </div>
                                <h3>No API Keys</h3>
                                <p>Payment IS the authentication</p>
                            </div>

                            <div className="feature">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="5" width="20" height="14" rx="2" />
                                        <path d="M12 9v6M15 12H9" />
                                    </svg>
                                </div>
                                <h3>True Micropayments</h3>
                                <p>Transactions as low as $0.0001</p>
                            </div>

                            <div className="feature">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                                    </svg>
                                </div>
                                <h3>Open Standard</h3>
                                <p>Built on HTTP 402 - Payment Required</p>
                            </div>

                            <div className="feature">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="5" y="11" width="14" height="10" rx="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                </div>
                                <h3>Secure & Trustless</h3>
                                <p>No intermediaries, no chargebacks</p>
                            </div>

                            {/* Duplicate set for seamless loop */}
                            <div className="feature">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                                    </svg>
                                </div>
                                <h3>Instant Settlement</h3>
                                <p>Payments confirm instantly on Ethereum Network</p>
                            </div>

                            <div className="feature">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                    </svg>
                                </div>
                                <h3>No Subscriptions</h3>
                                <p>Pay per use, not per month</p>
                            </div>

                            <div className="feature">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="7" cy="17" r="3" />
                                        <path d="M9.59 14.59l8-8M15 6h4v4M17 8l-4 4" />
                                    </svg>
                                </div>
                                <h3>No API Keys</h3>
                                <p>Payment IS the authentication</p>
                            </div>

                            <div className="feature">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="5" width="20" height="14" rx="2" />
                                        <path d="M12 9v6M15 12H9" />
                                    </svg>
                                </div>
                                <h3>True Micropayments</h3>
                                <p>Transactions as low as $0.0001</p>
                            </div>

                            <div className="feature">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                                    </svg>
                                </div>
                                <h3>Open Standard</h3>
                                <p>Built on HTTP 402 - Payment Required</p>
                            </div>

                            <div className="feature">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="5" y="11" width="14" height="10" rx="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                </div>
                                <h3>Secure & Trustless</h3>
                                <p>No intermediaries, no chargebacks</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <span className="logo-text">Agent</span>
                                <span className="logo-accent">Pay</span>
                            </div>
                            <p className="footer-tagline">
                                Internet-native payments for AI agents
                            </p>
                        </div>

                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Product</h4>
                                <a href="/agent">Agent Interface</a>
                                <a href="/marketplace">Marketplace</a>
                                <a href="#how-it-works">How It Works</a>
                            </div>

                            <div className="footer-column">
                                <h4>Resources</h4>
                                <a href="https://docs.x402.org" target="_blank" rel="noopener noreferrer">
                                    Documentation
                                </a>
                                <a href="https://x402.org" target="_blank" rel="noopener noreferrer">
                                    x402 Protocol
                                </a>
                                <a href="https://ethereum.org" target="_blank" rel="noopener noreferrer">
                                    Ethereum Network
                                </a>
                            </div>

                            <div className="footer-column">
                                <h4>Community</h4>
                                <a href="#github">GitHub</a>
                                <a href="#discord">Discord</a>
                                <a href="#twitter">Twitter</a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>
                            Powered by <span className="stellar-badge">Yellow</span>
                            <span className="x402-badge">x402</span>
                        </p>
                        <p className="footer-copyright">
                            © 2026 AgentPay. Open source payment protocol.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
