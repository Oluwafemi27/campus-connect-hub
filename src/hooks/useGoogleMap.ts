import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapsTypes {
  Map: new (el: HTMLElement, options: google.maps.MapOptions) => google.maps.Map;
  Marker: new (options?: google.maps.MarkerOptions) => google.maps.Marker;
  InfoWindow: new (options?: google.maps.InfoWindowOptions) => google.maps.InfoWindow;
  LatLngLiteral: google.maps.LatLngLiteral;
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

type MapsApi = typeof google;

let googleMapsLoading = false;
let googleMapsLoaded = false;

export function useGoogleMap(containerRef: React.RefObject<HTMLDivElement>, options: MapOptions) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const initializeMap = useCallback(() => {
    if (!containerRef.current || !window.google || mapRef.current) return;

    const map = new window.google.maps.Map(containerRef.current, {
      center: options.center,
      zoom: options.zoom,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: false,
    });

    mapRef.current = map;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

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

        markersRef.current.push(marker);
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
          if (map) {
            map.panTo(userLocation);
          }
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      );
    }
  }, [containerRef, options.center, options.zoom, options.markers, options.enableRealtime]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Google Maps API only once
    const loadGoogleMaps = () => {
      if (googleMapsLoaded && window.google) {
        initializeMap();
        return;
      }

      if (googleMapsLoading) {
        // Wait for it to load
        const checkInterval = setInterval(() => {
          if (window.google) {
            clearInterval(checkInterval);
            initializeMap();
          }
        }, 100);
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error("Google Maps API key not configured");
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        if (window.google) {
          initializeMap();
        } else {
          // Script exists but not loaded yet, wait for it
          const checkInterval = setInterval(() => {
            if (window.google) {
              clearInterval(checkInterval);
              googleMapsLoaded = true;
              initializeMap();
            }
          }, 100);
        }
        return;
      }

      googleMapsLoading = true;
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        googleMapsLoading = false;
        googleMapsLoaded = true;
        initializeMap();
      };
      script.onerror = () => {
        console.error("Failed to load Google Maps");
        googleMapsLoading = false;
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [containerRef, initializeMap]);
}
