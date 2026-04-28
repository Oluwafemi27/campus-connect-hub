import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useGoogleMap } from "@/hooks/useGoogleMap";
import { MapPin, Wifi } from "lucide-react";
import { useRef } from "react";

export const Route = createFileRoute("/map")({ component: MapPage });

// Campus router locations (example coordinates - replace with your actual campus)
const ROUTER_LOCATIONS = [
  {
    lat: 6.5244,
    lng: 3.3792,
    title: "Library Hub",
    label: "A",
  },
  {
    lat: 6.5234,
    lng: 3.3802,
    title: "Block C Hostel",
    label: "B",
  },
  {
    lat: 6.5254,
    lng: 3.3782,
    title: "Cafeteria Wing",
    label: "C",
  },
];

function MapPage() {
  useAdminGuard();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useGoogleMap(mapContainerRef, {
    center: { lat: 6.5244, lng: 3.3792 },
    zoom: 16,
    markers: ROUTER_LOCATIONS,
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
