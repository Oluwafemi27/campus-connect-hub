import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-glad-tidings-signature",
};

interface GladTidingsWebhookPayload {
  event: "payment.received" | "payment.failed" | "payment.refunded";
  reference: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  customer_email?: string;
  customer_name?: string;
  narration?: string;
  metadata?: {
    user_id?: string;
    transaction_id?: string;
    virtual_account?: string;
  };
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const gladTidingsApiKey = Deno.env.get("GLAD_TIDINGS_API_KEY");

    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload
    const payload: GladTidingsWebhookPayload = await req.json();

    console.log("Received Glad Tidings webhook:", JSON.stringify(payload));

    // Validate webhook signature (if API key is configured)
    const signature = req.headers.get("x-glad-tidings-signature");
    if (gladTidingsApiKey && signature) {
      const expectedSignature = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(JSON.stringify(payload) + gladTidingsApiKey),
      );
      const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (signature !== expectedSignatureHex) {
        console.error("Invalid webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Handle payment received event
    if (payload.event === "payment.received" && payload.status === "success") {
      const { reference, amount, metadata } = payload;

      // Idempotency check: Check if this reference was already processed
      const { data: existingTx } = await supabase
        .from("transactions")
        .select("id, status")
        .eq("glad_tidings_ref", reference)
        .single();

      if (existingTx) {
        console.log(`Transaction ${reference} already processed, skipping`);
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
      let userId = metadata?.user_id;

      // If no user_id in metadata, try to find by virtual account or transaction_id
      if (!userId) {
        if (metadata?.transaction_id) {
          // Find the pending transaction and get the user_id
          const { data: pendingTx } = await supabase
            .from("transactions")
            .select("user_id")
            .eq("id", metadata.transaction_id)
            .eq("status", "pending")
            .single();

          if (pendingTx) {
            userId = pendingTx.user_id;
          }
        } else if (metadata?.virtual_account) {
          // Try to find user by virtual account reference stored in metadata
          // This would require a user_wallets table or similar
          const { data: walletData } = await supabase
            .from("wallets")
            .select("user_id")
            .eq("virtual_account", metadata.virtual_account)
            .single();

          if (walletData) {
            userId = walletData.user_id;
          }
        }
      }

      // If still no user found, log the unrecognized deposit
      if (!userId) {
        console.log(`Unrecognized deposit: ${reference}, amount: ${amount}`);

        // Option 1: Create an unassigned transaction for admin review
        // For now, we'll log it and return success to acknowledge receipt
        // In production, you might want to create a record for admin review
        return new Response(
          JSON.stringify({
            success: true,
            message: "Payment received but user not identified",
            reference,
            amount,
            requires_manual_review: true,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Update or create the transaction
      if (metadata?.transaction_id) {
        // Update existing pending transaction
        const { data: updatedTx, error: updateError } = await supabase
          .from("transactions")
          .update({
            status: "completed",
            glad_tidings_ref: reference,
            verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", metadata.transaction_id)
          .eq("status", "pending")
          .select()
          .single();

        if (updateError) {
          console.error("Error updating transaction:", updateError);
        } else if (updatedTx) {
          console.log(`Transaction ${metadata.transaction_id} updated to completed`);

          // Credit the user's wallet
          await creditUserWallet(supabase, userId, amount);

          // Broadcast real-time notification
          await broadcastTransactionNotification(supabase, userId, updatedTx);
        }
      } else {
        // Create a new topup transaction
        const { data: newTx, error: insertError } = await supabase
          .from("transactions")
          .insert({
            user_id: userId,
            type: "topup",
            amount: amount,
            status: "completed",
            glad_tidings_ref: reference,
            verified: true,
            description: `Wallet top-up via Glad Tidings (${payload.narration || "bank transfer"})`,
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
    }

    // Handle payment failed event
    if (payload.event === "payment.failed") {
      const { metadata } = payload;

      if (metadata?.transaction_id) {
        await supabase
          .from("transactions")
          .update({
            status: "failed",
            glad_tidings_ref: payload.reference,
            updated_at: new Date().toISOString(),
          })
          .eq("id", metadata.transaction_id)
          .eq("status", "pending");
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
  // Broadcast to the user's channel for real-time UI update
  const channelName = `user_${userId}`;

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
