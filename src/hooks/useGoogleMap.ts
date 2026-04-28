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
  enableRealtime?: boolean;
}

export function useGoogleMap(
  containerRef: React.RefObject<HTMLDivElement>,
  options: MapOptions
) {
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

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

      mapRef.current = map;

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

      // Enable real-time user location tracking
      if (options.enableRealtime && navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const userLocation = { lat: latitude, lng: longitude };

            if (userMarkerRef.current) {
              userMarkerRef.current.setPosition(userLocation);
            } else {
              userMarkerRef.current = new window.google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Your Location",
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              });
            }

            // Center map on user if needed
            map.panTo(userLocation);
          },
          (error) => {
            console.warn("Geolocation error:", error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      }
    };

    loadGoogleMaps();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [containerRef, options]);
}
