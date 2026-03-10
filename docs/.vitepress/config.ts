import { defineConfig } from 'vitepress'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import openspec, { generateOpenSpecPages, generateOpenSpecSidebar, openspecNav } from 'vitepress-plugin-openspec'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const specDir = path.resolve(__dirname, '../../openspec')

// Generate pages before VitePress scans srcDir for routes.
// This ensures pages exist on first build and in CI environments.
generateOpenSpecPages({ specDir, outDir: 'openspec', srcDir: path.resolve(__dirname, '..') })

export default defineConfig({
  title: 'vitepress-plugin-openspec',
  description: 'A VitePress plugin that renders OpenSpec project documentation as structured VitePress pages.',
  base: '/vitepress-plugin-openspec/',

  vite: {
    plugins: [
      openspec({
        specDir,
        outDir: 'openspec',
      }),
    ],
  },

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      openspecNav(specDir, { outDir: 'openspec', text: '<svg width="16" height="19" viewBox="0 0 120 140" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="display:inline;vertical-align:middle;margin-right:5px"><path d="M40 0C53.2 0 66.4 0 80 0C80 6.6 80 13.2 80 20C66.8 20 53.6 20 40 20C40 13.4 40 6.8 40 0Z"/><path d="M20 20C26.6 20 33.2 20 40 20C40 26.6 40 33.2 40 40C33.4 40 26.8 40 20 40C20 33.4 20 26.8 20 20Z"/><path d="M80 20C86.6 20 93.2 20 100 20C100 26.6 100 33.2 100 40C93.4 40 86.8 40 80 40C80 33.4 80 26.8 80 20Z"/><path d="M0 40C6.6 40 13.2 40 20 40C20 59.8 20 79.6 20 100C13.4 100 6.8 100 0 100C0 80.2 0 60.4 0 40Z"/><path d="M40 40C53.2 40 66.4 40 80 40C80 59.8 80 79.6 80 100C66.8 100 53.6 100 40 100C40 80.2 40 60.4 40 40Z"/><path d="M100 40C106.6 40 113.2 40 120 40C120 59.8 120 79.6 120 100C113.4 100 106.8 100 100 100C100 80.2 100 60.4 100 40Z"/><path d="M20 100C26.6 100 33.2 100 40 100C40 106.6 40 113.2 40 120C33.4 120 26.8 120 20 120C20 113.4 20 106.8 20 100Z"/><path d="M80 100C86.6 100 93.2 100 100 100C100 106.6 100 113.2 100 120C93.4 120 86.8 120 80 120C80 113.4 80 106.8 80 100Z"/><path d="M40 120C53.2 120 66.4 120 80 120C80 126.6 80 133.2 80 140C66.8 140 53.6 140 40 140C40 133.4 40 126.8 40 120Z"/></svg>OpenSpec' }),
    ],

    sidebar: {
      '/openspec/': generateOpenSpecSidebar(specDir, { outDir: 'openspec' }),
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/stritti/vitepress-plugin-openspec' },
    ],
  },
})
