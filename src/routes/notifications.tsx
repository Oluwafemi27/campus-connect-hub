import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Bell, BellOff } from "lucide-react";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  useAuthGuard();

  return (
    <>
      <TopBar title="NOTIFICATIONS" showBack />
      <div className="mb-5">
        <h1 className="text-2xl font-bold">
          Your <span className="gradient-text">Alerts</span>
        </h1>
        <p className="text-xs text-muted-foreground">Stay updated on campus activity</p>
      </div>

      <div className="glass-strong relative flex flex-col items-center justify-center rounded-2xl p-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 glow-primary">
          <BellOff className="h-7 w-7 text-primary" />
        </div>
        <p className="text-sm font-bold">No notifications yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          We'll let you know when something arrives.
        </p>
      </div>

      <h2 className="mt-6 mb-3 text-xs tracking-widest text-muted-foreground">PREFERENCES</h2>
      <div className="space-y-2">
        {["Transactions", "Router status", "Promotions", "Campus announcements"].map((p) => (
          <div
            key={p}
            className="glass flex items-center justify-between rounded-xl px-4 py-3 text-sm"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-primary" />
              <span>{p}</span>
            </div>
            <span className="text-[10px] tracking-widest text-neon">ON</span>
          </div>
        ))}
      </div>
    </>
  );
}
