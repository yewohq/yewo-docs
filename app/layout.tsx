import type { Metadata } from 'next'
import { Funnel_Sans, JetBrains_Mono } from 'next/font/google'
import { Provider } from '@/components/provider'
import { DOCS_URL } from '@/lib/shared'
import './global.css'

const funnelSans = Funnel_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-funnel-sans',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

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
    <html
      lang="en"
      className={`${funnelSans.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen font-sans antialiased">
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
