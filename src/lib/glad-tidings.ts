const GLAD_TIDINGS_API_KEY = import.meta.env.VITE_GLAD_TIDINGS_API_KEY || "";
const GLAD_TIDINGS_BASE_URL = "https://api.gladtidings.app";

if (!GLAD_TIDINGS_API_KEY) {
  console.warn("Glad Tidings API key not configured");
}

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

async function makeRequest<T>(endpoint: string, method: string = "GET", body?: any): Promise<T> {
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

export async function getDataBundles(): Promise<DataBundle[]> {
  try {
    const response = await makeRequest<{ data: DataBundle[] }>("/data-bundles");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch data bundles:", error);
    throw error;
  }
}

export async function getAirtimes(): Promise<Airtime[]> {
  try {
    const response = await makeRequest<{ data: Airtime[] }>("/airtimes");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch airtimes:", error);
    throw error;
  }
}

export async function getTVSubscriptions(): Promise<TVSubscription[]> {
  try {
    const response = await makeRequest<{ data: TVSubscription[] }>("/tv-subscriptions");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch TV subscriptions:", error);
    throw error;
  }
}

export async function purchaseDataBundle(bundleId: string, phoneNumber: string): Promise<any> {
  try {
    return await makeRequest("/purchase/data", "POST", {
      bundleId,
      phoneNumber,
    });
  } catch (error) {
    console.error("Failed to purchase data bundle:", error);
    throw error;
  }
}

export async function purchaseAirtime(airtimeId: string, phoneNumber: string): Promise<any> {
  try {
    return await makeRequest("/purchase/airtime", "POST", {
      airtimeId,
      phoneNumber,
    });
  } catch (error) {
    console.error("Failed to purchase airtime:", error);
    throw error;
  }
}

export async function purchaseTVSubscription(subscriptionId: string, smartCardNumber: string): Promise<any> {
  try {
    return await makeRequest("/purchase/tv", "POST", {
      subscriptionId,
      smartCardNumber,
    });
  } catch (error) {
    console.error("Failed to purchase TV subscription:", error);
    throw error;
  }
}
