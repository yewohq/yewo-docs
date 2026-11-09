# Yewo docs

[Fumadocs](https://fumadocs.dev) + Next.js documentation site for the Yewo CLI and
Yewo Cloud, deployed as a static export to Cloudflare Workers at
[docs.tryyewo.dev](https://docs.tryyewo.dev).

```bash
./start.sh           # install if needed, then serve on localhost:3000
./start.sh check     # typecheck, lint, formatting
./start.sh --help    # every task
```

`start.sh` wraps the npm scripts, which CI calls directly.

## Where the content lives

`content/docs/` holds the MDX. Two folders in it carry `"root": true` in their
`meta.json`, which makes each one a separate sidebar tab:

| Folder                | Tab   | Covers                                              |
| --------------------- | ----- | --------------------------------------------------- |
| `content/docs/cli/`   | CLI   | The `yewo` command, `yewo.yaml`, verdicts, reports. |
| `content/docs/cloud/` | Cloud | Hosted runs and shared review. In development.      |

`content/docs/index.mdx` is the shared landing page above both tabs, and the order
of pages within a tab comes from the `pages` array in that folder's `meta.json`.

The CLI pages are derived from the README in
[yewohq/yewo](https://github.com/yewohq/yewo), which is the CLI's own repository.
When the CLI's public interface changes, that README and these pages both need
updating.

## Design tokens

`app/global.css` imports the Fumadocs preset and then aliases Fumadocs' token
contract (`--color-fd-*`) onto Yewo's palette, so every Fumadocs component renders
in Yewo's colours with no per-component overrides.

The raw values are transcribed from the Yewo marketing site at
[tryyewo.dev](https://tryyewo.dev). Light mode uses the paper/sand variant that
site uses, so the docs read as a continuation of it rather than of the in-app
neutral theme. Callout and verdict colours come from the run-outcome tokens
(`pass`/`fail`/`warn`), so a `failed` verdict in prose matches a `failed` row in
the app.
