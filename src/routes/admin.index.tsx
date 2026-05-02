import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Wallet,
  Wifi,
  Activity,
  AlertCircle,
  Loader2,
  Zap,
  Radio,
  RefreshCw,
} from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useState, useEffect, useCallback } from "react";
import {
  getAdminStats,
  getLiveActivity,
  subscribeToUsers,
  subscribeToTransactions,
  subscribeToRouters,
  subscribeToAdminNotifications,
  type LiveActivity,
} from "@/lib/admin-service";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  useAdminGuard();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    monthlyRevenue: 0,
    onlineRouters: 0,
    totalRouters: 0,
    last24hTransactions: 0,
    pendingTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [liveActivity, setLiveActivity] = useState<LiveActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchLiveActivity = useCallback(async () => {
    try {
      const activities = await getLiveActivity(10);
      setLiveActivity(activities);
    } catch (error) {
      console.error("Failed to fetch live activity:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchLiveActivity();

    // Subscribe to realtime user count changes
    const usersSubscription = subscribeToUsers(() => {
      fetchStats();
      setLiveActivity((prev) => [
        {
          id: `user-${Date.now()}`,
          type: "user_registered" as const,
          message: `New user registered • ${new Date().toLocaleTimeString()}`,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9),
      ]);
    });

    // Subscribe to realtime transaction changes
    const txSubscription = subscribeToTransactions((payload: unknown) => {
      fetchStats();
      const txPayload = payload as Record<string, unknown>;
      const txType = ((txPayload.new as Record<string, unknown>)?.type as string) || "transaction";
      const txAmount = ((txPayload.new as Record<string, unknown>)?.amount as number) || 0;
      const txStatus = ((txPayload.new as Record<string, unknown>)?.status as string) || "";

      const typeLabels: Record<string, string> = {
        topup: "wallet top-up",
        airtime: "airtime purchase",
        data: "data bundle",
        tv: "TV subscription",
        router: "router connection",
      };

      setLiveActivity((prev) => [
        {
          id: `tx-${Date.now()}`,
          type: txType === "topup" ? "topup_received" : "transaction_completed",
          message: `₦${txAmount.toLocaleString()} ${typeLabels[txType] || txType} ${txStatus}`,
          timestamp: new Date().toISOString(),
          metadata: txPayload.new as Record<string, unknown>,
        },
        ...prev.slice(0, 9),
      ]);
    });

    // Subscribe to router status changes
    const routersSubscription = subscribeToRouters(() => {
      fetchStats();
      setLiveActivity((prev) => [
        {
          id: `router-${Date.now()}`,
          type: "router_connect" as const,
          message: `Router status changed • ${new Date().toLocaleTimeString()}`,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9),
      ]);
    });

    // Subscribe to admin broadcast notifications
    const adminNotificationsSubscription = subscribeToAdminNotifications((payload: unknown) => {
      const data = payload as Record<string, unknown>;
      if (data.type === "transaction_completed") {
        setLiveActivity((prev) => [
          {
            id: `notify-${Date.now()}`,
            type: "topup_received" as const,
            message: `Payment received: ₦${(data.amount as number)?.toLocaleString() || 0}`,
            timestamp: new Date().toISOString(),
            metadata: data as Record<string, unknown>,
          },
          ...prev.slice(0, 9),
        ]);
        fetchStats();
      }
    });

    return () => {
      supabase.removeChannel(usersSubscription);
      supabase.removeChannel(txSubscription);
      supabase.removeChannel(routersSubscription);
      supabase.removeChannel(adminNotificationsSubscription);
    };
  }, [fetchStats, fetchLiveActivity]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
    fetchLiveActivity();
  };

  const statsList = [
    {
      icon: Users,
      label: "Total Users",
      value: stats.totalUsers,
      hint: `${stats.activeUsers} active`,
      tint: "text-primary",
    },
    {
      icon: Wallet,
      label: "Revenue",
      value: `₦${stats.monthlyRevenue.toLocaleString()}`,
      hint: "This month",
      tint: "text-gold",
    },
    {
      icon: Wifi,
      label: "Routers",
      value: `${stats.onlineRouters}/${stats.totalRouters}`,
      hint: "Online",
      tint: "text-neon",
    },
    {
      icon: Activity,
      label: "Transactions",
      value: stats.last24hTransactions,
      hint: `${stats.pendingTransactions} pending`,
      tint: "text-accent",
    },
  ];

  const getActivityIcon = (type: LiveActivity["type"]) => {
    switch (type) {
      case "user_registered":
        return <Users className="h-3 w-3 text-primary" />;
      case "topup_received":
        return <Zap className="h-3 w-3 text-neon" />;
      case "transaction_completed":
        return <Activity className="h-3 w-3 text-accent" />;
      case "router_connect":
        return <Radio className="h-3 w-3 text-neon" />;
      default:
        return <RefreshCw className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="mt-1 text-xs text-muted-foreground">Monitor platform health & activity</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="tile-press flex items-center gap-1.5 rounded-xl bg-muted/30 px-3 py-2 text-xs font-semibold hover:bg-muted/50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-2xl p-4 animate-pulse">
                <div className="h-5 w-5 bg-muted rounded mb-2" />
                <div className="h-3 w-16 bg-muted rounded mb-1" />
                <div className="h-8 w-20 bg-muted rounded" />
                <div className="h-3 w-12 bg-muted rounded mt-1" />
              </div>
            ))}
          </>
        ) : (
          statsList.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4">
              <s.icon className={`mb-2 h-5 w-5 ${s.tint}`} />
              <p className="text-[10px] tracking-widest text-muted-foreground">
                {s.label.toUpperCase()}
              </p>
              <p className="mt-1 text-2xl font-black">{loading ? "—" : s.value}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{s.hint}</p>
            </div>
          ))
        )}
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">Live Activity</h2>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-neon animate-pulse" />
            <span className="text-[10px] text-neon font-semibold">LIVE</span>
          </div>
        </div>
        {liveActivity.length > 0 ? (
          <div className="space-y-2">
            {liveActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-2 text-xs text-muted-foreground py-1.5 border-b border-muted/20 last:border-0"
              >
                <div className="mt-0.5 shrink-0">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">{activity.message}</p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
            Waiting for activity...
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-neon" />
          <h2 className="text-sm font-bold">System Status</h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Database</span>
            <span className="text-xs font-semibold text-neon flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-neon" /> Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Realtime</span>
            <span className="text-xs font-semibold text-neon flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-neon" /> Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">API</span>
            <span className="text-xs font-semibold text-neon flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-neon" /> Ready
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Webhooks</span>
            <span className="text-xs font-semibold text-neon flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-neon" /> Configured
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
