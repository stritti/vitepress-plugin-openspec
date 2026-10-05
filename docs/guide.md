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

### Recommended: `withOpenSpec()` (zero-config)

Wrap your VitePress config with `withOpenSpec()` — it handles page generation, the Vite plugin for live reload, the nav entry, and the sidebar section in one call:

```typescript
import { defineConfig } from 'vitepress'
import { withOpenSpec } from '@stritti/vitepress-plugin-openspec'

export default defineConfig(
  withOpenSpec({
    // your regular VitePress config
    themeConfig: {
      nav: [{ text: 'Home', link: '/' }],
      sidebar: {},
    },
  }),
)
```

**No paths required.** `specDir` and `srcDir` are auto-detected:

- `specDir`: the plugin walks up from the working directory until it finds an `openspec/` folder — the standard layout (`openspec/` at the repo root) needs no configuration.
- `srcDir`: the plugin detects the directory containing `.vitepress` (the working directory, a first-level subdirectory such as `docs/`, or the parent when the config is evaluated from inside `docs/.vitepress/`).

An array-based `sidebar` is automatically converted to the object form (`{ '/': [...] }`) so the openspec section can be injected without discarding existing entries.

### Advanced: manual setup

If you need full control over each integration point, wire up the lower-level APIs individually:

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
| `specDir` | `string` | auto-detected (`<nearest ancestor>/openspec`, fallback `'./openspec'`) | Path to your project's `openspec/` directory. Can be an absolute path or relative to the working directory — use `path.resolve(__dirname, '../../openspec')` when `config.ts` lives in `docs/.vitepress/`. |
| `outDir` | `string` | `'openspec'` | Output directory relative to VitePress `srcDir` |
| `srcDir` | `string` | auto-detected (directory containing `.vitepress`, fallback working directory) | Your VitePress source directory (`docs/`). |

> **Missing directory** — if `specDir` does not exist the plugin emits a `console.warn` and skips page generation, nav, and sidebar. No error is thrown and your VitePress build continues normally. This is intentional for projects that haven't set up an `openspec/` folder yet.

> **Invalid `outDir`** — an `outDir` that is absolute, empty, or resolves outside the VitePress `srcDir` throws an error at config evaluation time. Unlike a missing `specDir`, a misconfigured output path is never silently ignored.

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
