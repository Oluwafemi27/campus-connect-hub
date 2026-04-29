import { supabase } from "./supabase";

export interface AdminStats {
  totalUsers: number;
  monthlyRevenue: number;
  onlineRouters: number;
  last24hTransactions: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
  status: "active" | "suspended" | "pending";
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface Broadcast {
  id: string;
  title: string;
  body: string;
  audience: "all" | "active" | "suspended";
  status: "draft" | "sent" | "scheduled";
  recipient_count: number;
  sent_at?: string;
  scheduled_at?: string;
  created_at: string;
  created_by: string;
}

export interface Feature {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface SupportMessage {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  created_at: string;
}

export interface SupportReply {
  id: string;
  message_id: string;
  reply_by: string;
  reply_text: string;
  created_at: string;
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    // Get total users count from users table
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // For now, we'll set defaults. These can be updated once you have transaction data
    // Get transactions from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: last24hTransactions, error: txError } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", twentyFourHoursAgo);

    if (txError && txError.code !== "PGRST116") {
      console.error("Error fetching transactions count:", txError);
    }

    // Get monthly revenue
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString();
    const { data: monthlyTransactions, error: monthError } = await supabase
      .from("transactions")
      .select("amount")
      .gte("created_at", monthStartStr)
      .eq("status", "completed");

    if (monthError && monthError.code !== "PGRST116") {
      console.error("Error fetching monthly transactions:", monthError);
    }

    const monthlyRevenue = (monthlyTransactions || []).reduce(
      (sum: number, t: any) => sum + (t.amount || 0),
      0
    );

    return {
      totalUsers: totalUsers || 0,
      monthlyRevenue,
      onlineRouters: 0, // Will need router tracking table
      last24hTransactions: last24hTransactions || 0,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalUsers: 0,
      monthlyRevenue: 0,
      onlineRouters: 0,
      last24hTransactions: 0,
    };
  }
}

export async function getUsers(limit = 50, offset = 0): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function searchUsers(query: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}

export async function getTransactions(limit = 50, offset = 0): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function getUserCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error getting user count:", error);
    return 0;
  }
}

// Broadcast functions
export async function getBroadcasts(limit = 50, offset = 0): Promise<Broadcast[]> {
  try {
    const { data, error } = await supabase
      .from("broadcasts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching broadcasts:", error);
    return [];
  }
}

export async function createBroadcast(broadcast: Omit<Broadcast, "id" | "created_at" | "created_by">): Promise<Broadcast | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.id) throw new Error("Not authenticated");

    // Count recipients based on audience
    let recipientCount = 0;
    if (broadcast.audience === "all") {
      const { count } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });
      recipientCount = count || 0;
    } else {
      const { count } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("status", broadcast.audience);
      recipientCount = count || 0;
    }

    const { data, error } = await supabase
      .from("broadcasts")
      .insert({
        ...broadcast,
        recipient_count: recipientCount,
        created_by: userData.user.id,
        sent_at: broadcast.status === "sent" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating broadcast:", error);
    return null;
  }
}

export async function updateBroadcast(id: string, updates: Partial<Broadcast>): Promise<Broadcast | null> {
  try {
    const { data, error } = await supabase
      .from("broadcasts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating broadcast:", error);
    return null;
  }
}

export async function sendBroadcast(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("broadcasts")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
    // In a real app, this would trigger notification service
    console.log("Broadcast sent:", id);
    return true;
  } catch (error) {
    console.error("Error sending broadcast:", error);
    return false;
  }
}

export async function deleteBroadcast(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("broadcasts")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting broadcast:", error);
    return false;
  }
}

// Feature functions
export async function getFeatures(): Promise<Feature[]> {
  try {
    const { data, error } = await supabase
      .from("features")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching features:", error);
    return [];
  }
}

export async function createFeature(feature: Omit<Feature, "id" | "created_at">): Promise<Feature | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.id) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("features")
      .insert({
        ...feature,
        created_by: userData.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating feature:", error);
    return null;
  }
}

export async function updateFeature(id: string, updates: Partial<Feature>): Promise<Feature | null> {
  try {
    const { data, error } = await supabase
      .from("features")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating feature:", error);
    return null;
  }
}

export async function deleteFeature(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("features")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting feature:", error);
    return false;
  }
}

// Support Messages functions
export async function getSupportMessages(): Promise<SupportMessage[]> {
  try {
    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching support messages:", error);
    return [];
  }
}

export async function getSupportReplies(messageId: string): Promise<SupportReply[]> {
  try {
    const { data, error } = await supabase
      .from("support_replies")
      .select("*")
      .eq("message_id", messageId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching support replies:", error);
    return [];
  }
}

export async function createSupportReply(messageId: string, replyText: string): Promise<SupportReply | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.id) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("support_replies")
      .insert({
        message_id: messageId,
        reply_by: userData.user.id,
        reply_text: replyText,
      })
      .select()
      .single();

    if (error) throw error;

    // Update message status to in_progress
    await updateMessageStatus(messageId, "in_progress");

    return data;
  } catch (error) {
    console.error("Error creating support reply:", error);
    return null;
  }
}

export async function updateMessageStatus(messageId: string, status: "open" | "in_progress" | "resolved"): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("support_messages")
      .update({ status })
      .eq("id", messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating message status:", error);
    return false;
  }
}

// Admin Settings functions
export async function getAdminSetting(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", key)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data?.setting_value || null;
  } catch (error) {
    console.error("Error fetching admin setting:", error);
    return null;
  }
}

export async function updateAdminSetting(key: string, value: string): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.id) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("admin_settings")
      .upsert({
        setting_key: key,
        setting_value: value,
        updated_by: userData.user.id,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating admin setting:", error);
    return false;
  }
}
