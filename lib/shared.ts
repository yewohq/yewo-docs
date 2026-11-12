import { createGetUrl } from 'fumadocs-core/source'
import { DOCS_URL } from './site.mjs'

export const appName = 'Yewo'
export const docsRoute = '/docs'
export const docsImageRoute = '/og/docs'

export { DOCS_URL }

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

/** The page's Markdown twin, written by scripts/generate-markdown.mjs. */
export function getPageMarkdownUrl(page: { url: string }) {
  return `${page.url}.md`
}

const getImageUrl = createGetUrl(docsImageRoute)

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png']

  return { segments, url: getImageUrl(segments, page.locale) }
}
