import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { ListingType } from '../types'

const TERMIZ: [number, number] = [37.2242, 67.2783]

type AdminMapProps = {
  lat: number
  lng: number
  type: ListingType
  onPick: (lat: number, lng: number) => void
}

function ClickPick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (event) => onPick(event.latlng.lat, event.latlng.lng),
  })
  return null
}

export function AdminMap({ lat, lng, type, onPick }: AdminMapProps) {
  const icon = L.divIcon({
    className: 'map-pin-wrap',
    iconSize: [44, 52],
    iconAnchor: [22, 50],
    html: `<div class="map-pin map-pin-${type} is-selected"><span>Joy</span></div>`,
  })

  return (
    <MapContainer center={TERMIZ} zoom={13} zoomControl={false} className="admin-map">
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickPick onPick={onPick} />
      <Marker position={[lat, lng]} icon={icon} />
    </MapContainer>
  )
}
