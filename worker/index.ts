// Content negotiation in front of the static export. Agents that know the `.md`
// convention fetch the twin directly; the ones that do not ask the page URL for
// `Accept: text/markdown`, and a plain asset server answers those with HTML.
//
// `run_worker_first` sends every request here, so anything that is not a
// Markdown negotiation is handed straight back to the asset store.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
}

const MARKDOWN_TYPES = new Set(['text/markdown', 'text/x-markdown'])

// Wildcards count as a page request, not a Markdown one: `*/*` is what browsers
// and curl send, and answering those with Markdown would break the site.
const PAGE_TYPES = new Set(['text/html', 'application/xhtml+xml', 'text/*', '*/*'])

function quality(parameters: string[]): number {
  for (const parameter of parameters) {
    const match = /^q=([0-9.]+)$/.exec(parameter)
    if (!match) continue
    const value = Number(match[1])
    return Number.isFinite(value) ? value : 0
  }
  return 1
}

/** Highest q-value the header gives any of `types`, or 0 for none. */
function preference(accept: string, types: Set<string>): number {
  let best = 0
  for (const entry of accept.split(',')) {
    const [type, ...parameters] = entry.split(';').map((part) => part.trim().toLowerCase())
    if (!types.has(type)) continue
    best = Math.max(best, quality(parameters))
  }
  return best
}

function wantsMarkdown(accept: string): boolean {
  const markdown = preference(accept, MARKDOWN_TYPES)
  return markdown > 0 && markdown >= preference(accept, PAGE_TYPES)
}

/** Null when the path already names a file (`/llms.txt`, `/docs/cli.md`). */
function markdownPath(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '')
  if (path === '') return '/index.md'
  if (/\.[a-z0-9]+$/i.test(path)) return null
  return `${path}.md`
}

async function negotiate(request: Request, env: Env): Promise<Response> {
  const method = request.method.toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') return env.ASSETS.fetch(request)
  if (!wantsMarkdown(request.headers.get('Accept') ?? '')) return env.ASSETS.fetch(request)

  const url = new URL(request.url)
  const path = markdownPath(url.pathname)
  if (path === null) return env.ASSETS.fetch(request)
  url.pathname = path

  const markdown = await env.ASSETS.fetch(new Request(url, { method, headers: request.headers }))
  // A 404 for the Markdown is not a 404 for the page.
  if (!markdown.ok) return env.ASSETS.fetch(request)

  const headers = new Headers(markdown.headers)
  headers.set('Content-Type', 'text/markdown; charset=utf-8')
  return new Response(markdown.body, {
    status: markdown.status,
    statusText: markdown.statusText,
    headers,
  })
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await negotiate(request, env)
    // Two representations per URL, so a hit for one is not a hit for the other.
    const headers = new Headers(response.headers)
    headers.append('Vary', 'Accept')
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}

export default worker
