const GLAD_TIDINGS_API_KEY = import.meta.env.VITE_GLAD_TIDINGS_API_KEY || "";
const GLAD_TIDINGS_BASE_URL = "https://api.gladtidings.app";

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

async function makeGladTidingsRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: Record<string, unknown>,
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GLAD_TIDINGS_API_KEY}`,
  };

  const response = await fetch(`${GLAD_TIDINGS_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Glad Tidings API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getDataBundlesServer(): Promise<DataBundle[]> {
  try {
    if (!GLAD_TIDINGS_API_KEY) {
      console.warn("Glad Tidings API key not configured");
      return [];
    }
    const response = await makeGladTidingsRequest<{ data: DataBundle[] }>("/data-bundles");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch data bundles:", error);
    return [];
  }
}

export async function getAirtimesServer(): Promise<Airtime[]> {
  try {
    if (!GLAD_TIDINGS_API_KEY) {
      console.warn("Glad Tidings API key not configured");
      return [];
    }
    const response = await makeGladTidingsRequest<{ data: Airtime[] }>("/airtimes");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch airtimes:", error);
    return [];
  }
}

export async function getTVSubscriptionsServer(): Promise<TVSubscription[]> {
  try {
    if (!GLAD_TIDINGS_API_KEY) {
      console.warn("Glad Tidings API key not configured");
      return [];
    }
    const response = await makeGladTidingsRequest<{ data: TVSubscription[] }>("/tv-subscriptions");
    return response.data || [];
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
    if (!GLAD_TIDINGS_API_KEY) {
      throw new Error("Glad Tidings API key not configured");
    }
    return await makeGladTidingsRequest<PurchaseResult>("/purchase/data", "POST", {
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
    if (!GLAD_TIDINGS_API_KEY) {
      throw new Error("Glad Tidings API key not configured");
    }
    return await makeGladTidingsRequest<PurchaseResult>("/purchase/airtime", "POST", {
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
    if (!GLAD_TIDINGS_API_KEY) {
      throw new Error("Glad Tidings API key not configured");
    }
    return await makeGladTidingsRequest<PurchaseResult>("/purchase/tv", "POST", {
      subscriptionId,
      smartCardNumber,
    });
  } catch (error) {
    console.error("Failed to purchase TV subscription:", error);
    throw error;
  }
}
