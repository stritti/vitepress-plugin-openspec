import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Footer from './Footer.vue'
import heroArt from './hero-art.svg?raw'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h('div', { class: 'hero-art', innerHTML: heroArt }),
      'layout-bottom': () => h(Footer),
    }),
} satisfies Theme
