import { supabase } from "@/lib/supabase";
import {
  getDataBundles,
  getAirtimes,
  getTVSubscriptions,
  purchaseDataBundle,
  purchaseAirtime,
  purchaseTVSubscription,
  type DataBundle,
  type Airtime,
  type TVSubscription,
} from "@/lib/gsubz";

export type { DataBundle, Airtime, TVSubscription };

export interface PurchaseResult {
  success: boolean;
  message: string;
  reference?: string;
  details?: Record<string, unknown>;
}

// Server functions that directly fetch from Gsubz API
export async function getDataBundlesServer(): Promise<DataBundle[]> {
  try {
    const bundles = await getDataBundles();
    console.log("✓ Loaded", bundles.length, "data bundles from Gsubz");
    return bundles;
  } catch (error) {
    console.error("Failed to fetch data bundles:", error);
    return [];
  }
}

export async function getAirtimesServer(): Promise<Airtime[]> {
  try {
    const airtimes = await getAirtimes();
    console.log("✓ Loaded", airtimes.length, "airtime options from Gsubz");
    return airtimes;
  } catch (error) {
    console.error("Failed to fetch airtimes:", error);
    return [];
  }
}

export async function getTVSubscriptionsServer(): Promise<TVSubscription[]> {
  try {
    const subscriptions = await getTVSubscriptions();
    console.log("✓ Loaded", subscriptions.length, "TV subscriptions from Gsubz");
    return subscriptions;
  } catch (error) {
    console.error("Failed to fetch TV subscriptions:", error);
    return [];
  }
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
