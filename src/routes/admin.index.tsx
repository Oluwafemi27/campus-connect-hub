import { createFileRoute } from "@tanstack/react-router";
import { Users, Wallet, Wifi, Activity, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useState, useEffect, useCallback } from "react";
import { getAdminStats, subscribeToUsers, subscribeToTransactions } from "@/lib/admin-service";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  useAdminGuard();
  const [stats, setStats] = useState({
    totalUsers: 0,
    monthlyRevenue: 0,
    onlineRouters: 0,
    last24hTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [liveActivity, setLiveActivity] = useState<string[]>([]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Subscribe to realtime user count changes
    const usersSubscription = subscribeToUsers(() => {
      fetchStats();
      setLiveActivity((prev) => [
        `New user registered • ${new Date().toLocaleTimeString()}`,
        ...prev.slice(0, 4),
      ]);
    });

    // Subscribe to realtime transaction changes
    const txSubscription = subscribeToTransactions(() => {
      fetchStats();
      setLiveActivity((prev) => [
        `Transaction processed • ${new Date().toLocaleTimeString()}`,
        ...prev.slice(0, 4),
      ]);
    });

    return () => {
      supabase.removeChannel(usersSubscription);
      supabase.removeChannel(txSubscription);
    };
  }, [fetchStats]);

  const statsList = [
    {
      icon: Users,
      label: "Total Users",
      value: stats.totalUsers,
      hint: "Active accounts",
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
      value: stats.onlineRouters,
      hint: "Online now",
      tint: "text-neon",
    },
    {
      icon: Activity,
      label: "Transactions",
      value: stats.last24hTransactions,
      hint: "Last 24h",
      tint: "text-accent",
    },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-xs text-muted-foreground">Monitor platform health & activity</p>
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
              <p className="mt-1 text-2xl font-black">{s.value}</p>
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
            {liveActivity.map((activity, index) => (
              <div
                key={index}
                className="text-xs text-muted-foreground py-1.5 border-b border-muted/20 last:border-0"
              >
                {activity}
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
        </div>
      </div>
    </div>
  );
}
