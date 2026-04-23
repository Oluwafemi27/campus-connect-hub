import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Users, Receipt, Megaphone, Settings as Cog, ArrowLeft, Shield, BarChart3, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { requireAdmin } from "@/lib/routeProtection";

export const Route = createFileRoute("/admin")({
  beforeLoad: requireAdmin,
  component: AdminLayout,
});

const nav = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/features", icon: Sparkles, label: "Features" },
  { to: "/admin/messages", icon: MessageSquare, label: "Messages" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/transactions", icon: Receipt, label: "Transactions" },
  { to: "/admin/broadcasts", icon: Megaphone, label: "Broadcasts" },
  { to: "/admin/settings", icon: Cog, label: "Settings" },
] as const;

function AdminLayout() {
  const location = useLocation();
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[440px] px-5 pt-6 pb-6">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-10 -right-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="mb-5 flex items-center justify-between">
        <Link to="/" className="tile-press glass flex h-9 w-9 items-center justify-center rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold tracking-widest gradient-text">ADMIN PANEL</span>
        </div>
        <div className="h-9 w-9" />
      </div>

      <nav className="glass mb-5 flex gap-1 overflow-x-auto rounded-2xl p-1 scrollbar-hide">
        {nav.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "tile-press flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                active ? "bg-primary text-primary-foreground glow-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
