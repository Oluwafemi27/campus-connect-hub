import { supabase } from "@/lib/supabase";

const SUPABASE_EDGE_FUNCTION_URL = "https://jhtuvygyzvuyfybuyflu.supabase.co/functions/v1/Glad-tidings";
const GLAD_TIDINGS_API_KEY = import.meta.env.VITE_GLAD_TIDINGS_API_KEY || "";

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

async function callEdgeFunction<T>(
  action: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Try to get Supabase session token for authentication
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      headers["Authorization"] = `Bearer ${data.session.access_token}`;
    } else if (GLAD_TIDINGS_API_KEY) {
      // Fallback to Glad Tidings API key if available
      headers["Authorization"] = `Bearer ${GLAD_TIDINGS_API_KEY}`;
    }
  } catch (error) {
    console.warn("Failed to get Supabase session:", error);
    // If getting session fails, try with Glad Tidings API key
    if (GLAD_TIDINGS_API_KEY) {
      headers["Authorization"] = `Bearer ${GLAD_TIDINGS_API_KEY}`;
    }
  }

  // Build request body with action and any additional data
  const requestBody = {
    action,
    ...body,
  };

  try {
    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Edge function error: ${response.statusText}`, errorBody);
      throw new Error(`Edge function error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Failed to call edge function:`, error);
    throw error;
  }
}

export async function getDataBundlesServer(): Promise<DataBundle[]> {
  try {
    const response = await callEdgeFunction<any>("data");
    console.log("Data bundles full response:", response);
    console.log("Response type:", typeof response);
    console.log("Response keys:", Object.keys(response || {}));
    console.log("Response entries:", Object.entries(response || {}));

    // Handle different response formats
    if (Array.isArray(response)) {
      console.log("✓ Response is array with", response.length, "items");
      return response;
    }

    // Check for common data property names
    const dataKey = Object.keys(response || {}).find(key =>
      ['data', 'bundles', 'plans', 'result', 'payload', 'items'].includes(key)
    );

    if (dataKey && Array.isArray(response[dataKey])) {
      console.log(`✓ Found data in .${dataKey} with`, response[dataKey].length, "items");
      return response[dataKey];
    }

    console.warn("⚠ No data array found. Available keys:", Object.keys(response || {}));
    return [];
  } catch (error) {
    console.error("Failed to fetch data bundles:", error);
    return [];
  }
}

export async function getAirtimesServer(): Promise<Airtime[]> {
  try {
    const response = await callEdgeFunction<any>("airtime");
    console.log("Airtimes response:", response);

    // Handle different response formats
    if (Array.isArray(response)) {
      return response;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch airtimes:", error);
    return [];
  }
}

export async function getTVSubscriptionsServer(): Promise<TVSubscription[]> {
  try {
    const response = await callEdgeFunction<any>("tv");
    console.log("TV subscriptions response:", response);

    // Handle different response formats
    if (Array.isArray(response)) {
      return response;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch TV subscriptions:", error);
    return [];
  }
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  reference?: string;
  details?: Record<string, unknown>;
}

export async function purchaseDataBundleServer(
  bundleId: string,
  phoneNumber: string,
): Promise<PurchaseResult> {
  try {
    return await callEdgeFunction<PurchaseResult>("purchase-data", {
      bundleId,
      phoneNumber,
    });
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
    return await callEdgeFunction<PurchaseResult>("purchase-airtime", {
      airtimeId,
      phoneNumber,
    });
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
    return await callEdgeFunction<PurchaseResult>("purchase-tv", {
      subscriptionId,
      smartCardNumber,
    });
  } catch (error) {
    console.error("Failed to purchase TV subscription:", error);
    throw error;
  }
}
