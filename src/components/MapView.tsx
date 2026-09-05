import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { Listing, ListingFilter } from '../types'
import { typeLabel } from '../lib/format'

const TERMIZ: [number, number] = [37.2242, 67.2783]

type MapViewProps = {
  listings: Listing[]
  filter: ListingFilter
  selectedId: string | null
  onSelect: (id: string) => void
  onDeselect: () => void
}

function pinIcon(type: Listing['type'], selected: boolean) {
  return L.divIcon({
    className: 'map-pin-wrap',
    iconSize: [44, 52],
    iconAnchor: [22, 50],
    html: `<div class="map-pin map-pin-${type}${selected ? ' is-selected' : ''}"><span>${typeLabel(type)}</span></div>`,
  })
}

function MapEvents({ onDeselect }: { onDeselect: () => void }) {
  useMapEvents({
    click: onDeselect,
  })
  return null
}

function FlyToSelected({ listing }: { listing: Listing | undefined }) {
  const map = useMap()

  useEffect(() => {
    if (!listing) return
    map.flyTo([listing.lat, listing.lng], 15, { duration: 0.6 })
  }, [listing, map])

  return null
}

export function MapView({
  listings,
  filter,
  selectedId,
  onSelect,
  onDeselect,
}: MapViewProps) {
  const visible =
    filter === 'all' ? listings : listings.filter((item) => item.type === filter)
  const selected = listings.find((item) => item.id === selectedId)

  return (
    <MapContainer
      center={TERMIZ}
      zoom={13}
      zoomControl={false}
      className="map"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onDeselect={onDeselect} />
      <FlyToSelected listing={selected} />
      {visible.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.lat, listing.lng]}
          icon={pinIcon(listing.type, listing.id === selectedId)}
          eventHandlers={{
            click: (event) => {
              L.DomEvent.stopPropagation(event.originalEvent)
              onSelect(listing.id)
            },
          }}
        />
      ))}
    </MapContainer>
  )
}
