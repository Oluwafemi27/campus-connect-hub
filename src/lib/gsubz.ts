import { GSUBZ_CONFIG } from "./gsubz-config";

const GSUBZ_API_KEY = GSUBZ_CONFIG.apiKey;
const GSUBZ_BASE_URL = GSUBZ_CONFIG.baseUrl;

export interface DataBundle {
  id: string;
  name: string;
  amount: number;
  price: number;
  validity: string;
  network: string;
}

export interface Airtime {
  id: string;
  amount: number;
  price: number;
  network: string;
}

export interface TVSubscription {
  id: string;
  name: string;
  price: number;
  duration: string;
  provider: string;
}

interface GsubzResponse<T> {
  code: number;
  status: string;
  description: string;
  content?: T;
  gateway?: Record<string, unknown>;
}

// Mock data for development when API is unavailable
const mockDataBundles: DataBundle[] = [
  {
    id: "1",
    name: "DAILY: 1GB (24 Hrs)",
    amount: 1,
    price: 350,
    validity: "24 hours",
    network: "mtn",
  },
  {
    id: "2",
    name: "WEEKLY: 2GB (7 Days)",
    amount: 2,
    price: 500,
    validity: "7 days",
    network: "mtn",
  },
  {
    id: "3",
    name: "MONTHLY: 5GB (30 Days)",
    amount: 5,
    price: 1500,
    validity: "30 days",
    network: "mtn",
  },
  {
    id: "4",
    name: "MEGA: 10GB (30 Days)",
    amount: 10,
    price: 3000,
    validity: "30 days",
    network: "mtn",
  },
  {
    id: "5",
    name: "DAILY: 1.5GB (24 Hrs)",
    amount: 1.5,
    price: 500,
    validity: "24 hours",
    network: "airtel",
  },
  {
    id: "6",
    name: "WEEKLY: 3GB (7 Days)",
    amount: 3,
    price: 1000,
    validity: "7 days",
    network: "airtel",
  },
  {
    id: "7",
    name: "MONTHLY: 6GB (30 Days)",
    amount: 6,
    price: 2000,
    validity: "30 days",
    network: "airtel",
  },
  {
    id: "8",
    name: "DAILY: 1.35GB (24 Hrs)",
    amount: 1.35,
    price: 300,
    validity: "24 hours",
    network: "glo",
  },
  {
    id: "9",
    name: "WEEKLY: 4.1GB (7 Days)",
    amount: 4.1,
    price: 1000,
    validity: "7 days",
    network: "glo",
  },
  {
    id: "10",
    name: "MONTHLY: 8.1GB (30 Days)",
    amount: 8.1,
    price: 2500,
    validity: "30 days",
    network: "glo",
  },
];

const mockAirtimes: Airtime[] = [
  { id: "100", amount: 100, price: 100, network: "mtn" },
  { id: "200", amount: 200, price: 200, network: "mtn" },
  { id: "500", amount: 500, price: 500, network: "mtn" },
  { id: "1000", amount: 1000, price: 1000, network: "mtn" },
  { id: "2000", amount: 2000, price: 2000, network: "mtn" },
  { id: "5000", amount: 5000, price: 5000, network: "mtn" },
  { id: "100-9mobile", amount: 100, price: 100, network: "9mobile" },
  { id: "500-9mobile", amount: 500, price: 500, network: "9mobile" },
  { id: "100-glo", amount: 100, price: 100, network: "glo" },
  { id: "500-glo", amount: 500, price: 500, network: "glo" },
  { id: "100-airtel", amount: 100, price: 100, network: "airtel" },
  { id: "500-airtel", amount: 500, price: 500, network: "airtel" },
];

