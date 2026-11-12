// Writes every Markdown artifact the site serves to agents, into public/, which
// Next copies into the export verbatim.
//
// The twins are transformed rather than raw MDX: a `<Card description="...">`
// attribute is not text to a Markdown parser, and on the landing pages those
// cards are the entire content.
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { DOCS_URL, home, llmsSummary } from '../lib/site.mjs'

const CONTENT = 'content/docs'
const PUBLIC = 'public'
const DOCS_ROUTE = '/docs'

/** Removed before each run, so a renamed page cannot linger. */
const GENERATED = [
  'public/docs',
  'public/docs.md',
  'public/index.md',
  'public/llms.txt',
  'public/llms-full.txt',
]

function markdownPath(route) {
  return route === '/' ? join(PUBLIC, 'index.md') : join(PUBLIC, `${route.slice(1)}.md`)
}

function markdownUrl(route) {
  return route === '/' ? `${DOCS_URL}/index.md` : `${DOCS_URL}${route}.md`
}

/** Links rather than bare URLs: a bare URL before a period is ambiguous to parse. */
function directive(route) {
  const page = route === '/' ? DOCS_URL : `${DOCS_URL}${route}`
  return `> For AI agents: this is the Markdown source of [${route}](${page}). Every page of this documentation is indexed at [llms.txt](${DOCS_URL}/llms.txt).`
}

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

function parseFrontmatter(source, file) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) throw new Error(`${file} has no frontmatter`)
  const title = match[1].match(/^title:\s*(.+)$/m)?.[1].trim()
  const description = match[1].match(/^description:\s*(.+)$/m)?.[1].trim()
  if (!title) throw new Error(`${file} has no title`)
  return { title, description, body: source.slice(match[0].length).trimStart() }
}

/**
 * Resolve a folder's `pages` array in sidebar order. Listed but absent, or
 * present but unlisted, throws: a page missing from llms.txt is one agents
 * never see, and silence is how that happens.
 */
async function readFolder(directory, route) {
  const metaPath = join(directory, 'meta.json')
  const meta = JSON.parse(await readFile(metaPath, 'utf8'))
  if (!Array.isArray(meta.pages)) throw new Error(`${metaPath} has no pages array`)

  const children = []
  for (const name of meta.pages) {
    const file = join(directory, `${name}.mdx`)
    if (await exists(file)) {
      const pageRoute = name === 'index' ? route : `${route}/${name}`
      const { title, description, body } = parseFrontmatter(await readFile(file, 'utf8'), file)
      children.push({ type: 'page', route: pageRoute, file, title, description, body })
      continue
    }
    const subdirectory = join(directory, name)
    if (await exists(join(subdirectory, 'meta.json'))) {
      children.push(await readFolder(subdirectory, `${route}/${name}`))
      continue
    }
    throw new Error(`${metaPath} lists "${name}", which is neither ${name}.mdx nor ${name}/`)
  }

  const listed = new Set(meta.pages)
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = entry.name.replace(/\.mdx$/, '')
    if (entry.name === 'meta.json' || listed.has(name)) continue
    throw new Error(`${join(directory, entry.name)} is not listed in ${metaPath}`)
  }

  return { type: 'folder', route, title: meta.title ?? null, children }
}

function flatten(node) {
  if (node.type === 'page') return [node]
  return node.children.flatMap(flatten)
}

