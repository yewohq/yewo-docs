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
