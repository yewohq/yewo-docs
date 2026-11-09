import type { MetadataRoute } from 'next'
import { DOCS_URL } from '@/lib/shared'

// Required under `output: 'export'`: the file is written once at build time.
export const dynamic = 'force-static'

/**
 * Everything is public, so nothing is disallowed. The value of this file is
 * naming the sitemap: without robots.txt there is no standard place for a
 * crawler to discover it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${DOCS_URL}/sitemap.xml`,
    host: DOCS_URL,
  }
}
