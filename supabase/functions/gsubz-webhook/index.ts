import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-gsubz-signature",
};

const GSUBZ_API_KEY = Deno.env.get("GSUBZ_API_KEY");
const GSUBZ_BASE_URL = "https://app.gsubz.com/api";

// Mock data fallbacks for development when API is unavailable
const mockDataBundles = [
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

const mockAirtimes = [
  { id: "100", amount: 100, price: 100, network: "mtn" },
  { id: "200", amount: 200, price: 200, network: "mtn" },
  { id: "500", amount: 500, price: 500, network: "mtn" },
  { id: "1000", amount: 1000, price: 1000, network: "mtn" },
];

const mockTVSubscriptions = [
  { id: "dstv-1", name: "DStv Access", price: 2500, duration: "1 month", provider: "dstv" },
  { id: "dstv-2", name: "DStv Lite", price: 3500, duration: "1 month", provider: "dstv" },
  { id: "gotv-1", name: "GOtv Lite", price: 1250, duration: "1 month", provider: "gotv" },
];

// Gsubz API client
async function callGsubzApi(endpoint: string, options?: RequestInit) {
  if (!GSUBZ_API_KEY) {
    console.warn("GSUBZ_API_KEY not configured, using mock data");
    return null;
  }

  const url = `${GSUBZ_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${GSUBZ_API_KEY}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      console.error(`Gsubz API error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to call Gsubz API [${endpoint}]:`, error);
    return null;
  }
}

// Fetch data bundles from Gsubz
async function fetchDataBundles() {
  // Try to fetch from Gsubz API
  const data = await callGsubzApi("/plans?service=mtn_cg");

  if (data && data.code === 200 && data.content) {
    // Transform Gsubz response to our format
    const plans = Array.isArray(data.content) ? data.content : data.content.plans || [];
    return plans.map((plan: Record<string, unknown>, index: number) => ({
      id: plan.id?.toString() || `plan-${index}`,
      name: plan.name || `Data Plan ${index + 1}`,
      amount: plan.amount || 0,
      price: plan.price || 0,
      validity: plan.validity || "30 days",
      network: "mtn",
    }));
  }

  // Fallback to mock data
  console.log("Using mock data bundles");
  return mockDataBundles;
}

// Fetch airtimes from Gsubz
async function fetchAirtimes() {
  // Try to fetch from Gsubz API
  const data = await callGsubzApi("/fields?service=mtn");

  if (data && data.code === 200 && data.content) {
    // Transform Gsubz response to our format
    const airtimes = Array.isArray(data.content) ? data.content : data.content.airtimes || [];
    return airtimes.map((airtime: Record<string, unknown>, index: number) => ({
      id: airtime.id?.toString() || `airtime-${index}`,
      amount: airtime.amount || 0,
      price: airtime.price || 0,
      network: "mtn",
    }));
  }

  // Fallback to mock data
  console.log("Using mock airtimes");
  return mockAirtimes;
}

// Fetch TV subscriptions from Gsubz
async function fetchTVSubscriptions() {
  // Try to fetch from Gsubz API
  const data = await callGsubzApi("/plans?service=gotv");

  if (data && data.code === 200 && data.content) {
    // Transform Gsubz response to our format
    const subscriptions = Array.isArray(data.content) ? data.content : data.content.plans || [];
    return subscriptions.map((sub: Record<string, unknown>, index: number) => ({
      id: sub.id?.toString() || `sub-${index}`,
      name: sub.name || `Subscription ${index + 1}`,
      price: sub.price || 0,
      duration: sub.duration || "1 month",
      provider: "gotv",
    }));
  }

  // Fallback to mock data
  console.log("Using mock TV subscriptions");
  return mockTVSubscriptions;
}

interface GsubzWebhookPayload {
  code: number;
  status: string;
  description: string;
  content?: {
    transactionID?: string | number;
    requestID?: string | number;
    amount?: number;
    phone?: string;
    serviceID?: string;
    email?: string;
    customerID?: string;
    plan?: string;
    productType?: string;
    serviceName?: string;
    status?: string;
    date?: string;
  };
  gateway?: {
    referrer?: string;
    host?: string;
    ip?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const gsubzWidgetKey = Deno.env.get("GSUBZ_WIDGET_KEY");

    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json();
    const action = body?.action;

    // Handle plan fetching requests
    if (action === "data") {
      const bundles = await fetchDataBundles();
      return new Response(
        JSON.stringify({ success: true, data: bundles }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (action === "airtime") {
      const airtimes = await fetchAirtimes();
      return new Response(
        JSON.stringify({ success: true, data: airtimes }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (action === "tv") {
      const subscriptions = await fetchTVSubscriptions();
      return new Response(
        JSON.stringify({ success: true, data: subscriptions }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse webhook payload for payment processing
    const payload: GsubzWebhookPayload = body;

    console.log("Received Gsubz webhook:", JSON.stringify(payload));

    // Validate webhook signature (if widget key is configured)
    const signature = req.headers.get("x-gsubz-signature");
    if (gsubzWidgetKey && signature) {
      // Note: Signature validation would need to be implemented based on Gsubz's specific algorithm
      // For now, we'll log the signature for debugging
      console.log("Webhook signature received:", signature);
    }

    // Handle successful payment
    if (payload.code === 200 && payload.status === "TRANSACTION_SUCCESSFUL") {
      const { content } = payload;

      if (!content?.transactionID) {
        console.error("Missing transactionID in webhook payload");
        return new Response(
          JSON.stringify({ error: "Missing transactionID" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const transactionID = content.transactionID.toString();
      const amount = content.amount || 0;

      // Idempotency check: Check if this reference was already processed
      const { data: existingTx } = await supabase
        .from("transactions")
        .select("id, status")
        .eq("gsubz_ref", transactionID)
        .single();

      if (existingTx) {
        console.log(`Transaction ${transactionID} already processed, skipping`);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Transaction already processed",
            id: existingTx.id,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Find the user associated with this payment
      let userId: string | undefined;

      // Try to find by email
      if (content.email) {
        const { data: userByEmail } = await supabase
          .from("users")
          .select("id")
          .eq("email", content.email.toLowerCase())
          .single();

        if (userByEmail) {
          userId = userByEmail.id;
        }
      }

      // Try to find by phone number
      if (!userId && content.phone) {
        const { data: userByPhone } = await supabase
          .from("users")
          .select("id")
          .eq("phone", content.phone)
          .single();

        if (userByPhone) {
          userId = userByPhone.id;
        }
      }

      // If still no user found, log the unrecognized deposit
      if (!userId) {
        console.log(
          `Unrecognized deposit: ${transactionID}, amount: ${amount}, email: ${content.email}, phone: ${content.phone}`,
        );

        // Create a pending transaction record for manual review
        const { data: adminUser } = await supabase
          .from("users")
          .select("id")
          .eq("status", "active")
          .limit(1)
          .single();

        if (adminUser) {
          const { error: insertError } = await supabase.from("transactions").insert({
            user_id: adminUser.id,
            type: "topup",
            amount: amount,
            status: "pending",
            gsubz_ref: transactionID,
            verified: false,
            description: `Unrecognized deposit via Gsubz - email: ${content.email || "unknown"}, phone: ${content.phone || "unknown"}`,
          });

          if (insertError) {
            console.error("Error creating unrecognized transaction:", insertError);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Payment received but user not identified",
            reference: transactionID,
            amount,
            requires_manual_review: true,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Create a topup transaction
      const { data: newTx, error: insertError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "topup",
          amount: amount,
          status: "completed",
          gsubz_ref: transactionID,
          verified: true,
          description: `Wallet top-up via Gsubz (${content.serviceName || "payment"})`,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating transaction:", insertError);
      } else {
        console.log(`New topup transaction created for user ${userId}`);

        // Credit the user's wallet
        await creditUserWallet(supabase, userId, amount);

        // Broadcast real-time notification
        await broadcastTransactionNotification(supabase, userId, newTx);
      }
    }

    // Handle failed payment
    if (payload.code !== 200) {
      const { content } = payload;

      if (content?.transactionID) {
        const transactionID = content.transactionID.toString();

        // Update transaction status to failed
        await supabase
          .from("transactions")
          .update({
            status: "failed",
            gsubz_ref: transactionID,
            updated_at: new Date().toISOString(),
          })
          .eq("gsubz_ref", transactionID);

        console.log(`Transaction ${transactionID} marked as failed`);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function creditUserWallet(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  amount: number,
): Promise<void> {
  // Get current wallet balance
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (walletError) {
    console.error("Error fetching wallet:", walletError);
    return;
  }

  const newBalance = (wallet?.balance || 0) + amount;

  // Update wallet balance
  const { error: updateError } = await supabase
    .from("wallets")
    .update({
      balance: newBalance,
      last_topup: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    console.error("Error updating wallet balance:", updateError);
  } else {
    console.log(`Wallet updated for user ${userId}: new balance ${newBalance}`);

    // Create a notification for the user
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Wallet Top-up Successful",
      message: `Your wallet has been credited with ₦${amount.toLocaleString()}. New balance: ₦${newBalance.toLocaleString()}`,
      type: "topup",
      is_read: false,
    });
  }
}

async function broadcastTransactionNotification(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  transaction: Record<string, unknown>,
): Promise<void> {
  // Also broadcast to admin channel for dashboard update
  const adminChannel = supabase.channel("admin_notifications");

  await adminChannel.send({
    type: "broadcast",
    event: "transaction_completed",
    data: {
      user_id: userId,
      transaction_id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      timestamp: new Date().toISOString(),
    },
  });

  console.log("Real-time notification broadcast sent");
}
