import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface AddressSearchRequest {
  query?: string
  limit?: number
  countryCodes?: string[]
}

interface OsPlacesDpaRecord {
  ADDRESS?: string
  BUILDING_NUMBER?: string
  THOROUGHFARE_NAME?: string
  POST_TOWN?: string
  POSTCODE?: string
  COUNTRY_CODE?: string
  LAT?: string | number
  LNG?: string | number
}

interface AddressSuggestion {
  id: string
  label: string
  formattedAddress: string
  latitude: number
  longitude: number
  addressLine1?: string
  postcode?: string
  city?: string
  state?: string
  country?: string
}

const DEFAULT_LIMIT = 6
const MAX_LIMIT = 20

const normalizeLimit = (value?: number) => {
  if (!Number.isFinite(value)) return DEFAULT_LIMIT
  return Math.min(Math.max(1, Math.trunc(value as number)), MAX_LIMIT)
}

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const parseAddressLine1 = (dpa: OsPlacesDpaRecord) => {
  const line = [dpa.BUILDING_NUMBER, dpa.THOROUGHFARE_NAME].filter(Boolean).join(' ').trim()
  return line || undefined
}

const mapOsPlaceResult = (item: Record<string, unknown>, index: number): AddressSuggestion | null => {
  const dpa = (item.DPA ?? item.dpa) as OsPlacesDpaRecord | undefined
  if (!dpa) return null

  const latitude = toNumber(dpa.LAT)
  const longitude = toNumber(dpa.LNG)
  if (latitude == null || longitude == null) return null

  const formattedAddress = dpa.ADDRESS?.trim()
  if (!formattedAddress) return null

  const id = `${dpa.POSTCODE || 'uk'}-${index}`

  return {
    id,
    label: formattedAddress,
    formattedAddress,
    latitude,
    longitude,
    addressLine1: parseAddressLine1(dpa),
    postcode: dpa.POSTCODE,
    city: dpa.POST_TOWN,
    country: dpa.COUNTRY_CODE || 'GB',
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const body = (await req.json()) as AddressSearchRequest
    const query = body.query?.trim() || ''
    const limit = normalizeLimit(body.limit)
    const countryCodes = body.countryCodes || ['gb']

    if (query.length < 2) {
      return new Response(
        JSON.stringify({ success: true, results: [] }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!countryCodes.some((code) => code.toLowerCase() === 'gb')) {
      return new Response(
        JSON.stringify({ success: true, results: [] }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const apiKey = Deno.env.get('OS_PLACES_API_KEY')
    const apiSecret = Deno.env.get('OS_PLACES_API_SECRET')

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'OS Places key is not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const baseUrl = Deno.env.get('OS_PLACES_BASE_URL') || 'https://api.os.uk/search/places/v1/find'
    const params = new URLSearchParams({
      query,
      maxresults: String(limit),
      output_srs: 'EPSG:4326',
      dataset: 'DPA',
      key: apiKey,
    })

    const headers: HeadersInit = {
      Accept: 'application/json',
    }

    if (apiSecret) {
      headers['X-API-Secret'] = apiSecret
    }

    const osResponse = await fetch(`${baseUrl}?${params.toString()}`, { headers })

    if (!osResponse.ok) {
      const details = await osResponse.text()
      return new Response(
        JSON.stringify({
          success: false,
          error: 'OS Places request failed',
          status: osResponse.status,
          details,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const payload = (await osResponse.json()) as { results?: Array<Record<string, unknown>> }
    const results = (payload.results || [])
      .map((item, index) => mapOsPlaceResult(item, index))
      .filter((item): item is AddressSuggestion => item !== null)

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unexpected server error',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
