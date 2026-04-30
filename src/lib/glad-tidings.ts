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

// Mock data for development - replace with real API calls when backend is ready
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
];

const mockAirtimes: Airtime[] = [
  { id: "100", amount: 100, price: 100, network: "mtn" },
  { id: "200", amount: 200, price: 200, network: "mtn" },
  { id: "500", amount: 500, price: 500, network: "mtn" },
  { id: "1000", amount: 1000, price: 1000, network: "mtn" },
  { id: "2000", amount: 2000, price: 2000, network: "mtn" },
  { id: "5000", amount: 5000, price: 5000, network: "mtn" },
];

const mockTVSubscriptions: TVSubscription[] = [
  {
    id: "dstv-1",
    name: "DStv Compact",
    price: 5000,
    duration: "1 month",
    provider: "DStv",
  },
  {
    id: "dstv-2",
    name: "DStv Premium",
    price: 12500,
    duration: "1 month",
    provider: "DStv",
  },
  {
    id: "gotv-1",
    name: "GOtv Plus",
    price: 3500,
    duration: "1 month",
    provider: "GOtv",
  },
];

export async function getDataBundles(): Promise<DataBundle[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!GLAD_TIDINGS_API_KEY) {
    console.warn("Using mock data - Glad Tidings API key not configured");
    return mockDataBundles;
  }

  try {
    const response = await fetch("https://api.gladtidings.app/data-bundles", {
      headers: {
        Authorization: `Bearer ${GLAD_TIDINGS_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data.data || mockDataBundles;
  } catch (error) {
    console.error("Failed to fetch data bundles, using mock data:", error);
    return mockDataBundles;
  }
}

export async function getAirtimes(): Promise<Airtime[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!GLAD_TIDINGS_API_KEY) {
    console.warn("Using mock data - Glad Tidings API key not configured");
    return mockAirtimes;
  }

  try {
    const response = await fetch("https://api.gladtidings.app/airtimes", {
      headers: {
        Authorization: `Bearer ${GLAD_TIDINGS_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data.data || mockAirtimes;
  } catch (error) {
    console.error("Failed to fetch airtimes, using mock data:", error);
    return mockAirtimes;
  }
}

export async function getTVSubscriptions(): Promise<TVSubscription[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!GLAD_TIDINGS_API_KEY) {
    console.warn("Using mock data - Glad Tidings API key not configured");
    return mockTVSubscriptions;
  }

  try {
    const response = await fetch("https://api.gladtidings.app/tv-subscriptions", {
      headers: {
        Authorization: `Bearer ${GLAD_TIDINGS_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data.data || mockTVSubscriptions;
  } catch (error) {
    console.error("Failed to fetch TV subscriptions, using mock data:", error);
    return mockTVSubscriptions;
  }
}

export async function purchaseDataBundle(bundleId: string, phoneNumber: string): Promise<any> {
  if (!GLAD_TIDINGS_API_KEY) {
    console.warn("Purchase not available - API key not configured");
    return { success: true, message: "Purchase queued" };
  }

  try {
    const response = await fetch("https://api.gladtidings.app/purchase/data", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GLAD_TIDINGS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bundleId, phoneNumber }),
    });

    if (!response.ok) throw new Error("Purchase failed");
    return await response.json();
  } catch (error) {
    console.error("Failed to purchase data bundle:", error);
    throw error;
  }
}

export async function purchaseAirtime(airtimeId: string, phoneNumber: string): Promise<any> {
  if (!GLAD_TIDINGS_API_KEY) {
    console.warn("Purchase not available - API key not configured");
    return { success: true, message: "Purchase queued" };
  }

  try {
    const response = await fetch("https://api.gladtidings.app/purchase/airtime", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GLAD_TIDINGS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ airtimeId, phoneNumber }),
    });

    if (!response.ok) throw new Error("Purchase failed");
    return await response.json();
  } catch (error) {
    console.error("Failed to purchase airtime:", error);
    throw error;
  }
}

export async function purchaseTVSubscription(subscriptionId: string, smartCardNumber: string): Promise<any> {
  if (!GLAD_TIDINGS_API_KEY) {
    console.warn("Purchase not available - API key not configured");
    return { success: true, message: "Purchase queued" };
  }

  try {
    const response = await fetch("https://api.gladtidings.app/purchase/tv", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GLAD_TIDINGS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscriptionId, smartCardNumber }),
    });

    if (!response.ok) throw new Error("Purchase failed");
    return await response.json();
  } catch (error) {
    console.error("Failed to purchase TV subscription:", error);
    throw error;
  }
}
