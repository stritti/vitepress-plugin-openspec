---
layout: home

hero:
  name: vitepress-plugin-openspec
  text: Your specs, as a living docs site.
  tagline: Render your project's OpenSpec folder — specs, changes, and artifacts — as structured VitePress documentation pages with sidebar and nav integration.
  actions:
    - theme: brand
      text: Get Started
      link: /guide
    - theme: alt
      text: View Docs
      link: /openspec/
    - theme: alt
      text: View on GitHub
      link: https://github.com/stritti/vitepress-plugin-openspec

features:
  - icon: { src: /icons/spec.svg }
    title: Spec pages
    details: Capability specs from openspec/specs/ are rendered as individual pages — one per capability, collected under a Specifications index.
  - icon: { src: /icons/change.svg }
    title: Change pages
    details: Active and archived changes from openspec/changes/ are rendered with their artifacts (proposal, design, tasks) as linked pages under a Changes index.
  - icon: { src: /icons/nav.svg }
    title: Nav & sidebar helpers
    details: openspecNav() and generateOpenSpecSidebar() wire your OpenSpec docs into VitePress themeConfig with a single call each.
  - icon: { src: /icons/zero.svg }
    title: Zero config
    details: The openspec/ folder and the VitePress source directory are detected automatically. One withOpenSpec() call, no manual route setup.
---

## One call in your config

Wrap your VitePress config. Pages, nav entry, sidebar, and the Vite plugin are merged in for you.

```ts
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress'
import { withOpenSpec } from '@stritti/vitepress-plugin-openspec'

export default defineConfig(
  withOpenSpec({
    title: 'My project',
  })
)
```

<p align="center">

[![npm version](https://img.shields.io/npm/v/@stritti/vitepress-plugin-openspec?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@stritti/vitepress-plugin-openspec)
[![npm downloads per month](https://img.shields.io/npm/dm/@stritti/vitepress-plugin-openspec?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@stritti/vitepress-plugin-openspec)
[![npm downloads per week](https://img.shields.io/npm/dw/@stritti/vitepress-plugin-openspec?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@stritti/vitepress-plugin-openspec)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/stritti/vitepress-plugin-openspec/blob/main/LICENSE)
[![Release](https://img.shields.io/github/actions/workflow/status/stritti/vitepress-plugin-openspec/publish.yml?branch=main&style=flat-square&logo=github&label=release)](https://github.com/stritti/vitepress-plugin-openspec/actions/workflows/publish.yml)

</p>
