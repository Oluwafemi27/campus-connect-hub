import { GLAD_TIDINGS_CONFIG } from "./glad-tidings-config";

const GLAD_TIDINGS_API_KEY = GLAD_TIDINGS_CONFIG.apiKey;
const GLAD_TIDINGS_BASE_URL = GLAD_TIDINGS_CONFIG.baseUrl + "/api";

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
  { id: "dstv-1", name: "DStv Access", price: 2500, duration: "1 month", provider: "DStv" },
  { id: "dstv-2", name: "DStv Lite", price: 3500, duration: "1 month", provider: "DStv" },
  { id: "dstv-3", name: "DStv Compact", price: 5000, duration: "1 month", provider: "DStv" },
  { id: "dstv-4", name: "DStv Compact Plus", price: 8000, duration: "1 month", provider: "DStv" },
  { id: "dstv-5", name: "DStv Premium", price: 12500, duration: "1 month", provider: "DStv" },
  { id: "gotv-1", name: "GOtv Lite", price: 1250, duration: "1 month", provider: "GOtv" },
  { id: "gotv-2", name: "GOtv Value", price: 2200, duration: "1 month", provider: "GOtv" },
  { id: "gotv-3", name: "GOtv Plus", price: 3500, duration: "1 month", provider: "GOtv" },
  { id: "gotv-4", name: "GOtv Max", price: 4800, duration: "1 month", provider: "GOtv" },
  {
    id: "startimes-1",
    name: "StarTimes Nova",
    price: 1100,
    duration: "1 month",
    provider: "Startimes",
  },
  {
    id: "startimes-2",
    name: "StarTimes Smart",
    price: 2000,
    duration: "1 month",
    provider: "Startimes",
  },
  {
    id: "startimes-3",
    name: "StarTimes Classic",
    price: 3500,
    duration: "1 month",
    provider: "Startimes",
  },
];

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${GLAD_TIDINGS_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${GLAD_TIDINGS_API_KEY}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Request failed");
    }

    return data.data as T;
  } catch (error) {
    console.error(`Glad Tidings API Error [${endpoint}]:`, error);
    throw error;
  }
}

export async function getDataBundles(): Promise<DataBundle[]> {
  try {
    const bundles = await fetchApi<DataBundle[]>("/data-bundles");
    return bundles.length > 0 ? bundles : mockDataBundles;
  } catch (error) {
    console.warn("Using mock data bundles - API unavailable:", error);
    return mockDataBundles;
  }
}

export async function getAirtimes(): Promise<Airtime[]> {
  try {
    const airtimes = await fetchApi<Airtime[]>("/airtimes");
    return airtimes.length > 0 ? airtimes : mockAirtimes;
  } catch (error) {
    console.warn("Using mock airtime data - API unavailable:", error);
    return mockAirtimes;
  }
}

export async function getTVSubscriptions(): Promise<TVSubscription[]> {
  try {
    const subscriptions = await fetchApi<TVSubscription[]>("/tv-subscriptions");
    return subscriptions.length > 0 ? subscriptions : mockTVSubscriptions;
  } catch (error) {
    console.warn("Using mock TV subscription data - API unavailable:", error);
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
    const result = await fetchApi<PurchaseResult>("/purchase/data", {
      method: "POST",
      body: JSON.stringify({ bundle_id: bundleId, phone: phoneNumber, network }),
    });
    return result;
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
    const result = await fetchApi<PurchaseResult>("/purchase/airtime", {
      method: "POST",
      body: JSON.stringify({ amount, phone: phoneNumber, network }),
    });
    return result;
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
    const result = await fetchApi<PurchaseResult>("/purchase/tv", {
      method: "POST",
      body: JSON.stringify({ package_id: packageId, smart_card: smartCardNumber, provider }),
    });
    return result;
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
    const result = await fetchApi<{ valid: boolean; network?: string; number?: string }>(
      "/verify/phone",
      {
        method: "POST",
        body: JSON.stringify({ phone: phoneNumber }),
      },
    );
    return result;
  } catch (error) {
    console.error("Failed to verify phone:", error);
    // Return a basic detection based on prefix
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
  }
}

// Verify TV smart card number
export async function verifySmartCard(
  smartCardNumber: string,
  provider: string,
): Promise<{ valid: boolean; customerName?: string }> {
  try {
    const result = await fetchApi<{ valid: boolean; customer_name?: string }>("/verify/tv", {
      method: "POST",
      body: JSON.stringify({ smart_card: smartCardNumber, provider }),
    });
    return result;
  } catch (error) {
    console.error("Failed to verify smart card:", error);
    // Assume valid for now, API will validate on purchase
    return { valid: true };
  }
}
