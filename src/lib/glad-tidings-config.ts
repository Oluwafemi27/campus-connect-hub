// Glad Tidings configuration constants
// These values are used throughout the application for payment processing

export const GLAD_TIDINGS_CONFIG = {
  // Static account details for bank transfers
  staticAccount: {
    accountName: "GLADTIDINGS - Belshazzar",
    bankName: "Palmpay",
  },

  // API configuration
  apiKey: import.meta.env.VITE_GLAD_TIDINGS_API_KEY || "",
  baseUrl: "https://api.gladtidings.app",

  // Supported networks
  networks: ["mtn", "airtel", "glo", "9mobile"] as const,

  // Supported TV providers
  tvProviders: ["DStv", "GOtv", "Startimes"] as const,

  // Transaction types
  transactionTypes: ["topup", "airtime", "data", "tv", "router"] as const,

  // Status values
  statusValues: ["pending", "completed", "failed"] as const,
};

// Quick amount options for top-up
export const TOPUP_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000] as const;

// Minimum and maximum top-up amounts
export const TOPUP_LIMITS = {
  minimum: 100,
  maximum: Infinity, // No maximum
} as const;
