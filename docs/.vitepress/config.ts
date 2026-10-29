import { defineConfig } from 'vitepress'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import openspec, { generateOpenSpecPages, generateOpenSpecSidebar, openspecNav } from '@stritti/vitepress-plugin-openspec'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const specDir = path.resolve(__dirname, '../../openspec')

// Generate pages before VitePress scans srcDir for routes.
// This ensures pages exist on first build and in CI environments.
generateOpenSpecPages({ specDir, outDir: 'openspec', srcDir: path.resolve(__dirname, '..') })

const PACKAGE_NAME = '@stritti/vitepress-plugin-openspec'
const NPM_URL = `https://www.npmjs.com/package/${PACKAGE_NAME}`
const GITHUB_URL = 'https://github.com/stritti/vitepress-plugin-openspec'

// package.json is not bumped by semantic-release, so ask the npm registry for the
// published version and fall back to the local one when offline.
async function resolveVersion(): Promise<string> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${PACKAGE_NAME}/latest`, {
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const { version } = (await res.json()) as { version?: string }
      if (version) return version
    }
  } catch {
    // offline or registry unavailable
  }
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf-8'))
  return pkg.version as string
}

const version = await resolveVersion()

export default defineConfig({
  title: 'vitepress-plugin-openspec',
  description: 'A VitePress plugin that renders OpenSpec project documentation as structured VitePress pages.',
  base: '/vitepress-plugin-openspec/',

  transformPageData(pageData) {
    if (pageData.relativePath === 'index.md') {
      const hero = pageData.frontmatter.hero
      hero.actions = [
        ...hero.actions,
        { theme: 'alt', text: `npm v${version}`, link: NPM_URL },
      ]
    }
  },

  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/vitepress-plugin-openspec/favicon.svg' }]],

  vite: {
    plugins: [
      openspec({
        specDir,
        outDir: 'openspec',
      }),
    ],
  },

  themeConfig: {
    logo: { light: '/logo-light.svg', dark: '/logo-dark.svg' },

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide' },
      openspecNav(specDir, { outDir: 'openspec', text: 'OpenSpec' }),
      {
        text: `v${version}`,
        items: [
          { text: 'npm package', link: NPM_URL },
          { text: 'Release notes', link: `${GITHUB_URL}/releases/tag/v${version}` },
          { text: 'All releases', link: `${GITHUB_URL}/releases` },
        ],
      },
    ],

    sidebar: {
      '/openspec/': generateOpenSpecSidebar(specDir, { outDir: 'openspec' }),
    },

    socialLinks: [
      { icon: 'github', link: GITHUB_URL },
      { icon: 'npm', link: NPM_URL },
    ],
  },
})
