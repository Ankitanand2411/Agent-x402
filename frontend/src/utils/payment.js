// Payment utility functions

export const formatUSDC = (amount) => {
    if (typeof amount !== 'number') amount = parseFloat(amount) || 0;
    return `${amount.toFixed(4)} USDC`;
};

export const formatUSD = (usdcAmount) => {
    if (typeof usdcAmount !== 'number') usdcAmount = parseFloat(usdcAmount) || 0;
    // USDC is already pegged 1:1 to USD
    return `$${usdcAmount.toFixed(2)}`;
};
