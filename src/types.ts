export type ListingType = 'sale' | 'rent'

export type Panorama = {
  id: string
  title: string
  url: string
}

export type Listing = {
  id: string
  type: ListingType
  title: string
  price: number
  currency: 'USD' | 'UZS'
  rooms: number
  area: number
  address: string
  lat: number
  lng: number
  cover: string
  panoramas: Panorama[]
  phone: string
  telegram: string
}

export type ListingFilter = 'all' | ListingType
