"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default Leaflet icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

interface MapPickerProps {
  latitude: number | null
  longitude: number | null
  onChange: (lat: number, lng: number) => void
  radius?: number
  color?: string
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapRecenter({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMapEvents({})
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.panTo([lat, lng])
    }
  }, [lat, lng, map])
  return null
}

export function MapPicker({ latitude, longitude, onChange, radius = 4000, color = "#f59e0b" }: MapPickerProps) {
  const defaultCenter: [number, number] = [-33.4489, -70.6693] // Santiago, Chile
  const center: [number, number] = latitude !== null && longitude !== null ? [latitude, longitude] : defaultCenter

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-border shadow-inner relative z-0">
      <MapContainer
        center={center}
        zoom={12}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ClickHandler onChange={onChange} />
        {latitude !== null && longitude !== null && (
          <>
            <Marker position={[latitude, longitude]} />
            <Circle
              center={[latitude, longitude]}
              radius={radius}
              pathOptions={{ color: color, fillColor: color, fillOpacity: 0.15, stroke: true, weight: 1.5, opacity: 0.6 }}
            />
            <MapRecenter lat={latitude} lng={longitude} />
          </>
        )}
      </MapContainer>
    </div>
  )
}
