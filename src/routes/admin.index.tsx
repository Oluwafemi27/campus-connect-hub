import { createFileRoute } from "@tanstack/react-router";
import { Users, Wallet, Wifi, Activity, TrendingUp, AlertCircle } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

const stats = [
  { icon: Users, label: "Total Users", value: "—", hint: "Active accounts", tint: "text-primary" },
  { icon: Wallet, label: "Revenue", value: "—", hint: "This month", tint: "text-gold" },
  { icon: Wifi, label: "Routers", value: "—", hint: "Online now", tint: "text-neon" },
  { icon: Activity, label: "Transactions", value: "—", hint: "Last 24h", tint: "text-accent" },
];

function AdminDashboard() {
  useAuthGuard();

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-xs text-muted-foreground">Monitor platform health & activity</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <s.icon className={`mb-2 h-5 w-5 ${s.tint}`} />
            <p className="text-[10px] tracking-widest text-muted-foreground">{s.label.toUpperCase()}</p>
            <p className="mt-1 text-2xl font-black">{s.value}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">Live Activity</h2>
          <TrendingUp className="h-4 w-4 text-neon" />
        </div>
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
          No activity yet
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-bold">System Alerts</h2>
        </div>
        <p className="text-xs text-muted-foreground">All systems operational.</p>
      </div>
    </div>
  );
}
