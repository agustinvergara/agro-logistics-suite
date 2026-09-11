import { Fragment } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import type { Viaje } from "@/lib/mock";

function pin(color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:20px;height:20px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const GREEN = pin("oklch(58% 0.16 148)");
const RED = pin("oklch(57.7% 0.245 27.325)");
const BLUE = pin("oklch(60% 0.15 250)");

export default function CarrierMap({
  center,
  viajes,
}: {
  center: [number, number];
  viajes: Viaje[];
}) {
  return (
    <MapContainer center={center} zoom={12} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={BLUE}>
        <Popup>Mi ubicación</Popup>
      </Marker>
      {viajes.map((v) => (
        <Fragment key={v.id}>
          <Marker position={[v.pickupLat, v.pickupLng]} icon={GREEN}>
            <Popup>Origen · Viaje #{v.id}</Popup>
          </Marker>
          <Marker position={[v.dropoffLat, v.dropoffLng]} icon={RED}>
            <Popup>Destino · Viaje #{v.id}</Popup>
          </Marker>
          <Polyline
            positions={[
              [v.pickupLat, v.pickupLng],
              [v.dropoffLat, v.dropoffLng],
            ]}
            pathOptions={{ color: "oklch(45% 0.13 152)", weight: 3, dashArray: "6 8" }}
          />
        </Fragment>
      ))}
    </MapContainer>
  );
}
