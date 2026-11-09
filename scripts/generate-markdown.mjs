// Writes a .md file next to each built page so /docs/cli.md serves the source
// of /docs/cli. Next copies public/ into the export verbatim, so creating the
// file is enough -- no request-time code is involved.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

const CONTENT = 'content/docs'
const OUTPUT = 'public/docs'

async function mdxFiles(directory) {
  const found = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) found.push(...(await mdxFiles(path)))
    else if (entry.name.endsWith('.mdx')) found.push(path)
  }
  return found
}

function frontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return { title: null, body: source }
  const title = match[1].match(/^title:\s*(.+)$/m)?.[1].trim()
  return { title: title ?? null, body: source.slice(match[0].length).trimStart() }
}

/** `cli/index.mdx` serves /docs/cli, so it becomes `cli.md`, not `cli/index.md`. */
function outputPath(file) {
  const route = relative(CONTENT, file).replace(/\.mdx$/, '')
  if (route === 'index') return `${OUTPUT}.md`
  return join(OUTPUT, `${route.replace(/\/index$/, '')}.md`)
}

await rm(OUTPUT, { recursive: true, force: true })
await rm(`${OUTPUT}.md`, { force: true })

const files = await mdxFiles(CONTENT)
for (const file of files) {
  const { title, body } = frontmatter(await readFile(file, 'utf8'))
  const path = outputPath(file)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, title ? `# ${title}\n\n${body}` : body)
}

console.log(`markdown: wrote ${files.length} files to ${OUTPUT}`)
