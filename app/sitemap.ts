import type { MetadataRoute } from 'next'
import { source } from '@/lib/source'
import { DOCS_URL } from '@/lib/shared'

// Required under `output: 'export'`: the file is written once at build time.
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${DOCS_URL}/`, changeFrequency: 'monthly', priority: 1 },
    ...source.getPages().map((page) => ({
      url: `${DOCS_URL}${page.url}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
