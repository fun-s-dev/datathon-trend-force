import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MAP_TILE_URL,
  MAP_ROUTE_COLOR_RECOMMENDED,
  MAP_ROUTE_COLOR_ALTERNATE,
  MAP_ROUTE_WEIGHT_RECOMMENDED,
  MAP_ROUTE_WEIGHT_ALTERNATE,
} from "../config/constants";

export interface RouteGeometry {
  geometry?: number[][]; // Backend sends [[lat, lng], ...] (OSRM [lon,lat] flipped server-side)
}

interface RouteMapProps {
  routes: RouteGeometry[];
  recommendedIndex?: number;
  className?: string;
}

/**
 * Renders backend-returned route geometry only. No client-side routing or coordinate generation.
 * Backend geometry is [lat, lng] (Leaflet convention).
 */
export function RouteMap({ routes, recommendedIndex = 0, className = "" }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || routes.length === 0) return;

    const boundsPoints: L.LatLng[] = [];
    const polylinesToAdd: { latlngs: L.LatLng[]; isRecommended: boolean }[] = [];

    routes.forEach((route, routeIndex) => {
      const geometry = route.geometry;
      if (
        !Array.isArray(geometry) ||
        geometry.length < 2 ||
        !Array.isArray(geometry[0]) ||
        geometry[0].length < 2
      ) {
        return;
      }

      const latlngs = geometry
        .filter(
          (pt): pt is [number, number] =>
            Array.isArray(pt) &&
            pt.length >= 2 &&
            typeof pt[0] === "number" &&
            typeof pt[1] === "number"
        )
        .map(([lat, lng]) => {
          const ll = L.latLng(lat, lng);
          boundsPoints.push(ll);
          return ll;
        });

      if (latlngs.length < 2) return;

      const isRecommended = routeIndex === recommendedIndex;
      polylinesToAdd.push({ latlngs, isRecommended });
    });

    if (polylinesToAdd.length === 0 || boundsPoints.length === 0) return;

    const bounds = L.latLngBounds(boundsPoints);

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView(
        [bounds.getCenter().lat, bounds.getCenter().lng],
        12
      );
      L.tileLayer(MAP_TILE_URL, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    polylinesToAdd.forEach(({ latlngs, isRecommended }) => {
      L.polyline(latlngs, {
        color: isRecommended ? MAP_ROUTE_COLOR_RECOMMENDED : MAP_ROUTE_COLOR_ALTERNATE,
        weight: isRecommended ? MAP_ROUTE_WEIGHT_RECOMMENDED : MAP_ROUTE_WEIGHT_ALTERNATE,
        opacity: 0.9,
      }).addTo(map);
    });

    map.fitBounds(bounds.pad(0.1));

    return () => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });
    };
  }, [routes, recommendedIndex]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} className={`route-map ${className}`} />;
}
