import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useGoogleMap } from "@/hooks/useGoogleMap";
import { MapPin, Wifi } from "lucide-react";
import { useRef } from "react";

export const Route = createFileRoute("/map")({ component: MapPage });

// LAUTECH College, Ogbomosho router location
const ROUTER_LOCATIONS = [
  {
    lat: 8.1547,
    lng: 3.7521,
    title: "LAUTECH College, Ogbomosho",
    label: "1,500LT",
  },
];

function MapPage() {
  useAdminGuard();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useGoogleMap(mapContainerRef, {
    center: { lat: 8.1547, lng: 3.7521 },
    zoom: 16,
    markers: ROUTER_LOCATIONS,
    enableRealtime: true,
  });

  return (
    <>
      <TopBar title="CAMPUS MAP" />
      <h1 className="mb-3 text-2xl font-bold">
        Router <span className="gradient-text">Coverage</span>
      </h1>

      <div
        ref={mapContainerRef}
        className="glass-strong relative h-80 overflow-hidden rounded-3xl mb-5"
        style={{ minHeight: "320px" }}
      />

      <p className="mt-5 mb-2 text-xs tracking-widest text-muted-foreground">NEARBY ZONES</p>
      <div className="space-y-2">
        {ROUTER_LOCATIONS.map((location) => (
          <div key={location.title} className="glass flex items-center justify-between rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{location.title}</span>
            </div>
            <span className="flex items-center gap-1 text-xs text-neon">
              <Wifi className="h-3 w-3" /> Online
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
