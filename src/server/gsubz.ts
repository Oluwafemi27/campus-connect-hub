"use server";

import { createClient } from "@supabase/supabase-js";

// Use environment variables for Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

// Create Supabase client to call edge functions
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

async function callGsubzApi<T>(action: string): Promise<T> {
  console.log(`[Gsubz] Calling edge function for action: ${action}`);

  try {
    const { data, error } = await supabase.functions.invoke("gsubz-api", {
      body: { action },
    });

    if (error) {
      console.error(`[Gsubz] Edge function error:`, error);
      throw new Error(error.message || "Edge function error");
    }

    if (!data?.success) {
      console.error(`[Gsubz] API returned success: false`, data);
      throw new Error(data?.error || "API request failed");
    }

    console.log(`[Gsubz] Got ${action} data:`, data?.data?.length || 0, "items");
    return data.data as T;
  } catch (error) {
    console.error(
      `[Gsubz] Error calling edge function for ${action}:`,
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}

async function getDataBundles(): Promise<DataBundle[]> {
  console.log("📡 Fetching data bundles via edge function...");
  const bundles = await callGsubzApi<DataBundle[]>("data");

  if (!bundles || bundles.length === 0) {
    console.error("❌ No data bundles received");
    throw new Error("No data bundles available");
  }

  console.log("✅ Data bundles loaded:", bundles.length);
  return bundles;
}

async function getAirtimes(): Promise<Airtime[]> {
  console.log("📡 Fetching airtimes via edge function...");
  const airtimes = await callGsubzApi<Airtime[]>("airtime");

  if (!airtimes || airtimes.length === 0) {
    console.error("❌ No airtimes received");
    throw new Error("No airtimes available");
  }

  console.log("✅ Airtimes loaded:", airtimes.length);
  return airtimes;
}

async function getTVSubscriptions(): Promise<TVSubscription[]> {
  console.log("📡 Fetching TV subscriptions via edge function...");
  const subscriptions = await callGsubzApi<TVSubscription[]>("tv");

  if (!subscriptions || subscriptions.length === 0) {
    console.error("❌ No TV subscriptions received");
    throw new Error("No TV subscriptions available");
  }

  console.log("✅ TV subscriptions loaded:", subscriptions.length);
  return subscriptions;
}

async function purchaseDataBundle(
  bundleId: string,
  phoneNumber: string,
  network: string,
  price?: number,
): Promise<PurchaseResult> {
  console.log(`[Gsubz] Purchase initiated: bundleId=${bundleId}, phone=${phoneNumber}, network=${network}, price=${price}`);

  // Purchase is handled through Gsubz widget or webhook
  // This function just logs the request for now
  return {
    success: true,
    message: "Data purchase initiated. Please complete payment.",
  };
}

async function purchaseAirtime(
  amount: number,
  phoneNumber: string,
  network: string,
): Promise<PurchaseResult> {
  console.log(`[Gsubz] Purchase initiated: amount=${amount}, phone=${phoneNumber}, network=${network}`);

  // Purchase is handled through Gsubz widget or webhook
  // This function just logs the request for now
  return {
    success: true,
    message: "Airtime purchase initiated. Please complete payment.",
  };
}

async function purchaseTVSubscription(
  packageId: string,
  smartCardNumber: string,
  provider: string,
): Promise<PurchaseResult> {
  console.log(`[Gsubz] Purchase initiated: packageId=${packageId}, smartCard=${smartCardNumber}, provider=${provider}`);

  // Purchase is handled through Gsubz widget or webhook
  // This function just logs the request for now
  return {
    success: true,
    message: "TV subscription initiated. Please complete payment.",
  };
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
