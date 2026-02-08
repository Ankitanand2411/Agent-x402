// Payment utility functions

export const formatXLM = (amount) => {
    // Now formats as USDC for EVM payments
    return `${amount.toFixed(4)} USDC`;
};

export const formatUSDC = (amount) => {
    return `${amount.toFixed(4)} USDC`;
};

export const formatUSD = (usdcAmount) => {
    // USDC is already pegged 1:1 to USD
    return `$${usdcAmount.toFixed(4)}`;
};
