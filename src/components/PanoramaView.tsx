import { useEffect, useRef, useState } from 'react'
import { Viewer } from '@photo-sphere-viewer/core'
import '@photo-sphere-viewer/core/index.css'
import type { Listing } from '../types'

type PanoramaViewProps = {
  listing: Listing
  onClose: () => void
}

export function PanoramaView({ listing, onClose }: PanoramaViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const readyRef = useRef(false)
  const skipNextPanorama = useRef(true)
  const [roomId, setRoomId] = useState(listing.panoramas[0]?.id ?? '')
  const room = listing.panoramas.find((item) => item.id === roomId) ?? listing.panoramas[0]

  useEffect(() => {
    const container = containerRef.current
    const first = listing.panoramas[0]
    if (!container || !first) return

    let cancelled = false
    let viewer: Viewer | null = null
    let frame = 0

    const create = () => {
      if (cancelled) return
      if (container.clientWidth < 32 || container.clientHeight < 32) {
        frame = requestAnimationFrame(create)
        return
      }

      viewer = new Viewer({
        container,
        panorama: first.url,
        navbar: false,
        defaultYaw: 0,
        touchmoveTwoFingers: false,
        mousewheelCtrlKey: false,
      })
      viewer.addEventListener('ready', () => viewer?.resize(), { once: true })
      viewerRef.current = viewer
      readyRef.current = true
      skipNextPanorama.current = true
    }

    frame = requestAnimationFrame(create)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      readyRef.current = false
      viewer?.destroy()
      viewerRef.current = null
    }
  }, [listing.id, listing.panoramas])

  useEffect(() => {
    if (!readyRef.current || !viewerRef.current || !room) return
    if (skipNextPanorama.current) {
      skipNextPanorama.current = false
      return
    }
    void viewerRef.current.setPanorama(room.url)
  }, [room])

  if (!room) {
    return (
      <div className="pano-view">
        <header className="pano-bar">
          <button type="button" onClick={onClose}>
            Orqaga
          </button>
          <span>360° yo‘q</span>
        </header>
      </div>
    )
  }

  return (
    <div className="pano-view">
      <header className="pano-bar">
        <button type="button" onClick={onClose}>
          Orqaga
        </button>
        <div>
          <strong>{listing.title}</strong>
          <span>{room.title} — barmoq bilan aylantiring</span>
        </div>
      </header>
      <div ref={containerRef} className="pano-canvas" />
      {listing.panoramas.length > 1 && (
        <div className="pano-rooms">
          {listing.panoramas.map((pano) => (
            <button
              key={pano.id}
              type="button"
              className={`filter-chip${pano.id === room.id ? ' is-active' : ''}`}
              onClick={() => setRoomId(pano.id)}
            >
              {pano.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
