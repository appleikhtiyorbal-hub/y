import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import listingsData from './data/listings.json' with { type: 'json' }
import { FilterBar } from './components/FilterBar'
import { ListingCard } from './components/ListingCard'
import { MapView } from './components/MapView'
import { useTelegramBackButton } from './telegram'
import type { Listing, ListingFilter } from './types'

const PanoramaView = lazy(async () => {
  const module = await import('./components/PanoramaView')
  return { default: module.PanoramaView }
})

const listings = listingsData as Listing[]

export default function App() {
  const [filter, setFilter] = useState<ListingFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [show360, setShow360] = useState(false)

  const selected = useMemo(
    () => listings.find((item) => item.id === selectedId) ?? null,
    [selectedId],
  )

  const closeOverlay = useCallback(() => {
    if (show360) {
      setShow360(false)
      return
    }
    setSelectedId(null)
  }, [show360])

  useTelegramBackButton(Boolean(selected) || show360, closeOverlay)

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="app-kicker">Termiz</p>
          <h1>Uy 360</h1>
        </div>
        <FilterBar value={filter} onChange={setFilter} />
      </header>

      <MapView
        listings={listings}
        filter={filter}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id)
          setShow360(false)
        }}
        onDeselect={() => {
          if (!show360) setSelectedId(null)
        }}
      />

      {selected && !show360 && (
        <ListingCard
          listing={selected}
          onOpen360={() => setShow360(true)}
          onClose={() => setSelectedId(null)}
        />
      )}

      {selected && show360 && (
        <Suspense fallback={<div className="pano-view pano-loading">360° yuklanmoqda…</div>}>
          <PanoramaView
            key={selected.id}
            listing={selected}
            onClose={() => setShow360(false)}
          />
        </Suspense>
      )}
    </div>
  )
}
