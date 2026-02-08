
export default {
    // Groq API Key (get from https://console.groq.com/keys)
    GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY || '',

    // EVM Private Key for Ethereum Network payments
    EVM_PRIVATE_KEY: import.meta.env.VITE_EVM_PRIVATE_KEY || '',

    // Marketplace backend URL
    MARKETPLACE_URL: import.meta.env.VITE_MARKETPLACE_URL || 'http://localhost:3000',

    // Backend URL for tools and audio generation
    //BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
};
