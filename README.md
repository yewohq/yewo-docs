# Yewo docs

[Fumadocs](https://fumadocs.dev) + Next.js documentation site, deployed as a
static export to Cloudflare Workers at
[docs.tryyewo.dev](https://docs.tryyewo.dev).

```bash
./start.sh           # install if needed, then serve on localhost:3000
./start.sh check     # typecheck, lint, formatting
./start.sh --help    # every task
```

## Where the content lives

`content/docs/` holds the MDX. `cli/` and `cloud/` carry `"root": true` in their
`meta.json`, which makes each a separate sidebar tab. `index.mdx` is the shared
landing page above both. Page order within a tab comes from the `pages` array in
that folder's `meta.json`.

## What agents get

`scripts/generate-markdown.mjs` runs before `dev` and `build` and writes every
agent-facing artifact into `public/`: a `.md` twin of each page
(`/docs/cli.md`), `/index.md` for the `/` signpost, `/llms.txt`, and
`/llms-full.txt`. All of it is generated and gitignored. There is one Markdown
representation of a page, not one for agents and another for the UI's copy
button, so the two cannot disagree.

The twins are transformed, not raw MDX: `<Cards>` becomes a Markdown link list,
`<Callout>` becomes a GitHub alert, and internal links become absolute `.md`
URLs. The script throws when a page is missing from a `meta.json` `pages` array
or listed there but absent -- a page the index does not mention is a page agents
never find.

`worker/index.ts` is the only request-time behaviour: it answers
`Accept: text/markdown` on a page URL with that page's twin, and passes
everything else through to the asset store.
