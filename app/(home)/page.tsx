import Link from 'next/link'

/**
 * The docs subdomain has no marketing surface of its own -- tryyewo.dev owns
 * that -- so `/` is a signpost into the two documentation roots rather than a
 * landing page. A static export cannot redirect, so it has to render something.
 */
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold">Yewo docs</h1>
        <p className="max-w-xl text-fd-muted-foreground">
          Yewo is an AI testing agent for Android and iOS apps. Describe a user journey in plain
          language and Yewo operates the real app, checks what happened, and produces an
          evidence-backed report.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/docs/cli"
          className="rounded-lg bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground"
        >
          CLI documentation
        </Link>
        <Link
          href="/docs/cloud"
          className="rounded-lg border border-fd-border px-5 py-2.5 font-medium"
        >
          Yewo Cloud
        </Link>
      </div>
    </main>
  )
}