/** Rewrites below touch prose only: `<PROVIDER>_API_KEY` in a fence is not a tag. */
function splitFences(body) {
  const runs = []
  let current = { code: false, lines: [] }
  let fence = null
  for (const line of body.split('\n')) {
    const marker = line.match(/^(\s*)(`{3,}|~{3,})/)
    if (fence === null && marker) {
      runs.push(current)
      current = { code: true, lines: [line] }
      fence = marker[2][0]
      continue
    }
    if (fence !== null) {
      current.lines.push(line)
      if (marker && marker[2][0] === fence) {
        runs.push(current)
        current = { code: false, lines: [] }
        fence = null
      }
      continue
    }
    current.lines.push(line)
  }
  if (fence !== null) throw new Error('unterminated code fence')
  runs.push(current)
  return runs
}

function rewriteHref(href) {
  if (!href.startsWith('/')) return href
  const [path, fragment] = href.split('#')
  return markdownUrl(path) + (fragment ? `#${fragment}` : '')
}

function attributes(source) {
  const found = {}
  for (const [, name, value] of source.matchAll(/([A-Za-z]+)="([^"]*)"/g)) found[name] = value
  return found
}

/** Emit `<Cards>` as the link list it is, so the descriptions survive. */
function rewriteCards(text) {
  return text.replace(/<Cards>([\s\S]*?)<\/Cards>/g, (_, inner) => {
    const items = []
    for (const [, raw] of inner.matchAll(/<Card\b([\s\S]*?)\/>/g)) {
      const { title, description, href } = attributes(raw)
      if (!title || !href) throw new Error(`<Card> without a title or href: ${raw.trim()}`)
      const link = `- [${title}](${rewriteHref(href)})`
      items.push(description ? `${link}: ${description}` : link)
    }
    if (items.length === 0) throw new Error('<Cards> with no <Card> inside')
    return items.join('\n')
  })
}

/** GitHub alerts, so the distinction the Callout icon carries survives. */
const ALERTS = { warn: '[!WARNING]', warning: '[!WARNING]', error: '[!CAUTION]', info: '[!NOTE]' }

function rewriteCallouts(text) {
  return text.replace(/<Callout\b([^>]*)>([\s\S]*?)<\/Callout>/g, (_, raw, inner) => {
    const lines = inner
      .trim()
      .split('\n')
      .map((line) => line.replace(/^ {2}/, ''))
    const alert = ALERTS[attributes(raw).type]
    if (alert) lines.unshift(alert)
    return lines.map((line) => (line ? `> ${line}` : '>')).join('\n')
  })
}

function rewriteLinks(text) {
  return text.replace(/\]\((\/[^)\s]*)\)/g, (_, href) => `](${rewriteHref(href)})`)
}

function toMarkdown(body) {
  return splitFences(body)
    .map((run) =>
      run.code
        ? run.lines.join('\n')
        : rewriteLinks(rewriteCallouts(rewriteCards(run.lines.join('\n')))),
    )
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function pageMarkdown(page) {
  const parts = [`# ${page.title}`, directive(page.route)]
  if (page.description) parts.push(page.description)
  parts.push(toMarkdown(page.body))
  return `${parts.join('\n\n')}\n`
}

/** The `/` signpost has no MDX behind it. */
function homeMarkdown() {
  const links = home.links.map(
    (link) => `- [${link.title}](${rewriteHref(link.href)}): ${link.description}`,
  )
  return `${[`# ${home.title}`, directive('/'), home.intro, links.join('\n')].join('\n\n')}\n`
}

const homePage = { route: '/', title: home.title, description: home.summary }

function llmsTxt(tree, pages) {
  const sections = []
  for (const child of tree.children) {
    if (child.type === 'page') continue
    const body = flatten(child).map((page) =>
      `- [${page.title}](${markdownUrl(page.route)}): ${page.description ?? ''}`.trimEnd(),
    )
    sections.push(`## ${child.title ?? child.route}\n\n${body.join('\n')}`)
  }

  const landing = [homePage, ...pages.filter((page) => page.route === DOCS_ROUTE)].map((page) =>
    `- [${page.title}](${markdownUrl(page.route)}): ${page.description ?? ''}`.trimEnd(),
  )

  return `${[
    `# ${home.title}`,
    `> ${llmsSummary}`,
    'Every link below points at the Markdown source of a page. Drop the `.md` extension for the HTML version, or ask for it with an `Accept: text/markdown` header.',
    `## Overview\n\n${landing.join('\n')}`,
    ...sections,
    `## Optional\n\n- [Full documentation](${DOCS_URL}/llms-full.txt): Every page above concatenated into one file.`,
  ].join('\n\n')}\n`
}

function llmsFullTxt(pages) {
  const header = [
    `# ${home.title}`,
    `> ${llmsSummary}`,
    `> For AI agents: this is every page of ${DOCS_URL} in one file. The per-page index is at [llms.txt](${DOCS_URL}/llms.txt).`,
  ].join('\n\n')

  const body = pages.map((page) => {
    const parts = [`# ${page.title} (${DOCS_URL}${page.route})`]
    if (page.description) parts.push(page.description)
    parts.push(toMarkdown(page.body))
    return parts.join('\n\n')
  })

  return `${[header, ...body].join('\n\n---\n\n')}\n`
}

async function write(path, contents) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, contents)
}

for (const path of GENERATED) await rm(path, { recursive: true, force: true })

const tree = await readFolder(CONTENT, DOCS_ROUTE)
const pages = flatten(tree)

for (const page of pages) await write(markdownPath(page.route), pageMarkdown(page))
await write(markdownPath('/'), homeMarkdown())
await write(join(PUBLIC, 'llms.txt'), llmsTxt(tree, pages))
await write(join(PUBLIC, 'llms-full.txt'), llmsFullTxt(pages))

console.log(`markdown: ${pages.length + 1} pages, llms.txt, llms-full.txt`)
