import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import listingsData from './data/listings.json' with { type: 'json' }
import { FilterBar } from './components/FilterBar'
import { ListingCard } from './components/ListingCard'
import { MapView } from './components/MapView'
import { assetUrl } from './lib/assets'
import { useTelegramBackButton } from './telegram'
import type { Listing, ListingFilter } from './types'

const PanoramaView = lazy(async () => {
  const module = await import('./components/PanoramaView')
  return { default: module.PanoramaView }
})

const AdminView = lazy(async () => {
  const module = await import('./components/AdminView')
  return { default: module.AdminView }
})

const listings = (listingsData as Listing[]).map((listing) => ({
  ...listing,
  cover: assetUrl(listing.cover),
  panoramas: listing.panoramas.map((pano) => ({
    ...pano,
    url: assetUrl(pano.url),
  })),
}))

export default function App() {
  const [filter, setFilter] = useState<ListingFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [show360, setShow360] = useState(false)
  const [showAdmin, setShowAdmin] = useState(
    () => window.location.hash === '#/admin',
  )
  const [titleTaps, setTitleTaps] = useState(0)

  useEffect(() => {
    const onHash = () => setShowAdmin(window.location.hash === '#/admin')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const openAdmin = useCallback(() => {
    window.location.hash = '/admin'
    setShowAdmin(true)
  }, [])

  const closeAdmin = useCallback(() => {
    if (window.location.hash === '#/admin') {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    setShowAdmin(false)
  }, [])

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

  const closeAny = useCallback(() => {
    if (showAdmin) {
      closeAdmin()
      return
    }
    closeOverlay()
  }, [closeAdmin, closeOverlay, showAdmin])

  useTelegramBackButton(Boolean(selected) || show360 || showAdmin, closeAny)

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="app-kicker">Termiz</p>
          <h1
            onClick={() => {
              const next = titleTaps + 1
              setTitleTaps(next)
              if (next >= 5) {
                setTitleTaps(0)
                openAdmin()
              }
            }}
          >
            Uy 360
          </h1>
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

      {showAdmin && (
        <Suspense fallback={<div className="admin">Admin yuklanmoqda…</div>}>
          <AdminView listings={listings} onClose={closeAdmin} />
        </Suspense>
      )}
    </div>
  )
}
