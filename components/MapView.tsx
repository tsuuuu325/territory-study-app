"use client";

import { cellToBoundary } from "h3-js";
import { MapContainer, Polygon, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
}

export default function MapView({ ownedCellIds, color, onMapClick }: MapViewProps) {
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
            color,
            weight: 1,
            fillColor: color,
            fillOpacity: 0.45,
          }}
        />
      ))}
    </MapContainer>
  );
}
