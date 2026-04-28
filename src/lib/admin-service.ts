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

export async function getAdminStats(): Promise<AdminStats> {
  try {
    // Get total users count
    const { count: totalUsers } = await supabase
      .from("auth.users")
      .select("*", { count: "exact", head: true });

    // For now, we'll set defaults. These can be updated once you have transaction data
    // Get transactions from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: last24hTransactions } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", twentyFourHoursAgo)
      .catch(() => ({ count: 0 }));

    // Get monthly revenue
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString();
    const { data: monthlyTransactions } = await supabase
      .from("transactions")
      .select("amount")
      .gte("created_at", monthStartStr)
      .eq("status", "completed")
      .catch(() => ({ data: [] }));

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
