<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const { isDark, frontmatter, page, theme } = useData()

const year = new Date().getFullYear()

const GITHUB_URL = 'https://github.com/stritti/vitepress-plugin-openspec'
const NPM_URL = 'https://www.npmjs.com/package/@stritti/vitepress-plugin-openspec'

const logo = computed(() => withBase(isDark.value ? '/logo-dark.svg' : '/logo-light.svg'))

const docLinks = [
  { text: 'Home', link: '/' },
  { text: 'Guide', link: '/guide' },
  { text: 'Specifications', link: '/openspec/specs/' },
  { text: 'Changes', link: '/openspec/changes/' },
]

const resourceLinks = [
  { text: 'GitHub', link: GITHUB_URL },
  { text: 'npm package', link: NPM_URL },
  { text: 'OpenSpec', link: 'https://openspec.dev/' },
  { text: 'Releases', link: `${GITHUB_URL}/releases` },
]

// Mirror the default theme: on pages with a fixed sidebar the footer must
// not slide underneath it, so it gets the same left offset as the content.
// Matching uses page.relativePath like the theme's own useSidebar().
const hasSidebar = computed(() => {
  if (frontmatter.value.sidebar === false || frontmatter.value.layout === 'home') return false
  const sidebarConfig = theme.value.sidebar
  if (!sidebarConfig) return false
  if (Array.isArray(sidebarConfig)) return sidebarConfig.length > 0
  const relativePath = `/${page.value.relativePath}`
  return Object.keys(sidebarConfig).some((key) =>
    relativePath.startsWith(key.startsWith('/') ? key : `/${key}`),
  )
})
</script>

<template>
  <footer v-if="frontmatter.footer !== false" class="site-footer" :class="{ 'has-sidebar': hasSidebar }">
    <div class="footer-inner">
      <div class="footer-brand">
        <a class="brand" :href="withBase('/')">
          <img class="logo" :src="logo" alt="" />
          <span class="brand-name">vitepress-plugin-openspec</span>
        </a>
        <p class="tagline">Render your project's OpenSpec folder as structured VitePress documentation pages.</p>
      </div>
      <nav class="footer-col" aria-label="Documentation">
        <p class="col-title">Documentation</p>
        <a v-for="item in docLinks" :key="item.link" :href="withBase(item.link)">{{ item.text }}</a>
      </nav>
      <nav class="footer-col" aria-label="Resources">
        <p class="col-title">Resources</p>
        <a
          v-for="item in resourceLinks"
          :key="item.link"
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
          >{{ item.text }}</a
        >
      </nav>
    </div>
    <div class="footer-bottom">
      <p>
        Copyright © {{ year }}
        <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer">Stephan Strittmatter</a>
      </p>
      <p>
        Released under the
        <a :href="`${GITHUB_URL}/blob/main/LICENSE`" target="_blank" rel="noopener noreferrer">MIT License</a>.
      </p>
    </div>
  </footer>
</template>
