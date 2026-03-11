# Integration Guide

## Installation

Install the plugin from npm:

```bash
npm install @stritti/vitepress-plugin-openspec
# or with bun:
bun add @stritti/vitepress-plugin-openspec
```

---

## Prerequisites

Your project needs an `openspec/` folder with the standard structure:

```
openspec/
├── specs/
│   └── <capability>/
│       └── spec.md
└── changes/
    ├── <change-name>/
    │   ├── .openspec.yaml
    │   ├── proposal.md
    │   └── tasks.md
    └── archive/
        └── YYYY-MM-DD-<change-name>/
```

See [openspec.dev](https://openspec.dev/) for how to create and manage this structure.

---

## Configuration

Add the following to your `docs/.vitepress/config.ts`:

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
const specDir = path.resolve(__dirname, '../openspec') // path to your openspec/ folder

// Must be called before defineConfig so pages exist when VitePress scans for routes.
// Required for first builds and CI environments (GitHub Actions etc.).
generateOpenSpecPages({
  specDir,
  outDir: 'openspec',                    // output directory inside your docs/ folder
  srcDir: path.resolve(__dirname, '..'), // your docs/ directory
})

export default defineConfig({
  vite: {
    plugins: [
      // Keeps pages in sync during `vitepress dev` (hot reload)
      openspec({ specDir, outDir: 'openspec' }),
    ],
  },
  themeConfig: {
    nav: [
      openspecNav(specDir, { outDir: 'openspec', text: 'Docs' }),
    ],
    sidebar: {
      '/openspec/': generateOpenSpecSidebar(specDir, { outDir: 'openspec' }),
    },
  },
})
```

---

## Options

All APIs accept the same options object:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `specDir` | `string` | `'./openspec'` | Path to your project's `openspec/` directory |
| `outDir` | `string` | `'openspec'` | Output directory relative to VitePress `srcDir` |
| `srcDir` | `string` | `process.cwd()` | Your VitePress source directory (`docs/`). Required for `generateOpenSpecPages`. |

---

## .gitignore

The plugin writes generated Markdown files to `docs/<outDir>/` at build time. Add this folder to `.gitignore` — it should not be committed:

```
docs/openspec/
```

---

## How It Works

The plugin reads your `openspec/` source folder and generates ready-to-serve Markdown pages under `docs/<outDir>/`:

```
openspec/                     ← your source (committed)
├── specs/
│   └── my-feature/
│       └── spec.md
└── changes/
    ├── add-auth/
    │   ├── .openspec.yaml
    │   ├── proposal.md
    │   └── tasks.md
    └── archive/
        └── 2024-01-15-old-change/

docs/openspec/                ← generated (add to .gitignore)
├── index.md                  ← overview page
├── specs/
│   ├── index.md              ← specifications index
│   └── my-feature/
│       └── index.md          ← mirrors spec.md with VitePress frontmatter
└── changes/
    ├── index.md              ← changes index
    ├── add-auth/
    │   ├── index.md          ← change overview from .openspec.yaml
    │   ├── proposal.md
    │   └── tasks.md
    └── archive/
        └── 2024-01-15-old-change/
            └── index.md
```

### Two-phase generation

VitePress scans `srcDir` for `.md` files **before** any Vite plugin hooks run. This means a standard Vite plugin that generates files in `configResolved` would be too late — pages wouldn't be in the routing table on first build or in CI.

The plugin solves this with two complementary mechanisms:

1. **`generateOpenSpecPages()`** — called synchronously at the top of `config.ts`, before `defineConfig()`. This ensures all pages exist when VitePress scans for routes.
2. **`openspec()` Vite plugin** — calls `generateOpenSpecPages()` again on every config reload during `vitepress dev`, keeping pages in sync with your source files.

---

## API Reference

### `generateOpenSpecPages(options)`

Synchronously generates all VitePress Markdown pages from your `openspec/` folder.

**Call this at the top of `config.ts`**, before `defineConfig()`. This ensures the files exist when VitePress scans `srcDir` for routes — which is critical for first builds and CI.

### `openspec(options)`

Vite plugin for use inside `defineConfig({ vite: { plugins: [...] } })`. Re-generates pages on every config reload, which provides hot-reload support during `vitepress dev`.

### `openspecNav(specDir, options?)`

Returns a VitePress nav item pointing to `/<outDir>/`:

```typescript
openspecNav(specDir, { outDir: 'openspec', text: 'Docs' })
// → { text: 'Docs', link: '/openspec/' }
```

### `generateOpenSpecSidebar(specDir, options?)`

Returns a VitePress sidebar configuration with three groups:

- **Specifications** — one item per capability spec
- **Changes** — one item per active change, with artifact links
- **Archiv** — archived changes (collapsed by default)
