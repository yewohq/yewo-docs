import { source } from '@/lib/source'
import { DOCS_URL } from '@/lib/shared'

type Page = NonNullable<ReturnType<typeof source.getPage>>

function absolute(path: string) {
  return `${DOCS_URL}${path}`
}

/**
 * Breadcrumb trail for one page. Only ancestors that resolve to a real page
 * are listed: a folder without an index page has no title to show, and
 * inventing one would describe a URL that does not exist.
 */
function breadcrumbs(page: Page) {
  const trail = [{ name: 'Docs', url: '/docs' }]

  for (let depth = 1; depth < page.slugs.length; depth += 1) {
    const ancestor = source.getPage(page.slugs.slice(0, depth))
    if (ancestor) trail.push({ name: ancestor.data.title, url: ancestor.url })
  }

  if (page.url !== '/docs') trail.push({ name: page.data.title, url: page.url })

  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absolute(item.url),
    })),
  }
}

export function structuredData(page: Page) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: page.data.title,
        description: page.data.description,
        url: absolute(page.url),
        image: absolute(`/og/docs/${page.slugs.join('/')}/image.png`),
        inLanguage: 'en',
        isPartOf: {
          '@type': 'WebSite',
          name: 'Yewo docs',
          url: DOCS_URL,
        },
      },
      breadcrumbs(page),
    ],
  }
}
