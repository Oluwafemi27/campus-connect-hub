import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  markers?: Array<{
    lat: number;
    lng: number;
    title: string;
    label: string;
  }>;
}

export function useGoogleMap(
  containerRef: React.RefObject<HTMLDivElement>,
  options: MapOptions
) {
  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error("Google Maps API key not configured");
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => console.error("Failed to load Google Maps");
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!containerRef.current || !window.google) return;

      const map = new window.google.maps.Map(containerRef.current, {
        center: options.center,
        zoom: options.zoom,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: false,
      });

      // Add markers
      if (options.markers) {
        options.markers.forEach((markerData) => {
          const marker = new window.google.maps.Marker({
            position: { lat: markerData.lat, lng: markerData.lng },
            map: map,
            title: markerData.title,
            label: markerData.label,
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div style="padding: 8px;"><strong>${markerData.title}</strong><br/><small>${markerData.label}</small></div>`,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });
        });
      }
    };

    loadGoogleMaps();
  }, [containerRef, options]);
}
