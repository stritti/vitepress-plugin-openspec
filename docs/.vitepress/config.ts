import { defineConfig } from 'vitepress'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import openspec, { generateOpenSpecPages, generateOpenSpecSidebar, openspecNav } from '@stritti/vitepress-plugin-openspec'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const specDir = path.resolve(__dirname, '../../openspec')

// Generate pages before VitePress scans srcDir for routes.
// This ensures pages exist on first build and in CI environments.
generateOpenSpecPages({ specDir, outDir: 'openspec', srcDir: path.resolve(__dirname, '..') })

const NPM_URL = 'https://www.npmjs.com/package/@stritti/vitepress-plugin-openspec'
const GITHUB_URL = 'https://github.com/stritti/vitepress-plugin-openspec'

export default defineConfig({
  title: 'vitepress-plugin-openspec',
  description: 'A VitePress plugin that renders OpenSpec project documentation as structured VitePress pages.',
  base: '/vitepress-plugin-openspec/',

  transformPageData(pageData) {
    if (pageData.relativePath === 'index.md') {
      const hero = pageData.frontmatter.hero
      hero.actions = [
        ...hero.actions,
        { theme: 'alt', text: 'npm package', link: NPM_URL },
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
        text: 'Releases',
        items: [
          { text: 'npm package', link: NPM_URL },
          { text: 'Release notes', link: `${GITHUB_URL}/releases/latest` },
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
