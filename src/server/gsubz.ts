"use server";

import { GSUBZ_CONFIG } from "@/lib/gsubz-config";

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

export interface PurchaseResult {
  success: boolean;
  message: string;
  reference?: string;
  details?: Record<string, unknown>;
}

interface GsubzResponse<T> {
  code: number;
  status: string;
  description: string;
  content?: T;
  gateway?: Record<string, unknown>;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<GsubzResponse<T>> {
  const url = `${GSUBZ_BASE_URL}${endpoint}`;
  const method = options?.method || "GET";

  console.log(`[Gsubz] ${method} ${url}`);
  console.log(`[Gsubz] API Key configured: ${GSUBZ_API_KEY ? "✓" : "✗"}`);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options?.headers,
    };

    // Only add Authorization header for POST requests (purchase/payment)
    // GET requests don't require authentication per Gsubz API docs
    if (method === "POST" && GSUBZ_API_KEY) {
      headers["Authorization"] = `Bearer ${GSUBZ_API_KEY}`;
    }

    const response = await fetch(url, {
      ...options,
      method,
      headers,
    });

    console.log(`[Gsubz] Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[Gsubz] API Error response:`, errorData);
      throw new Error(errorData.description || `API Error: ${response.status}`);
    }

    const data: GsubzResponse<T> = await response.json();
    console.log(`[Gsubz] Response code: ${data.code}, Description: ${data.description}`);
    console.log(`[Gsubz] Response data:`, JSON.stringify(data).substring(0, 500));
    return data;
  } catch (error) {
    console.error(
      `Gsubz API Error [${method} ${endpoint}]:`,
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}

async function getDataBundles(): Promise<DataBundle[]> {
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
    console.log("✅ Data bundles loaded from Gsubz:", plans.length);

    return plans.map((plan, index) => ({
      id: plan.value?.toString() || `bundle-${index}`,
      name: plan.displayName || `Data Bundle ${index + 1}`,
      amount: 0,
      price: parseInt(plan.price || "0"),
      validity: "30 days",
      network: "mtn",
    }));
  }

  console.error("❌ No data bundles in Gsubz response.");
  throw new Error("Failed to fetch data bundles from Gsubz");
}

async function getAirtimes(): Promise<Airtime[]> {
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
    console.log("✅ Airtimes loaded from Gsubz:", airtimesList.length);

    return airtimesList.map((airtime, index) => ({
      id: airtime.value?.toString() || `airtime-${index}`,
      amount: airtime.amount || parseInt(airtime.price || "0") || 0,
      price: parseInt(airtime.price || "0"),
      network: "mtn",
    }));
  }

  console.error("❌ No airtimes in Gsubz response.");
  throw new Error("Failed to fetch airtimes from Gsubz");
}

async function getTVSubscriptions(): Promise<TVSubscription[]> {
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
    console.log("✅ TV subscriptions loaded from Gsubz:", plans.length);

    return plans.map((plan, index) => ({
      id: plan.value?.toString() || `tv-${index}`,
      name: plan.displayName || `TV Plan ${index + 1}`,
      price: parseInt(plan.price || "0"),
      duration: "1 month",
      provider: "gotv",
    }));
  }

  console.error("❌ No TV subscriptions in Gsubz response.");
  throw new Error("Failed to fetch TV subscriptions from Gsubz");
}

async function purchaseDataBundle(
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

async function purchaseAirtime(
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

async function purchaseTVSubscription(
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
async function verifyPhoneNumber(phoneNumber: string): Promise<{
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
async function verifySmartCard(
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

// Server functions that directly fetch from Gsubz API
export async function getDataBundlesServer(): Promise<DataBundle[]> {
  const bundles = await getDataBundles();
  console.log("✓ Loaded", bundles.length, "data bundles from Gsubz");
  return bundles;
}

export async function getAirtimesServer(): Promise<Airtime[]> {
  const airtimes = await getAirtimes();
  console.log("✓ Loaded", airtimes.length, "airtime options from Gsubz");
  return airtimes;
}

export async function getTVSubscriptionsServer(): Promise<TVSubscription[]> {
  const subscriptions = await getTVSubscriptions();
  console.log("✓ Loaded", subscriptions.length, "TV subscriptions from Gsubz");
  return subscriptions;
}

export async function purchaseDataBundleServer(
  bundleId: string,
  phoneNumber: string,
): Promise<PurchaseResult> {
  try {
    // Get the network from the bundle
    const bundles = await getDataBundles();
    const bundle = bundles.find((b) => b.id === bundleId);

    if (!bundle) {
      return {
        success: false,
        message: "Bundle not found",
      };
    }

    const result = await purchaseDataBundle(bundleId, phoneNumber, bundle.network, bundle.price);
    return result;
  } catch (error) {
    console.error("Failed to purchase data bundle:", error);
    throw error;
  }
}

export async function purchaseAirtimeServer(
  airtimeId: string,
  phoneNumber: string,
): Promise<PurchaseResult> {
  try {
    // Get the network from the airtime
    const airtimes = await getAirtimes();
    const airtime = airtimes.find((a) => a.id === airtimeId);

    if (!airtime) {
      return {
        success: false,
        message: "Airtime option not found",
      };
    }

    const result = await purchaseAirtime(airtime.amount, phoneNumber, airtime.network);
    return result;
  } catch (error) {
    console.error("Failed to purchase airtime:", error);
    throw error;
  }
}

export async function purchaseTVSubscriptionServer(
  subscriptionId: string,
  smartCardNumber: string,
): Promise<PurchaseResult> {
  try {
    // Get the provider from the subscription
    const subscriptions = await getTVSubscriptions();
    const subscription = subscriptions.find((s) => s.id === subscriptionId);

    if (!subscription) {
      return {
        success: false,
        message: "Subscription not found",
      };
    }

    const result = await purchaseTVSubscription(
      subscriptionId,
      smartCardNumber,
      subscription.provider,
    );
    return result;
  } catch (error) {
    console.error("Failed to purchase TV subscription:", error);
    throw error;
  }
}
