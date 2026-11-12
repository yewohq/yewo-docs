// Shared with scripts/generate-markdown.mjs. Plain ESM, not TypeScript, so the
// prebuild script can import it without a compile step.

/** Canonical origin. Absolute URLs in metadata and Markdown need it at build time. */
export const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://docs.tryyewo.dev'

/** The `/` signpost, rendered by app/(home)/page.tsx and emitted as /index.md. */
export const home = {
  title: 'Yewo docs',
  summary: 'Entry point for this site, and a signpost to the CLI and Cloud documentation.',
  intro:
    'Yewo is an AI testing agent for Android and iOS apps. Describe a user journey in plain ' +
    'language and Yewo operates the real app, checks what happened, and produces an ' +
    'evidence-backed report.',
  links: [
    {
      title: 'CLI documentation',
      href: '/docs/cli',
      description: 'Install Yewo, configure a project, and run journey tests.',
    },
    {
      title: 'Yewo Cloud',
      href: '/docs/cloud',
      description: 'The status of Yewo Cloud, which is still in development.',
    },
  ],
}

/** The llms.txt blockquote: what this project is, before an agent spends a request. */
export const llmsSummary =
  'Yewo is an AI testing agent for Android and iOS apps: describe a user journey in plain ' +
  'language and Yewo operates the real app, checks what happened, and writes an evidence-backed ' +
  'report. The CLI is the whole product today and needs no account; Yewo Cloud is still in ' +
  'development.'
