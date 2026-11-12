import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Provider } from '@/components/provider'
import { DOCS_URL } from '@/lib/shared'
import './global.css'

// Self-hosted so a build never depends on fonts.googleapis.com. Google splits
// each family into disjoint subsets, so latin and latin-ext are separate faces
// and each one has to carry the unicode-range that selects it.
const funnelSans = localFont({
  src: './fonts/funnel-sans-latin.woff2',
  weight: '400 600',
  variable: '--font-funnel-sans',
  display: 'swap',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

const funnelSansExt = localFont({
  src: './fonts/funnel-sans-latin-ext.woff2',
  weight: '400 600',
  variable: '--font-funnel-sans-ext',
  display: 'swap',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF',
    },
  ],
})

const jetBrainsMono = localFont({
  src: './fonts/jetbrains-mono-latin.woff2',
  weight: '400 500',
  variable: '--font-jetbrains-mono',
  display: 'swap',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

const jetBrainsMonoExt = localFont({
  src: './fonts/jetbrains-mono-latin-ext.woff2',
  weight: '400 500',
  variable: '--font-jetbrains-mono-ext',
  display: 'swap',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF',
    },
  ],
})

const fontVariables = [
  funnelSans.variable,
  funnelSansExt.variable,
  jetBrainsMono.variable,
  jetBrainsMonoExt.variable,
].join(' ')

export const metadata: Metadata = {
  metadataBase: new URL(DOCS_URL),
  title: {
    default: 'Yewo docs',
    template: '%s — Yewo docs',
  },
  description: 'Documentation for the Yewo testing agent and Yewo Cloud.',
  openGraph: { url: DOCS_URL, siteName: 'Yewo docs', type: 'website' },
}

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-sans antialiased">
        {/* First in the body so an agent reading the top of the document finds it before chrome. */}
        <p className="sr-only">
          For AI agents: this site serves a Markdown version of every page at the same path with a
          .md extension, such as {DOCS_URL}/docs/cli.md, or from the page URL itself with an Accept:
          text/markdown request header. Every page is indexed at{' '}
          <a href="/llms.txt">{DOCS_URL}/llms.txt</a>.
        </p>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
