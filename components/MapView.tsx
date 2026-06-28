"use client";

import { cellToBoundary, latLngToCell } from "h3-js";
import { CircleMarker, MapContainer, Polygon, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { H3_RESOLUTION } from "@/lib/territory";

const JAPAN_CENTER: [number, number] = [36.2048, 138.2529];
const JAPAN_ZOOM = 5;

function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapViewProps {
  ownedCellIds: string[];
  color: string;
  onMapClick?: (lat: number, lng: number) => void;
  pendingPoint?: { lat: number; lng: number } | null;
}

export default function MapView({ ownedCellIds, color, onMapClick, pendingPoint }: MapViewProps) {
  const pendingCellId = pendingPoint
    ? latLngToCell(pendingPoint.lat, pendingPoint.lng, H3_RESOLUTION)
    : null;

  return (
    <MapContainer
      center={JAPAN_CENTER}
      zoom={JAPAN_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapClick={onMapClick} />
      {ownedCellIds.map((cellId) => (
        <Polygon
          key={cellId}
          positions={cellToBoundary(cellId, false) as [number, number][]}
          pathOptions={{
            stroke: false,
            fillColor: color,
            fillOpacity: 0.55,
          }}
        />
      ))}
      {pendingCellId && (
        <Polygon
          positions={cellToBoundary(pendingCellId, false) as [number, number][]}
          pathOptions={{ color: "#F59E0B", weight: 2, fillColor: "#F59E0B", fillOpacity: 0.5 }}
        />
      )}
      {pendingPoint && (
        <CircleMarker
          center={[pendingPoint.lat, pendingPoint.lng]}
          radius={6}
          pathOptions={{ color: "#F59E0B", fillColor: "#F59E0B", fillOpacity: 1 }}
        />
      )}
    </MapContainer>
  );
}
