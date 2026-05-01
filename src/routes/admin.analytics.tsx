import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, BarChart3 } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getAdminStats } from "@/lib/admin-service";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

interface AnalyticsData {
  totalUsers: number;
  monthlyRevenue: number;
  totalTransactions: number;
  avgTransactionValue: number;
  topServices: { name: string; count: number; revenue: number }[];
  dailyActivity: { date: string; users: number; transactions: number }[];
}

function AdminAnalytics() {
  useAdminGuard();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Get basic stats
        const stats = await getAdminStats();

        // Get transaction breakdown
        const { data: transactions } = await supabase
          .from("transactions")
          .select("type, amount, created_at")
          .order("created_at", { ascending: false })
          .limit(1000);

        // Get user registrations by day
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: users } = await supabase
          .from("users")
          .select("created_at")
          .gte("created_at", thirtyDaysAgo);

        // Calculate daily activity for the past 7 days
        const dailyActivity: { date: string; users: number; transactions: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];

          const dayUsers =
            users?.filter((u) => new Date(u.created_at).toISOString().split("T")[0] === dateStr)
              .length || 0;

          const dayTx = transactions?.filter((t) => t.created_at.startsWith(dateStr)).length || 0;

          dailyActivity.push({
            date: date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            users: dayUsers,
            transactions: dayTx,
          });
        }

        // Calculate top services
        const serviceStats: Record<string, { count: number; revenue: number }> = {};
        (transactions || []).forEach((tx) => {
          if (!serviceStats[tx.type]) {
            serviceStats[tx.type] = { count: 0, revenue: 0 };
          }
          serviceStats[tx.type].count++;
          serviceStats[tx.type].revenue += tx.amount;
        });

        const topServices = Object.entries(serviceStats)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        const totalTx = transactions?.length || 0;
        const totalRev = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

        setData({
          totalUsers: stats.totalUsers,
          monthlyRevenue: stats.monthlyRevenue || totalRev,
          totalTransactions: totalTx,
          avgTransactionValue: totalTx > 0 ? Math.round(totalRev / totalTx) : 0,
          topServices,
          dailyActivity,
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const maxActivity = data
    ? Math.max(...data.dailyActivity.map((d) => Math.max(d.users, d.transactions)), 1)
    : 1;

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-bold">Analytics & Insights</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-[10px] tracking-widest text-muted-foreground">TOTAL USERS</span>
          </div>
          <p className="text-2xl font-black">{data?.totalUsers || 0}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-gold" />
            <span className="text-[10px] tracking-widest text-muted-foreground">REVENUE</span>
          </div>
          <p className="text-2xl font-black">₦{data?.monthlyRevenue.toLocaleString() || 0}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-neon" />
            <span className="text-[10px] tracking-widest text-muted-foreground">TRANSACTIONS</span>
          </div>
          <p className="text-2xl font-black">{data?.totalTransactions || 0}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-accent" />
            <span className="text-[10px] tracking-widest text-muted-foreground">AVG TX VALUE</span>
          </div>
          <p className="text-2xl font-black">₦{data?.avgTransactionValue.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold">7-Day Activity</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary" /> Users
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-neon" /> Transactions
            </span>
          </div>
        </div>

        {data && data.dailyActivity.length > 0 ? (
          <div className="flex items-end justify-between gap-2 h-32">
            {data.dailyActivity.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5">
                  <div
                    className="w-full bg-primary/70 rounded-t-sm transition-all"
                    style={{ height: `${Math.max((day.users / maxActivity) * 100, 4)}%` }}
                  />
                  <div
                    className="w-full bg-neon/70 rounded-t-sm transition-all"
                    style={{ height: `${Math.max((day.transactions / maxActivity) * 100, 4)}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">{day.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
            No activity data yet
          </div>
        )}
      </div>

      {/* Top Services */}
      <div className="glass rounded-2xl p-4">
        <h2 className="text-sm font-bold mb-4">Top Services</h2>

        {data && data.topServices.length > 0 ? (
          <div className="space-y-3">
            {data.topServices.map((service, index) => (
              <div key={service.name} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold capitalize">{service.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {service.count} tx • ₦{service.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${
                          data.topServices[0].revenue > 0
                            ? (service.revenue / data.topServices[0].revenue) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
            No service data yet
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="glass rounded-2xl p-4">
        <h2 className="text-sm font-bold mb-3">Quick Insights</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            {data && data.totalUsers > 0 ? (
              <>
                <TrendingUp className="h-3.5 w-3.5 text-neon" />
                <span className="text-muted-foreground">
                  Platform has{" "}
                  <span className="font-semibold text-foreground">
                    {data.totalUsers} registered users
                  </span>
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">No users registered yet</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            {data && data.totalTransactions > 0 ? (
              <>
                <TrendingUp className="h-3.5 w-3.5 text-neon" />
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {data.totalTransactions} transactions
                  </span>{" "}
                  processed
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">No transactions yet</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
