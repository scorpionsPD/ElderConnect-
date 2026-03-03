# Address Autocomplete API Setup Guide

Your ElderConnect+ app now uses **Nominatim (OpenStreetMap)** for address autocomplete by default—completely **free and open-source**.

## Currently Configured (Default)

**Nominatim/OpenStreetMap**
- **Cost**: FREE (with fair-use policy)
- **Accuracy**: Good for most worldwide addresses and postcodes (especially UK, US, EU)
- **Setup**: Already implemented in the app
- **Usage Policy**: No API key required; requests should include an email for usage monitoring
- **Rate Limit**: 1 request/second for free tier (commercial use encouraged to self-host)
- **No account needed**

### Environment Variables (Optional)

```bash
# admin/.env.local
NEXT_PUBLIC_ADDRESS_PROVIDER=nominatim
NEXT_PUBLIC_NOMINATIM_URL=https://nominatim.openstreetmap.org/search
NEXT_PUBLIC_NOMINATIM_EMAIL=info@scotitech.com
```

**Note**: `NEXT_PUBLIC_NOMINATIM_EMAIL` is optional but recommended—it helps OSM monitor usage and contact you if there are issues.

---

## Alternative Low-Cost Options

If you need higher rate limits or commercial support, these are the best low-cost alternatives:

### 1. Mapbox Geocoding API (Best commercial option)
- **Cost**: FREE up to 100,000 requests/month; $0.50 per 1,000 requests after
- **Accuracy**: Excellent worldwide coverage and postcode search
- **Rate Limit**: 600 requests/minute on free tier
- **Setup Steps**:
  1. Create account: https://www.mapbox.com/signup
  2. Go to https://account.mapbox.com/access-tokens/
  3. Copy your default public token
  4. Add to `admin/.env.local`:
     ```bash
     NEXT_PUBLIC_ADDRESS_PROVIDER=mapbox
     NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...your-token
     ```
  5. Add mapbox integration to `admin/src/utils/address-search.ts`:
     ```typescript
     if (provider === 'mapbox') {
       const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
       if (!token) throw new Error('Mapbox token not configured')
       const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=${options.limit || 6}`
       const response = await fetch(url)
       const data = await response.json()
       return data.features.map((feat: any) => ({
         id: feat.id,
         label: feat.place_name,
         formattedAddress: feat.place_name,
         latitude: feat.center[1],
         longitude: feat.center[0],
         postcode: feat.context?.find((c: any) => c.id.startsWith('postcode'))?.text,
         city: feat.context?.find((c: any) => c.id.startsWith('place'))?.text,
         state: feat.context?.find((c: any) => c.id.startsWith('region'))?.text,
         country: feat.context?.find((c: any) => c.id.startsWith('country'))?.text,
       }))
     }
     ```

### 2. LocationIQ (Budget-friendly OSM fork)
- **Cost**: FREE for 5,000 requests/day; $49/month for 30,000 requests/day
- **Accuracy**: Same as Nominatim (uses OSM data)
- **Rate Limit**: 2 requests/second on free tier
- **Setup Steps**:
  1. Create account: https://locationiq.com/register
  2. Get API key from dashboard: https://my.locationiq.com/dashboard/
  3. Add to `admin/.env.local`:
     ```bash
     NEXT_PUBLIC_ADDRESS_PROVIDER=locationiq
     NEXT_PUBLIC_LOCATIONIQ_TOKEN=pk.your-token
     NEXT_PUBLIC_LOCATIONIQ_URL=https://api.locationiq.com/v1/search
     ```

### 3. Self-hosted Nominatim (Unlimited, high-volume)
- **Cost**: Server hosting only (~$10-40/month for small-medium usage)
- **Best for**: High volume (>100k requests/month) or strict privacy requirements
- **Setup**: Requires Docker + planet OSM data: https://nominatim.org/release-docs/latest/admin/Installation/

---

## Recommendation

**For development and MVP launch**: Stick with the current **Nominatim** setup (free, already working).

**For scaling** (if you exceed 1 request/second or need commercial support): Switch to **Mapbox** (100k free requests/month is generous for most startups).

**Current implementation** supports both without code changes—just swap the environment variable `NEXT_PUBLIC_ADDRESS_PROVIDER`.

---

## Files Modified

- `admin/src/types/address.ts` - Address types
- `admin/src/utils/address-search.ts` - Search service (currently Nominatim)
- `admin/src/components/AddressAutocomplete.tsx` - Reusable autocomplete component
- `admin/src/components/CompanionRequestModal.tsx` - Integrated with location + coordinates
- `admin/src/pages/settings.tsx` - Integrated in profile address field
- `admin/src/pages/signup.tsx` - Integrated in signup flow (optional address step)
- `admin/src/contexts/AuthContext.tsx` - User model extended with address fields

All integrations capture:
- Full formatted address
- Postcode
- Latitude/longitude coordinates (for distance matching)
