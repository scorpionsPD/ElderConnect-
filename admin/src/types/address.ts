export interface AddressSuggestion {
  id: string
  label: string
  formattedAddress: string
  latitude: number
  longitude: number
  postcode?: string
  city?: string
  state?: string
  country?: string
}

export interface AddressSearchOptions {
  limit?: number
  countryCodes?: string[]
}

export interface NominatimSearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: {
    postcode?: string
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    country?: string
  }
}
