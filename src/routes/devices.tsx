import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Router, Laptop, Smartphone, Plus } from "lucide-react";

export const Route = createFileRoute("/devices")({ component: DevicesPage });

function DevicesPage() {
  useAuthGuard();

  return (
    <>
      <TopBar title="CONNECTED DEVICES" />
      <h1 className="mb-4 text-2xl font-bold">Your <span className="gradient-text">Devices</span></h1>

      <div className="space-y-3">
        {[
          { icon: Router, label: "Campus Router", status: "Not connected", action: { to: "/connect-router", label: "Connect" } },
          { icon: Laptop, label: "Laptop / Router", status: "Add this device" },
          { icon: Smartphone, label: "Mobile Device", status: "This device" },
        ].map((d, i) => (
          <div key={i} className="glass flex items-center justify-between rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <d.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{d.label}</p>
                <p className="text-[11px] text-muted-foreground">{d.status}</p>
              </div>
            </div>
            {d.action ? (
              <Link to={d.action.to} className="tile-press rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary">
                {d.action.label}
              </Link>
            ) : (
              <button className="tile-press flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent"><Plus className="h-4 w-4" /></button>
            )}
          </div>
        ))}
      </div>

      <div className="glass mt-6 rounded-2xl p-6 text-center">
        <p className="text-xs text-muted-foreground">No additional devices linked yet.</p>
      </div>
    </>
  );
}
