import { supabase } from "./supabase";

export interface AdminStats {
  totalUsers: number;
  monthlyRevenue: number;
  onlineRouters: number;
  totalRouters: number;
  last24hTransactions: number;
  pendingTransactions: number;
  activeUsers: number;
}

export interface Router {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "maintenance";
  connected_users: number;
  bandwidth_mbps: number;
  last_seen?: string;
  created_at: string;
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
  type: "airtime" | "data" | "tv" | "topup" | "router";
  amount: number;
  status: "pending" | "completed" | "failed";
  phone_number?: string;
  operator?: string;
  description?: string;
  glad_tidings_ref?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
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

export type RealtimeCallback<T> = (payload: T) => void;

export function subscribeToUsers(callback: RealtimeCallback<unknown>) {
  return supabase
    .channel("users_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "users" }, callback)
    .subscribe();
}

export function subscribeToTransactions(callback: RealtimeCallback<unknown>) {
  return supabase
    .channel("transactions_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, callback)
    .subscribe();
}

export function subscribeToBroadcasts(callback: RealtimeCallback<unknown>) {
  return supabase
    .channel("broadcasts_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "broadcasts" }, callback)
    .subscribe();
}

export function subscribeToFeatures(callback: RealtimeCallback<unknown>) {
  return supabase
    .channel("features_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "features" }, callback)
    .subscribe();
}

export function subscribeToSupportMessages(callback: RealtimeCallback<unknown>) {
  return supabase
    .channel("support_messages_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "support_messages" }, callback)
    .subscribe();
}

export function subscribeToWallets(callback: RealtimeCallback<unknown>) {
  return supabase
    .channel("wallets_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "wallets" }, callback)
    .subscribe();
}

export function subscribeToRouters(callback: RealtimeCallback<unknown>) {
  return supabase
    .channel("routers_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "routers" }, callback)
    .subscribe();
}

export function subscribeToAdminNotifications(callback: RealtimeCallback<unknown>) {
  return supabase
    .channel("admin_notifications")
    .on("broadcast", { event: "*" }, (payload) => {
      callback(payload.payload);
    })
    .subscribe();
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    // Get total users count from users table
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get active users count
    const { count: activeUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get transactions from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: last24hTransactions } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", twentyFourHoursAgo);

    // Get pending transactions count
    const { count: pendingTransactions } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Get monthly revenue
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthStartStr = monthStart.toISOString();

    const { data: monthlyTransactions } = await supabase
      .from("transactions")
      .select("amount")
      .gte("created_at", monthStartStr)
      .eq("status", "completed");

    const monthlyRevenue = (monthlyTransactions || []).reduce(
      (sum: number, t: { amount: number }) => sum + (t.amount || 0),
      0,
    );

    // Get router counts
    const { count: totalRouters } = await supabase
      .from("routers")
      .select("*", { count: "exact", head: true });

    const { data: onlineRoutersData } = await supabase
      .from("routers")
      .select("id")
      .eq("status", "online");

    const onlineRouters = onlineRoutersData?.length || 0;

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      monthlyRevenue,
      onlineRouters,
      totalRouters: totalRouters || 0,
      last24hTransactions: last24hTransactions || 0,
      pendingTransactions: pendingTransactions || 0,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      monthlyRevenue: 0,
      onlineRouters: 0,
      totalRouters: 0,
      last24hTransactions: 0,
      pendingTransactions: 0,
    };
  }
}

export async function getUsers(limit = 50, offset = 0): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
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
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}

export async function updateUserStatus(
  userId: string,
  status: "active" | "suspended" | "pending",
): Promise<boolean> {
  try {
    const { error } = await supabase.from("users").update({ status }).eq("id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating user status:", error);
    return false;
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

export async function createBroadcast(
  broadcast: Omit<Broadcast, "id" | "created_at" | "created_by" | "recipient_count">,
): Promise<Broadcast | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.id) throw new Error("Not authenticated");

    // Count recipients based on audience
    let recipientCount = 0;
    if (broadcast.audience === "all") {
      const { count } = await supabase.from("users").select("*", { count: "exact", head: true });
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
        title: broadcast.title,
        body: broadcast.body,
        audience: broadcast.audience,
        status: broadcast.status,
        recipient_count: recipientCount,
        created_by: userData.user.id,
        sent_at: broadcast.status === "sent" ? new Date().toISOString() : null,
        scheduled_at: broadcast.scheduled_at || null,
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

export async function updateBroadcast(
  id: string,
  updates: Partial<Broadcast>,
): Promise<Broadcast | null> {
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
    console.log("Broadcast sent:", id);
    return true;
  } catch (error) {
    console.error("Error sending broadcast:", error);
    return false;
  }
}

export async function deleteBroadcast(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("broadcasts").delete().eq("id", id);

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

export async function createFeature(
  feature: Omit<Feature, "id" | "created_at">,
): Promise<Feature | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.id) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("features")
      .insert({
        title: feature.title,
        description: feature.description || null,
        icon: feature.icon || null,
        image_url: feature.image_url || null,
        is_active: feature.is_active ?? true,
        display_order: feature.display_order ?? 0,
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

export async function updateFeature(
  id: string,
  updates: Partial<Feature>,
): Promise<Feature | null> {
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
    const { error } = await supabase.from("features").delete().eq("id", id);

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

export async function createSupportReply(
  messageId: string,
  replyText: string,
): Promise<SupportReply | null> {
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

export async function updateMessageStatus(
  messageId: string,
  status: "open" | "in_progress" | "resolved",
): Promise<boolean> {
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

    const { error } = await supabase.from("admin_settings").upsert({
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

// Get all settings
export async function getAllAdminSettings(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from("admin_settings")
      .select("setting_key, setting_value");

    if (error) throw error;

    const settings: Record<string, string> = {};
    (data || []).forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    return settings;
  } catch (error) {
    console.error("Error fetching all admin settings:", error);
    return {};
  }
}

// Operator settings
export interface OperatorSettings {
  mtn: boolean;
  airtel: boolean;
  glo: boolean;
  "9mobile": boolean;
}

export async function getOperatorSettings(): Promise<OperatorSettings> {
  try {
    const settings = await getAllAdminSettings();
    return {
      mtn: settings["operator_mtn"] !== "false",
      airtel: settings["operator_airtel"] !== "false",
      glo: settings["operator_glo"] !== "false",
      "9mobile": settings["operator_9mobile"] !== "false",
    };
  } catch (error) {
    console.error("Error getting operator settings:", error);
    return { mtn: true, airtel: true, glo: true, "9mobile": true };
  }
}

export async function updateOperatorSettings(operators: OperatorSettings): Promise<boolean> {
  try {
    const updates = [
      updateAdminSetting("operator_mtn", String(operators.mtn)),
      updateAdminSetting("operator_airtel", String(operators.airtel)),
      updateAdminSetting("operator_glo", String(operators.glo)),
      updateAdminSetting("operator_9mobile", String(operators["9mobile"])),
    ];

    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error("Error updating operator settings:", error);
    return false;
  }
}

// Router management functions
export async function getRouters(): Promise<Router[]> {
  try {
    const { data, error } = await supabase
      .from("routers")
      .select("*")
      .order("status", { ascending: false })
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching routers:", error);
    return [];
  }
}

export async function getOnlineRoutersCount(): Promise<number> {
  try {
    const { data, error } = await supabase.from("routers").select("id").eq("status", "online");

    if (error) throw error;
    return data?.length || 0;
  } catch (error) {
    console.error("Error getting online routers count:", error);
    return 0;
  }
}

export async function getRouterStats(): Promise<{
  online: number;
  offline: number;
  maintenance: number;
  totalConnected: number;
  totalBandwidth: number;
}> {
  try {
    const { data: routers } = await supabase.from("routers").select("*");

    if (!routers) {
      return { online: 0, offline: 0, maintenance: 0, totalConnected: 0, totalBandwidth: 0 };
    }

    const stats = {
      online: 0,
      offline: 0,
      maintenance: 0,
      totalConnected: 0,
      totalBandwidth: 0,
    };

    routers.forEach((router) => {
      if (router.status === "online") stats.online++;
      else if (router.status === "offline") stats.offline++;
      else if (router.status === "maintenance") stats.maintenance++;

      stats.totalConnected += router.connected_users || 0;
      stats.totalBandwidth += router.bandwidth_mbps || 0;
    });

    return stats;
  } catch (error) {
    console.error("Error getting router stats:", error);
    return { online: 0, offline: 0, maintenance: 0, totalConnected: 0, totalBandwidth: 0 };
  }
}

export async function updateRouter(id: string, updates: Partial<Router>): Promise<Router | null> {
  try {
    const { data, error } = await supabase
      .from("routers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating router:", error);
    return null;
  }
}

// Live activity feed for admin dashboard
export interface LiveActivity {
  id: string;
  type:
    | "user_registered"
    | "transaction_completed"
    | "topup_received"
    | "support_ticket"
    | "router_connect";
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export async function getLiveActivity(limit = 10): Promise<LiveActivity[]> {
  try {
    // Combine recent transactions and users for live activity
    const [transactions, users] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase.from("users").select("*").order("created_at", { ascending: false }).limit(limit),
    ]);

    const activities: LiveActivity[] = [];

    // Add transaction activities
    (transactions.data || []).forEach((tx) => {
      const txTypeLabels: Record<string, string> = {
        topup: "wallet top-up",
        airtime: "airtime purchase",
        data: "data purchase",
        tv: "TV subscription",
        router: "router connection",
      };

      activities.push({
        id: `tx-${tx.id}`,
        type: tx.type === "topup" ? "topup_received" : "transaction_completed",
        message: `₦${tx.amount.toLocaleString()} ${txTypeLabels[tx.type] || tx.type} ${tx.status}`,
        timestamp: tx.created_at,
        metadata: { transaction_id: tx.id, user_id: tx.user_id, status: tx.status },
      });
    });

    // Add user registration activities (for new users)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    (users.data || [])
      .filter((u) => new Date(u.created_at) > new Date(oneHourAgo))
      .forEach((user) => {
        activities.push({
          id: `user-${user.id}`,
          type: "user_registered",
          message: `New user registered: ${user.name || user.email}`,
          timestamp: user.created_at,
          metadata: { user_id: user.id },
        });
      });

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, limit);
  } catch (error) {
    console.error("Error fetching live activity:", error);
    return [];
  }
}

// Notification functions
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error marking notification read:", error);
    return false;
  }
}

export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error marking all notifications read:", error);
    return false;
  }
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error getting unread notifications count:", error);
    return 0;
  }
}
