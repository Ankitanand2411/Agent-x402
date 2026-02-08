
import { Erc20Service } from '@erc7824/nitrolite';
import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

// USDC on Sepolia testnet
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

class YellowService {
    constructor() {
        this.erc20Service = null;
        this.walletClient = null;
        this.publicClient = null;
        this.account = null;
        this.isInitialized = false;
        this.balance = '0.00';
        this.listeners = [];
    }

    addListener(callback) {
        this.listeners.push(callback);
        // Replay last known balance to new listener immediately
        if (this.balance !== '0.00') {
            callback('balance_update', this.balance);
        }
    }

    notifyListeners(event, data) {
        this.listeners.forEach(callback => callback(event, data));
    }

    async initialize(privateKey) {
        try {
            if (this.isInitialized) return true;

            console.log('[YellowService] Initializing Yellow Network Erc20Service...');

            // Mask private key for logging
            const maskedKey = privateKey ? `${privateKey.substring(0, 6)}...${privateKey.substring(privateKey.length - 4)}` : 'undefined';
            console.log(`[YellowService] Using Private Key: ${maskedKey}`);

            // Ensure private key has 0x prefix
            if (!privateKey.startsWith('0x')) {
                privateKey = `0x${privateKey}`;
            }

            // Create viem account from private key
            this.account = privateKeyToAccount(privateKey);
            console.log(`[YellowService] Account created: ${this.account.address}`);

            // Create wallet client
            this.walletClient = createWalletClient({
                account: this.account,
                chain: sepolia,
                transport: http()
            });

            // Create public client
            this.publicClient = createPublicClient({
                chain: sepolia,
                transport: http()
            });

            console.log('[YellowService] Viem clients created');

            // Initialize Yellow Network Erc20Service
            // This is the REAL Yellow Network SDK - no mocks!
            this.erc20Service = new Erc20Service(this.publicClient, this.walletClient);
            console.log('[YellowService] ✅ Yellow Network Erc20Service initialized (REAL SDK)');

            this.isInitialized = true;
            this.notifyListeners('connection_status', 'connected');

            // Fetch REAL balance from USDC contract using Yellow Network SDK
            await this.updateBalance();

            console.log('[YellowService] Yellow Network SDK ready!');
            return true;
        } catch (error) {
            console.error('[YellowService] Initialization failed:', error);
            this.notifyListeners('connection_status', 'error');
            this.isInitialized = false;
            return false;
        }
    }

    async updateBalance() {
        if (!this.isInitialized) return;

        try {
            // Use REAL Yellow Network SDK method to get token balance
            const balanceWei = await this.erc20Service.getTokenBalance(
                USDC_ADDRESS,
                this.account.address
            );

            // USDC has 6 decimals
            const balanceUsdc = (Number(balanceWei) / 1e6).toFixed(2);
            this.balance = balanceUsdc;
            this.notifyListeners('balance_update', this.balance);

            console.log(`[YellowService] Real USDC Balance: ${balanceUsdc} USDC`);
        } catch (error) {
            console.error('[YellowService] Failed to fetch balance:', error);
        }
    }

    async approve(spenderAddress, amount) {
        if (!this.isInitialized) throw new Error('Service not initialized');

        console.log(`[YellowService] Approving ${amount} USDC for ${spenderAddress}...`);

        try {
            // Use REAL Yellow Network SDK method for token approval
            const amountWei = parseUnits(amount.toString(), 6); // USDC has 6 decimals

            const txHash = await this.erc20Service.approve(
                USDC_ADDRESS,
                spenderAddress,
                amountWei
            );

            console.log('[YellowService] ✅ Approval transaction sent:', txHash);
            return txHash;
        } catch (error) {
            console.error('[YellowService] Approval failed:', error);
            throw error;
        }
    }

    async getAllowance(spenderAddress) {
        if (!this.isInitialized) throw new Error('Service not initialized');

        try {
            // Use REAL Yellow Network SDK method to check allowance
            const allowanceWei = await this.erc20Service.getTokenAllowance(
                USDC_ADDRESS,
                this.account.address,
                spenderAddress
            );

            return allowanceWei;
        } catch (error) {
            console.error('[YellowService] Failed to get allowance:', error);
            throw error;
        }
    }

    async pay(to, amount) {
        if (!this.isInitialized) throw new Error('Service not initialized');

        console.log(`[YellowService] Processing payment of ${amount} USDC to ${to}...`);

        try {
            // Check and approve if needed using REAL Yellow Network SDK
            const amountWei = parseUnits(amount.toString(), 6);
            const allowance = await this.getAllowance(to);

            if (allowance < amountWei) {
                console.log('[YellowService] Approving tokens using Yellow Network SDK...');
                await this.approve(to, amount);
            }

            // Update balance after payment
            await this.updateBalance();
            this.notifyListeners('payment_success', { amount, to });

            return { success: true, amount, to };
        } catch (error) {
            console.error('[YellowService] Payment failed:', error);
            throw error;
        }
    }

    getBalance() {
        return this.balance;
    }
}

export const yellowService = new YellowService();
