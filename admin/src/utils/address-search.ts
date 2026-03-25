import { AddressSearchOptions, AddressSuggestion, NominatimSearchResult } from '@/types/address'

const DEFAULT_LIMIT = 6

const buildEdgeFunctionUrl = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
  }

  return `${supabaseUrl}/functions/v1/address-search`
}

const mapNominatimResult = (item: NominatimSearchResult): AddressSuggestion => {
  const city = item.address?.city || item.address?.town || item.address?.village || item.address?.county
  const streetName = item.address?.road || item.address?.pedestrian || item.address?.suburb
  const addressLine1 = [item.address?.house_number, streetName].filter(Boolean).join(' ').trim()
  return {
    id: String(item.place_id),
    label: item.display_name,
    formattedAddress: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
    addressLine1: addressLine1 || undefined,
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

  try {
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const response = await fetch(buildEdgeFunctionUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(supabaseAnonKey
          ? {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            }
          : {}),
      },
      body: JSON.stringify({
        query: trimmedQuery,
        limit: options.limit || DEFAULT_LIMIT,
        countryCodes: options.countryCodes,
      }),
    })

    if (!response.ok) {
      throw new Error(`Address search failed with status ${response.status}`)
    }

    const payload = (await response.json()) as { success?: boolean; results?: AddressSuggestion[] }
    return Array.isArray(payload.results) ? payload.results : []
  } catch (error) {
    console.error('Address search error:', error)
    return []
  }
}

const buildReverseNominatimUrl = (latitude: number, longitude: number) => {
  const baseUrl = process.env.NEXT_PUBLIC_NOMINATIM_REVERSE_URL || 'https://nominatim.openstreetmap.org/reverse'
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: 'jsonv2',
    addressdetails: '1',
  })

  if (process.env.NEXT_PUBLIC_NOMINATIM_EMAIL) {
    params.set('email', process.env.NEXT_PUBLIC_NOMINATIM_EMAIL)
  }

  return `${baseUrl}?${params.toString()}`
}

export const reverseGeocodeCoordinates = async (
  latitude: number,
  longitude: number
): Promise<AddressSuggestion | null> => {
  try {
    const response = await fetch(buildReverseNominatimUrl(latitude, longitude), {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed with status ${response.status}`)
    }

    const data = (await response.json()) as NominatimSearchResult
    return mapNominatimResult(data)
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}
