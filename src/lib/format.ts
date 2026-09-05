import type { Listing } from '../types'

export function formatPrice(listing: Listing): string {
  const amount = listing.price.toLocaleString('uz-UZ')
  const money =
    listing.currency === 'USD' ? `$${amount}` : `${amount} so‘m`

  return listing.type === 'rent' ? `${money} / oy` : money
}

export function typeLabel(type: Listing['type']): string {
  return type === 'sale' ? 'Sotuv' : 'Ijara'
}
