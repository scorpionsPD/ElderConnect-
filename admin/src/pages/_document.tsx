import { Html, Head, Main, NextScript } from 'next/document'
import { BRAND_ICON_WITH_VERSION } from '@/utils/branding'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/png" href={BRAND_ICON_WITH_VERSION} />
        <link rel="shortcut icon" href={BRAND_ICON_WITH_VERSION} />
        <link rel="apple-touch-icon" href={BRAND_ICON_WITH_VERSION} />
        <link rel="apple-touch-icon-precomposed" href={BRAND_ICON_WITH_VERSION} />
        <meta name="description" content="ElderConnect+ Admin Dashboard" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
