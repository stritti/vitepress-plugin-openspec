# @stritti/vitepress-plugin-openspec

A [VitePress](https://vitepress.dev/) plugin that renders your [OpenSpec](https://openspec.dev/) folder as structured documentation pages with automatic sidebar and navigation integration.

[![npm version](https://img.shields.io/npm/v/@stritti/vitepress-plugin-openspec?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@stritti/vitepress-plugin-openspec)
[![npm downloads](https://img.shields.io/npm/dm/@stritti/vitepress-plugin-openspec?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@stritti/vitepress-plugin-openspec)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/stritti/vitepress-plugin-openspec/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/stritti/vitepress-plugin-openspec/publish.yml?branch=main&style=flat-square&logo=github&label=release)](https://github.com/stritti/vitepress-plugin-openspec/actions/workflows/publish.yml)

---

## What is OpenSpec?

[OpenSpec](https://openspec.dev/) is a specification format that organizes your project documentation into capabilities and changes. It structures your docs into:
- **Specs** – Capability specifications in `openspec/specs/<capability>/spec.md`
- **Changes** – Proposed changes with artifacts in `openspec/changes/<name>/`
- **Archive** – Completed changes in `openspec/changes/archive/`

This plugin renders your OpenSpec folder as navigable VitePress documentation pages.

---

## Quick Start

### Install

```bash
npm install @stritti/vitepress-plugin-openspec
# or with bun:
bun add @stritti/vitepress-plugin-openspec
```

### Configure

Wrap your VitePress config with `withOpenSpec()`:

```typescript
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress'
import { withOpenSpec } from '@stritti/vitepress-plugin-openspec'

export default defineConfig(
  withOpenSpec({
    title: 'My Project',
  })
)
```

That's it! Run `vitepress dev` and your OpenSpec docs appear at `/openspec/`.

---

## Features

- **Zero-config** – Automatically detects your `openspec/` folder and VitePress source directory
- **Live reload** – Pages update automatically during `vitepress dev` when you edit OpenSpec files
- **Sidebar & nav** – Automatic integration into VitePress theme with configurable labels
- **Index pages** – Generated overviews for specs, changes, and archive with proper hierarchy
- **Smart defaults** – Works with standard project layouts out of the box

---

## Configuration

### `withOpenSpec(config, options?)`

Wrap your VitePress config. `withOpenSpec` handles page generation, the Vite plugin for live reload, nav entry, and sidebar section in one call.

```typescript
import { defineConfig } from 'vitepress'
import { withOpenSpec } from '@stritti/vitepress-plugin-openspec'

export default defineConfig(
  withOpenSpec(
    {
      // Your regular VitePress config
      themeConfig: {
        nav: [{ text: 'Home', link: '/' }],
        sidebar: {},
      },
    },
    { specDir: '../openspec', outDir: 'openspec' } // Options (all optional)
  )
)
```

**Note:** Array-based sidebars are automatically converted to object form (`{ '/': [...] }`) to inject the OpenSpec section while preserving your existing entries.

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `specDir` | `string` | auto-detected | Path to your `openspec/` directory. Auto-detects nearest ancestor folder or falls back to `./openspec` |
| `outDir` | `string` | `'openspec'` | Output directory relative to VitePress `srcDir` |
| `srcDir` | `string` | auto-detected | VitePress source directory (folder containing `.vitepress/`) |
| `nav` | `boolean` | `true` | Prepend OpenSpec entry to `themeConfig.nav` |
| `sidebar` | `boolean` | `true` | Inject OpenSpec sidebar section into `themeConfig.sidebar` |
| `navText` | `string` | `'Docs'` | Label for the nav entry |

> **Missing `specDir`:** If the folder doesn't exist, the plugin emits a warning and skips generation. Your build continues normally.

> **Invalid `outDir`:** An absolute path, empty string, or path resolving outside `srcDir` throws an error at config time.

---

## Advanced Setup

For full control over each integration point, use the lower-level APIs:

```typescript
import { defineConfig } from 'vitepress'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import openspec, {
  generateOpenSpecPages,
  generateOpenSpecSidebar,
  openspecNav,
} from '@stritti/vitepress-plugin-openspec'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Must be called before defineConfig so pages exist when VitePress scans for routes
generateOpenSpecPages({
  specDir: path.resolve(__dirname, '../openspec'),
  outDir: 'openspec',
  srcDir: path.resolve(__dirname, '..'),
})

export default defineConfig({
  vite: {
    plugins: [openspec({ specDir: path.resolve(__dirname, '../openspec'), outDir: 'openspec' })],
  },
  themeConfig: {
    nav: [openspecNav(path.resolve(__dirname, '../openspec'), { outDir: 'openspec', text: 'Docs' })],
    sidebar: {
      '/openspec/': generateOpenSpecSidebar(path.resolve(__dirname, '../openspec'), { outDir: 'openspec' }),
    },
  },
})
```

---

## How It Works

VitePress scans `srcDir` for `.md` files **before** any Vite plugin hooks run. This plugin solves this with two mechanisms:

1. **`generateOpenSpecPages()`** – Called synchronously before `defineConfig()` to ensure pages exist when VitePress scans for routes (critical for first builds and CI)
2. **`openspec()` Vite plugin** – Re-generates pages on every config reload during `vitepress dev` for live reload support

The plugin automatically writes a `.gitignore` in the output directory to exclude generated files.

---

## Documentation

- [Full Integration Guide](https://stritti.github.io/vitepress-plugin-openspec/guide) – Complete setup and configuration
- [API Reference](https://stritti.github.io/vitepress-plugin-openspec/guide#api-reference) – Detailed API documentation
- [Troubleshooting](https://stritti.github.io/vitepress-plugin-openspec/guide#troubleshooting) – Common issues and solutions

---

## Development

```bash
bun install       # Install dependencies
bun run build     # Build the plugin
bun run dev       # Watch mode
bun test          # Run tests
bun run lint      # Type check
```

---

## License

MIT
