import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { appName, projectRepo, SITE_URL } from './shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <span className="font-semibold">{appName}</span>
          <span className="text-fd-muted-foreground">docs</span>
        </>
      ),
      url: '/',
    },
    links: [
      { text: 'CLI', url: '/docs/cli', active: 'nested-url' },
      { text: 'Cloud', url: '/docs/cloud', active: 'nested-url' },
      { text: 'tryyewo.dev', url: SITE_URL, external: true },
    ],
    githubUrl: `https://github.com/${projectRepo.user}/${projectRepo.repo}`,
  }
}
