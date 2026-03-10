# Integration Guide

## Installation

The package is published to [GitHub Packages](https://github.com/stritti/vitepress-plugin-openspec/pkgs/npm/vitepress-plugin-openspec).

First, add an `.npmrc` file to your project root so that `@stritti`-scoped packages are resolved from GitHub Packages:

```
@stritti:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Replace `YOUR_GITHUB_TOKEN` with a [personal access token](https://github.com/settings/tokens) that has the `read:packages` scope.

Then install the plugin:

```bash
bun add @stritti/vitepress-plugin-openspec
# or: npm install @stritti/vitepress-plugin-openspec
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
