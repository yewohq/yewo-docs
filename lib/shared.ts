import { createGetUrl } from 'fumadocs-core/source'

export const appName = 'Yewo'
export const docsRoute = '/docs'
export const docsImageRoute = '/og/docs'
export const docsContentRoute = '/llms.mdx/docs'

/** Canonical origin. Absolute URLs in metadata need it at build time. */
export const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://docs.tryyewo.dev'

export const SITE_URL = 'https://tryyewo.dev'

/** The CLI's own repository, which the nav's GitHub link points at. */
export const projectRepo = {
  user: 'yewohq',
  repo: 'yewo',
  branch: 'master',
}

/**
 * This repository. `content/docs/` lives here rather than in the CLI repo, so a
 * per-page "edit this page" link has to resolve against yewo-docs -- against
 * projectRepo it would point at a path that does not exist there.
 */
export const docsRepo = {
  user: 'yewohq',
  repo: 'yewo-docs',
  branch: 'master',
}

const getContentUrl = createGetUrl(docsContentRoute)

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md']

  return { segments, url: getContentUrl(segments, page.locale) }
}

const getImageUrl = createGetUrl(docsImageRoute)

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png']

  return { segments, url: getImageUrl(segments, page.locale) }
}
