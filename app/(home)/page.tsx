import type { Metadata } from 'next'
import Link from 'next/link'
import { home } from '@/lib/site.mjs'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

/**
 * The docs subdomain has no marketing surface of its own -- tryyewo.dev owns
 * that -- so `/` is a signpost into the two documentation roots rather than a
 * landing page. A static export cannot redirect, so it has to render something.
 *
 * The copy lives in lib/site.mjs because scripts/generate-markdown.mjs emits
 * this page as /index.md, and the two must say the same thing.
 */
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold">{home.title}</h1>
        <p className="max-w-xl text-fd-muted-foreground">{home.intro}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {home.links.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            title={link.description}
            className={
              index === 0
                ? 'rounded-lg bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground'
                : 'rounded-lg border border-fd-border px-5 py-2.5 font-medium'
            }
          >
            {link.title}
          </Link>
        ))}
      </div>
    </main>
  )
}
