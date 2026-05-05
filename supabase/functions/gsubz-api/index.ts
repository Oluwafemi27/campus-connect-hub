import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DataBundle {
  id: string;
  name: string;
  amount: number;
  price: number;
  validity: string;
  network: string;
}

interface Airtime {
  id: string;
  amount: number;
  price: number;
  network: string;
}

interface TVSubscription {
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

const GSUBZ_API_KEY = Deno.env.get("GSUBZ_API_KEY");
const GSUBZ_BASE_URL = "https://app.gsubz.com/api";

async function fetchGsubzApi<T>(
  endpoint: string,
  method: string = "GET",
): Promise<GsubzResponse<T>> {
  const url = `${GSUBZ_BASE_URL}${endpoint}`;

  console.log(`[Gsubz] ${method} ${url}`);
  console.log(`[Gsubz] API Key configured: ${GSUBZ_API_KEY ? "✓" : "✗"}`);

  if (!GSUBZ_API_KEY) {
    throw new Error("Gsubz API key not configured in Supabase secrets");
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "api_key": GSUBZ_API_KEY,
    };

    const response = await fetch(url, {
      method,
      headers,
    });

    console.log(`[Gsubz] Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[Gsubz] API Error response:`, errorData);
      throw new Error(`API Error: ${response.status}`);
    }

    const data: GsubzResponse<T> = await response.json();
    console.log(`[Gsubz] Response code: ${data.code}, Description: ${data.description}`);
    return data;
  } catch (error) {
    console.error(
      `[Gsubz] API Error [${method} ${endpoint}]:`,
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

async function getDataBundles(): Promise<DataBundle[]> {
  console.log("📡 Fetching data bundles from Gsubz API...");

  const response = await fetchGsubzApi<{
    plans?: Array<{
      displayName?: string;
      value?: string;
      price?: string;
    }>;
    [key: string]: unknown;
  }>("/plans?service=mtn_cg");

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

  const response = await fetchGsubzApi<{
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

  const response = await fetchGsubzApi<{
    plans?: Array<{
      displayName?: string;
      value?: string;
      price?: string;
    }>;
    [key: string]: unknown;
  }>("/plans?service=gotv");

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();

    console.log(`[API] Received request for action: ${action}`);

    let result;

    switch (action) {
      case "data":
        result = await getDataBundles();
        break;
      case "airtime":
        result = await getAirtimes();
        break;
      case "tv":
        result = await getTVSubscriptions();
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[API] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
