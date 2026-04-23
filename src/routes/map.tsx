import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { MapPin, Wifi } from "lucide-react";
import { requireAuth } from "@/lib/routeProtection";

export const Route = createFileRoute("/map")({
  beforeLoad: requireAuth,
  component: MapPage,
});

function MapPage() {
  return (
    <>
      <TopBar title="CAMPUS MAP" />
      <h1 className="mb-3 text-2xl font-bold">Router <span className="gradient-text">Coverage</span></h1>

      <div className="glass-strong relative h-72 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,oklch(0.7_0.2_240/0.4),transparent_50%),radial-gradient(circle_at_70%_60%,oklch(0.65_0.22_300/0.4),transparent_50%),radial-gradient(circle_at_50%_80%,oklch(0.85_0.22_145/0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(oklch(1_0_0/0.05)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
        {[
          { x: "30%", y: "35%", c: "primary" },
          { x: "65%", y: "55%", c: "accent" },
          { x: "45%", y: "75%", c: "neon" },
        ].map((p, i) => (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.x, top: p.y }}>
            <span className="relative flex h-4 w-4">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full bg-${p.c} opacity-75`} />
              <span className={`relative inline-flex h-4 w-4 rounded-full bg-${p.c}`} />
            </span>
          </div>
        ))}
      </div>

      <p className="mt-5 mb-2 text-xs tracking-widest text-muted-foreground">NEARBY ZONES</p>
      <div className="space-y-2">
        {["Library Hub", "Block C Hostel", "Cafeteria Wing"].map((z) => (
          <div key={z} className="glass flex items-center justify-between rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{z}</span>
            </div>
            <span className="flex items-center gap-1 text-xs text-neon"><Wifi className="h-3 w-3" /> Online</span>
          </div>
        ))}
      </div>
    </>
  );
}
