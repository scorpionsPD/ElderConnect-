import { AddressSearchOptions, AddressSuggestion, NominatimSearchResult } from '@/types/address'

const DEFAULT_LIMIT = 6

const getProvider = () => (process.env.NEXT_PUBLIC_ADDRESS_PROVIDER || 'nominatim').toLowerCase()

const isUKPostcode = (query: string) => {
  // UK postcode regex (simple, covers most cases)
  return /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(query.replace(/\s+/g, ''))
}

const buildGetAddressUrl = (postcode: string) => {
  // Remove spaces for API
  const cleanPostcode = postcode.replace(/\s+/g, '')
  return `https://api.getaddress.io/find/${cleanPostcode}?api-key=${process.env.NEXT_PUBLIC_GETADDRESS_API_KEY}`
}

const buildNominatimUrl = (query: string, options: AddressSearchOptions = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_NOMINATIM_URL || 'https://nominatim.openstreetmap.org/search'
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: String(options.limit || DEFAULT_LIMIT),
  })

  if (options.countryCodes?.length) {
    params.set('countrycodes', options.countryCodes.join(','))
  }

  if (process.env.NEXT_PUBLIC_NOMINATIM_EMAIL) {
    params.set('email', process.env.NEXT_PUBLIC_NOMINATIM_EMAIL)
  }

  return `${baseUrl}?${params.toString()}`
}

const mapNominatimResult = (item: NominatimSearchResult): AddressSuggestion => {
  const city = item.address?.city || item.address?.town || item.address?.village || item.address?.county
  return {
    id: String(item.place_id),
    label: item.display_name,
    formattedAddress: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
    postcode: item.address?.postcode,
    city,
    state: item.address?.state,
    country: item.address?.country,
  }
}


export const searchAddresses = async (
  query: string,
  options: AddressSearchOptions = {}
): Promise<AddressSuggestion[]> => {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return []

  const provider = getProvider()

  // Use getAddress.io for UK postcodes
  if (provider === 'getaddress' && isUKPostcode(trimmedQuery)) {
    try {
      const response = await fetch(buildGetAddressUrl(trimmedQuery))
      if (!response.ok) {
        throw new Error(`getAddress.io failed with status ${response.status}`)
      }
      const data = await response.json()
      // data.addresses is an array of strings (full addresses)
      // data.latitude, data.longitude, data.postcode
      return (data.addresses || []).map((addr: string, idx: number) => ({
        id: `${data.postcode}-${idx}`,
        label: addr,
        formattedAddress: addr,
        latitude: data.latitude,
        longitude: data.longitude,
        postcode: data.postcode,
        city: undefined,
        state: undefined,
        country: 'United Kingdom',
      }))
    } catch (error) {
      console.error('getAddress.io error:', error)
      // fallback to Nominatim
    }
  }

  // Default: Nominatim
  try {
    const response = await fetch(buildNominatimUrl(trimmedQuery, options), {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Address search failed with status ${response.status}`)
    }

    const data = (await response.json()) as NominatimSearchResult[]
    return Array.isArray(data) ? data.map(mapNominatimResult) : []
  } catch (error) {
    console.error('Address search error:', error)
    return []
  }
}
