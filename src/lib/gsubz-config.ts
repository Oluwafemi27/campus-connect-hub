// Gsubz configuration constants
// These values are used throughout the application for payment processing

export const GSUBZ_CONFIG = {
  // API configuration
  apiKey: import.meta.env.VITE_GSUBZ_API_KEY || "",
  widgetKey: import.meta.env.VITE_GSUBZ_WIDGET_KEY || "",
  baseUrl: "https://app.gsubz.com/api",

  // Service IDs for Gsubz
  serviceIds: {
    airtime: {
      mtn: "mtn",
      airtel: "airtel",
      glo: "glo-data",
      "9mobile": "9mobile",
    },
    data: {
      mtn: "mtn-data",
      airtel: "airtel",
      glo: "glo-data",
      "9mobile": "9mobile-data",
    },
    tv: {
      dstv: "dstv",
      gotv: "gotv",
      startimes: "startimes",
    },
  },

  // Supported networks
  networks: ["mtn", "airtel", "glo", "9mobile"] as const,

  // Supported TV providers
  tvProviders: ["dstv", "gotv", "startimes"] as const,

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
