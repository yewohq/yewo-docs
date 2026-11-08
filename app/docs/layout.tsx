import { source } from '@/lib/source'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { baseOptions } from '@/lib/layout.shared'

/**
 * The CLI and Cloud trees are separate roots (see the `root: true` meta.json in
 * each), which DocsLayout turns into the sidebar's tab switcher on its own. The
 * sidebar therefore shows one product at a time instead of merging two
 * unrelated navigations into one list.
 */
export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  )
}
