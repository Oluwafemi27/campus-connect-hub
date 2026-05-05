"use server";

import {
  getDataBundlesServer,
  getAirtimesServer,
  getTVSubscriptionsServer,
  purchaseDataBundleServer,
  purchaseAirtimeServer,
  purchaseTVSubscriptionServer,
} from "@/server/gsubz";

export async function fetchDataBundles() {
  try {
    console.log("[GSubz Server] Fetching data bundles...");
    const bundles = await getDataBundlesServer();
    console.log("[GSubz Server] Fetched", bundles.length, "data bundles");
    return {
      success: true,
      data: bundles,
    };
  } catch (error) {
    console.error("[GSubz Server] Error fetching data bundles:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch data bundles",
    };
  }
}

export async function fetchAirtimes() {
  try {
    console.log("[GSubz Server] Fetching airtimes...");
    const airtimes = await getAirtimesServer();
    console.log("[GSubz Server] Fetched", airtimes.length, "airtime options");
    return {
      success: true,
      data: airtimes,
    };
  } catch (error) {
    console.error("[GSubz Server] Error fetching airtimes:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch airtimes",
    };
  }
}

export async function fetchTVSubscriptions() {
  try {
    console.log("[GSubz Server] Fetching TV subscriptions...");
    const subscriptions = await getTVSubscriptionsServer();
    console.log("[GSubz Server] Fetched", subscriptions.length, "TV subscriptions");
    return {
      success: true,
      data: subscriptions,
    };
  } catch (error) {
    console.error("[GSubz Server] Error fetching TV subscriptions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch TV subscriptions",
    };
  }
}

export async function purchaseData(bundleId: string, phoneNumber: string) {
  try {
    console.log("[GSubz Server] Purchasing data bundle...");
    const result = await purchaseDataBundleServer(bundleId, phoneNumber);
    return result;
  } catch (error) {
    console.error("[GSubz Server] Error purchasing data bundle:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Purchase failed",
    };
  }
}

export async function purchaseAirtime(airtimeId: string, phoneNumber: string) {
  try {
    console.log("[GSubz Server] Purchasing airtime...");
    const result = await purchaseAirtimeServer(airtimeId, phoneNumber);
    return result;
  } catch (error) {
    console.error("[GSubz Server] Error purchasing airtime:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Purchase failed",
    };
  }
}

export async function purchaseTV(subscriptionId: string, smartCardNumber: string) {
  try {
    console.log("[GSubz Server] Purchasing TV subscription...");
    const result = await purchaseTVSubscriptionServer(subscriptionId, smartCardNumber);
    return result;
  } catch (error) {
    console.error("[GSubz Server] Error purchasing TV subscription:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Purchase failed",
    };
  }
}
