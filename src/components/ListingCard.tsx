import type { Listing } from '../types'
import { formatPrice, typeLabel } from '../lib/format'

type ListingCardProps = {
  listing: Listing
  onOpen360: () => void
  onClose: () => void
}

export function ListingCard({ listing, onOpen360, onClose }: ListingCardProps) {
  return (
    <article className="listing-card" aria-label={listing.title}>
      <button type="button" className="listing-card-handle" onClick={onClose} aria-label="Yopish" />
      <img className="listing-card-cover" src={listing.cover} alt={listing.title} />
      <div className="listing-card-body">
        <div className="listing-card-top">
          <span className={`badge badge-${listing.type}`}>{typeLabel(listing.type)}</span>
          <button type="button" className="listing-card-close" onClick={onClose}>
            Yopish
          </button>
        </div>
        <h2>{listing.title}</h2>
        <p className="listing-card-price">{formatPrice(listing)}</p>
        <p className="listing-card-meta">
          {listing.rooms} xona · {listing.area} m² · {listing.address}
        </p>
        <button type="button" className="btn btn-primary" onClick={onOpen360}>
          360° ko‘rish
        </button>
        <div className="listing-card-actions">
          <a className="btn btn-ghost" href={`tel:${listing.phone}`}>
            Qo‘ng‘iroq
          </a>
          <a
            className="btn btn-ghost"
            href={`https://t.me/${listing.telegram}`}
            target="_blank"
            rel="noreferrer"
          >
            Telegram
          </a>
        </div>
      </div>
    </article>
  )
}
