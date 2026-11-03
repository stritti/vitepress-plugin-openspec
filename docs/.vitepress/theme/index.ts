import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Footer from './Footer.vue'
import heroArt from './hero-art.svg?raw'
import './custom.css'

const PACKAGE_NAME = '@stritti/vitepress-plugin-openspec'
const NPM_URL = `https://www.npmjs.com/package/${PACKAGE_NAME}`
const GITHUB_URL = 'https://github.com/stritti/vitepress-plugin-openspec'

const badges = [
  {
    alt: 'npm version',
    src: `https://img.shields.io/npm/v/${PACKAGE_NAME}?style=flat-square&color=cb3837&logo=npm`,
    href: NPM_URL,
  },
  {
    alt: 'npm downloads per month',
    src: `https://img.shields.io/npm/dm/${PACKAGE_NAME}?style=flat-square&color=cb3837&logo=npm`,
    href: NPM_URL,
  },
  {
    alt: 'npm downloads per week',
    src: `https://img.shields.io/npm/dw/${PACKAGE_NAME}?style=flat-square&color=cb3837&logo=npm`,
    href: NPM_URL,
  },
  {
    alt: 'License: MIT',
    src: 'https://img.shields.io/badge/license-MIT-blue?style=flat-square',
    href: `${GITHUB_URL}/blob/main/LICENSE`,
  },
  {
    alt: 'Release',
    src: `https://img.shields.io/github/actions/workflow/status/stritti/vitepress-plugin-openspec/publish.yml?branch=main&style=flat-square&logo=github&label=release`,
    href: `${GITHUB_URL}/actions/workflows/publish.yml`,
  },
]

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h('div', { class: 'hero-art', innerHTML: heroArt }),
      'home-hero-actions-after': () =>
        h(
          'div',
          { class: 'hero-badges' },
          badges.map((badge) => h('a', { href: badge.href }, h('img', { src: badge.src, alt: badge.alt }))),
        ),
      'layout-bottom': () => h(Footer),
    }),
} satisfies Theme
