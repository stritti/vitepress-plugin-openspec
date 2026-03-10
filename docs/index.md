---
layout: home

hero:
  name: vitepress-plugin-openspec
  text: OpenSpec docs for VitePress
  tagline: Render your project's OpenSpec folder — specs, changes, and artifacts — as structured VitePress documentation pages with sidebar and nav integration.
  actions:
    - theme: brand
      text: View Docs
      link: /openspec/
    - theme: alt
      text: View on GitHub
      link: https://github.com/stritti/vitepress-plugin-openspec

features:
  - title: Spec pages
    details: Capability specs from openspec/specs/ are rendered as individual pages — one per capability, collected under a Specifications index.
  - title: Change pages
    details: Active and archived changes from openspec/changes/ are rendered with their artifacts (proposal, design, tasks) as linked pages under a Changes index.
  - title: Nav & sidebar helpers
    details: openspecNav() and generateOpenSpecSidebar() wire your OpenSpec docs into VitePress themeConfig with a single call each.
---