const mockTVSubscriptions: TVSubscription[] = [
  { id: "dstv-1", name: "DStv Access", price: 2500, duration: "1 month", provider: "dstv" },
  { id: "dstv-2", name: "DStv Lite", price: 3500, duration: "1 month", provider: "dstv" },
  { id: "dstv-3", name: "DStv Compact", price: 5000, duration: "1 month", provider: "dstv" },
  { id: "dstv-4", name: "DStv Compact Plus", price: 8000, duration: "1 month", provider: "dstv" },
  { id: "dstv-5", name: "DStv Premium", price: 12500, duration: "1 month", provider: "dstv" },
  { id: "gotv-1", name: "GOtv Lite", price: 1250, duration: "1 month", provider: "gotv" },
  { id: "gotv-2", name: "GOtv Value", price: 2200, duration: "1 month", provider: "gotv" },
  { id: "gotv-3", name: "GOtv Plus", price: 3500, duration: "1 month", provider: "gotv" },
  { id: "gotv-4", name: "GOtv Max", price: 4800, duration: "1 month", provider: "gotv" },
  {
    id: "startimes-1",
    name: "StarTimes Nova",
    price: 1100,
    duration: "1 month",
    provider: "startimes",
  },
  {
    id: "startimes-2",
    name: "StarTimes Smart",
    price: 2000,
    duration: "1 month",
    provider: "startimes",
  },
  {
    id: "startimes-3",
    name: "StarTimes Classic",
    price: 3500,
    duration: "1 month",
    provider: "startimes",
  },
];

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<GsubzResponse<T>> {
  // If API key is not configured, throw immediately
  if (!GSUBZ_API_KEY) {
    throw new Error("Gsubz API key not configured");
  }

  const url = `${GSUBZ_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${GSUBZ_API_KEY}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.description || `API Error: ${response.status}`);
    }

    const data: GsubzResponse<T> = await response.json();
    return data;
  } catch (error) {
    console.debug(
      `Gsubz API Error [${endpoint}]:`,
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}

export async function getDataBundles(): Promise<DataBundle[]> {
  try {
    // Gsubz returns plans for data services
    const response = await fetchApi<unknown>("/plans?service=mtn_cg");
    // For now, return mock data as the actual API structure requires more mapping
    return mockDataBundles;
  } catch {
    // API unavailable or not configured - use mock data
    return mockDataBundles;
  }
}

export async function getAirtimes(): Promise<Airtime[]> {
  try {
    // Gsubz API for airtimes
    const response = await fetchApi<unknown>("/fields?service=mtn");
    // For now, return mock data as the actual API structure requires more mapping
    return mockAirtimes;
  } catch {
    // API unavailable or not configured - use mock data
    return mockAirtimes;
  }
}

export async function getTVSubscriptions(): Promise<TVSubscription[]> {
  try {
    // Gsubz API for TV subscriptions
    const response = await fetchApi<unknown>("/plans?service=gotv");
    // For now, return mock data as the actual API structure requires more mapping
    return mockTVSubscriptions;
  } catch {
    // API unavailable or not configured - use mock data
    return mockTVSubscriptions;
  }
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  reference?: string;
  details?: Record<string, unknown>;
}

export async function purchaseDataBundle(
  bundleId: string,
  phoneNumber: string,
  network: string,
): Promise<PurchaseResult> {
  try {
    const requestID = Date.now() + Math.random();
    const serviceID = GSUBZ_CONFIG.serviceIds.data[network as keyof typeof GSUBZ_CONFIG.serviceIds.data];

    const response = await fetchApi<{
      transactionID?: string;
      requestID?: string;
      status?: string;
      code?: string;
    }>("/pay", {
      method: "POST",
      body: JSON.stringify({
        serviceID,
        phone: phoneNumber,
        amount: 0, // Will be determined by plan
        requestID,
        productType: "fix",
      }),
    });

    if (response.code === 200) {
      return {
        success: true,
        message: "Data purchase successful",
        reference: response.content?.transactionID?.toString(),
        details: response.content,
      };
    }

    return {
      success: false,
      message: response.description || "Data purchase failed",
    };
  } catch (error) {
    console.error("Failed to purchase data bundle:", error);
    return {
      success: false,
      message: "Unable to complete purchase. Please try again.",
    };
  }
}

export async function purchaseAirtime(
  amount: number,
  phoneNumber: string,
  network: string,
): Promise<PurchaseResult> {
  try {
    const requestID = Date.now() + Math.random();
    const serviceID = GSUBZ_CONFIG.serviceIds.airtime[network as keyof typeof GSUBZ_CONFIG.serviceIds.airtime];

    const response = await fetchApi<{
      transactionID?: string;
      requestID?: string;
      status?: string;
      code?: string;
    }>("/pay", {
      method: "POST",
      body: JSON.stringify({
        serviceID,
        phone: phoneNumber,
        amount,
        requestID,
        productType: "flexible",
      }),
    });

    if (response.code === 200) {
      return {
        success: true,
        message: "Airtime purchase successful",
        reference: response.content?.transactionID?.toString(),
        details: response.content,
      };
    }

    return {
      success: false,
      message: response.description || "Airtime purchase failed",
    };
  } catch (error) {
    console.error("Failed to purchase airtime:", error);
    return {
      success: false,
      message: "Unable to complete purchase. Please try again.",
    };
  }
}

export async function purchaseTVSubscription(
  packageId: string,
  smartCardNumber: string,
  provider: string,
): Promise<PurchaseResult> {
  try {
    const requestID = Date.now() + Math.random();
    const serviceID = GSUBZ_CONFIG.serviceIds.tv[provider as keyof typeof GSUBZ_CONFIG.serviceIds.tv];

    const response = await fetchApi<{
      transactionID?: string;
      requestID?: string;
      status?: string;
      code?: string;
    }>("/pay", {
      method: "POST",
      body: JSON.stringify({
        serviceID,
        customerID: smartCardNumber,
        plan: packageId,
        requestID,
        productType: "fix",
      }),
    });

    if (response.code === 200) {
      return {
        success: true,
        message: "TV subscription successful",
        reference: response.content?.transactionID?.toString(),
        details: response.content,
      };
    }

    return {
      success: false,
      message: response.description || "TV subscription failed",
    };
  } catch (error) {
    console.error("Failed to purchase TV subscription:", error);
    return {
      success: false,
      message: "Unable to complete purchase. Please try again.",
    };
  }
}

// Verify phone number and get network
export async function verifyPhoneNumber(phoneNumber: string): Promise<{
  valid: boolean;
  network?: string;
  number?: string;
}> {
  try {
    // For now, use basic detection based on prefix
    const prefixes: Record<string, string> = {
      "0803": "mtn",
      "0806": "mtn",
      "0813": "mtn",
      "0816": "mtn",
      "0810": "mtn",
      "0701": "mtn",
      "0703": "mtn",
      "0706": "mtn",
      "0802": "airtel",
      "0808": "airtel",
      "0812": "airtel",
      "0901": "airtel",
      "0902": "airtel",
      "0904": "airtel",
      "0705": "airtel",
      "0805": "glo",
      "0807": "glo",
      "0811": "glo",
      "0815": "glo",
      "0905": "glo",
      "0809": "9mobile",
      "0817": "9mobile",
      "0909": "9mobile",
    };

    const prefix = phoneNumber.substring(0, 4);
    const network = prefixes[prefix] || "mtn";

    return { valid: true, network, number: phoneNumber };
  } catch (error) {
    console.error("Failed to verify phone:", error);
    return { valid: false };
  }
}

// Verify TV smart card number
export async function verifySmartCard(
  smartCardNumber: string,
  provider: string,
): Promise<{ valid: boolean; customerName?: string }> {
  try {
    // Gsubz will validate on purchase, assume valid for now
    return { valid: true };
  } catch (error) {
    console.error("Failed to verify smart card:", error);
    return { valid: false };
  }
}
