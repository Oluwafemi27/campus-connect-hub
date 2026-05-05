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
        "api_key": GSUBZ_API_KEY,
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
    console.log("📡 Fetching data bundles from Gsubz API...");
    // Gsubz returns plans for data services
    const response = await fetchApi<{
      plans?: Array<{
        displayName?: string;
        value?: string;
        price?: string;
      }>;
      [key: string]: unknown;
    }>("/plans?service=mtn_cg");

    // The API returns plans directly in the response, not nested under content
    const plans = response.content?.plans || (response as any).plans || [];

    if (response.code === 200 && plans.length > 0) {
      console.log("✅ Real-time data bundles loaded from Gsubz:", plans.length);

      return plans.map((plan, index) => ({
        id: plan.value?.toString() || `bundle-${index}`,
        name: plan.displayName || `Data Bundle ${index + 1}`,
        amount: 0,
        price: parseInt(plan.price || "0"),
        validity: "30 days",
        network: "mtn",
      }));
    }

    console.error("❌ No data bundles in Gsubz response. No mock data available.");
    return [];
  } catch (error) {
    console.error("❌ Failed to fetch data bundles from Gsubz:", error);
    return [];
  }
}

export async function getAirtimes(): Promise<Airtime[]> {
  try {
    console.log("📡 Fetching airtimes from Gsubz API...");
    // Gsubz API for airtimes
    const response = await fetchApi<{
      fields?: Array<{
        value?: string;
        amount?: number;
        price?: string;
      }>;
      [key: string]: unknown;
    }>("/fields?service=mtn");

    const airtimesList = response.content?.fields || (response as any).fields || [];

    if (response.code === 200 && airtimesList.length > 0) {
      console.log("✅ Real-time airtimes loaded from Gsubz:", airtimesList.length);

      return airtimesList.map((airtime, index) => ({
        id: airtime.value?.toString() || `airtime-${index}`,
        amount: airtime.amount || parseInt(airtime.price || "0") || 0,
        price: parseInt(airtime.price || "0"),
        network: "mtn",
      }));
    }

    console.error("❌ No airtimes in Gsubz response. No mock data available.");
    return [];
  } catch (error) {
    console.error("❌ Failed to fetch airtimes from Gsubz:", error);
    return [];
  }
}

export async function getTVSubscriptions(): Promise<TVSubscription[]> {
  try {
    console.log("📡 Fetching TV subscriptions from Gsubz API...");
    // Gsubz API for TV subscriptions
    const response = await fetchApi<{
      plans?: Array<{
        displayName?: string;
        value?: string;
        price?: string;
      }>;
      [key: string]: unknown;
    }>("/plans?service=gotv");

    // The API returns plans directly in the response, not nested under content
    const plans = response.content?.plans || (response as any).plans || [];

    if (response.code === 200 && plans.length > 0) {
      console.log("✅ Real-time TV subscriptions loaded from Gsubz:", plans.length);

      return plans.map((plan, index) => ({
        id: plan.value?.toString() || `tv-${index}`,
        name: plan.displayName || `TV Plan ${index + 1}`,
        price: parseInt(plan.price || "0"),
        duration: "1 month",
        provider: "gotv",
      }));
    }

    console.error("❌ No TV subscriptions in Gsubz response. No mock data available.");
    return [];
  } catch (error) {
    console.error("❌ Failed to fetch TV subscriptions from Gsubz:", error);
    return [];
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
  price?: number,
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
        plan: bundleId,
        amount: price || 0,
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

/**
 * Client-side API helpers that call the server proxy route
 * These functions bridge the frontend and the server API route to avoid CORS issues
 */

export interface GSubzApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getDataBundlesClient(): Promise<DataBundle[]> {
  try {
    const response = await fetch("/api/gsubz?type=data-bundles");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GSubzApiResponse<DataBundle[]> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to fetch data bundles");
    }

    return data.data;
  } catch (error) {
    console.error("Failed to fetch data bundles from API:", error);
    return [];
  }
}

export async function getAirtimesClient(): Promise<Airtime[]> {
  try {
    const response = await fetch("/api/gsubz?type=airtimes");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GSubzApiResponse<Airtime[]> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to fetch airtimes");
    }

    return data.data;
  } catch (error) {
    console.error("Failed to fetch airtimes from API:", error);
    return [];
  }
}

export async function getTVSubscriptionsClient(): Promise<TVSubscription[]> {
  try {
    const response = await fetch("/api/gsubz?type=tv-subscriptions");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GSubzApiResponse<TVSubscription[]> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to fetch TV subscriptions");
    }

    return data.data;
  } catch (error) {
    console.error("Failed to fetch TV subscriptions from API:", error);
    return [];
  }
}

export async function purchaseDataBundleClient(
  bundleId: string,
  phoneNumber: string,
): Promise<PurchaseResult> {
  try {
    const response = await fetch("/api/gsubz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "purchase-data",
        bundleId,
        phoneNumber,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PurchaseResult = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to purchase data bundle via API:", error);
    return {
      success: false,
      message: "Failed to complete purchase. Please try again.",
    };
  }
}

export async function purchaseAirtimeClient(
  airtimeId: string,
  phoneNumber: string,
): Promise<PurchaseResult> {
  try {
    const response = await fetch("/api/gsubz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "purchase-airtime",
        airtimeId,
        phoneNumber,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PurchaseResult = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to purchase airtime via API:", error);
    return {
      success: false,
      message: "Failed to complete purchase. Please try again.",
    };
  }
}

export async function purchaseTVSubscriptionClient(
  subscriptionId: string,
  smartCardNumber: string,
): Promise<PurchaseResult> {
  try {
    const response = await fetch("/api/gsubz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "purchase-tv",
        subscriptionId,
        smartCardNumber,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PurchaseResult = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to purchase TV subscription via API:", error);
    return {
      success: false,
      message: "Failed to complete purchase. Please try again.",
    };
  }
}
