const configuredBrandIconUrl = process.env.NEXT_PUBLIC_BRAND_ICON_URL?.trim();
const configuredBrandIconAlt = process.env.NEXT_PUBLIC_BRAND_ICON_ALT?.trim();
const configuredBrandIconVersion = process.env.NEXT_PUBLIC_BRAND_ICON_VERSION?.trim();
const buildBrandRevision = '20260327-1';

export const BRAND_ICON_URL = configuredBrandIconUrl || '/favicon.png';
export const BRAND_ICON_ALT = configuredBrandIconAlt || 'ElderConnect+ logo';
export const BRAND_ICON_VERSION = configuredBrandIconVersion
  ? `${configuredBrandIconVersion}-${buildBrandRevision}`
  : buildBrandRevision;

export const BRAND_ICON_WITH_VERSION =
  BRAND_ICON_URL.includes('?')
    ? `${BRAND_ICON_URL}&v=${BRAND_ICON_VERSION}`
    : `${BRAND_ICON_URL}?v=${BRAND_ICON_VERSION}`;
