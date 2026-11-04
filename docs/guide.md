# Integration Guide

This guide covers everything you need to integrate OpenSpec documentation into your VitePress site, from basic setup to advanced configuration.

---

## What is OpenSpec?

[OpenSpec](https://openspec.dev/) is an open specification format for documenting software projects. It provides a structured way to organize your documentation into:

- **Specifications (Specs)** – Define your system's capabilities in `openspec/specs/<capability>/spec.md`
- **Changes** – Track proposed modifications with artifacts (proposal, design, tasks) in `openspec/changes/<name>/`
- **Archive** – Store completed changes in `openspec/changes/archive/YYYY-MM-DD-<name>/`

Each change folder contains:
- `.openspec.yaml` – Metadata (name, status, type, priority)
- `proposal.md` – The proposed change
- `design.md` – Technical design (optional)
- `tasks.md` – Implementation tasks (optional)

This plugin transforms your OpenSpec folder into a fully navigable documentation section in VitePress.

---

## Installation

Install the plugin from npm:

```bash
npm install @stritti/vitepress-plugin-openspec
# or with bun:
bun add @stritti/vitepress-plugin-openspec
# or with yarn:
yarn add @stritti/vitepress-plugin-openspec
```

---

## Prerequisites

Your project needs an `openspec/` folder with the standard structure:

```
.
├── openspec/
│   ├── specs/
│   │   └── <capability>/
│   │       └── spec.md
│   └── changes/
│       ├── <change-name>/
│       │   ├── .openspec.yaml
│       │   ├── proposal.md
│       │   ├── design.md
│       │   └── tasks.md
│       └── archive/
│           └── YYYY-MM-DD-<change-name>/
│               ├── .openspec.yaml
│               ├── proposal.md
│               └── tasks.md
└── docs/
    └── .vitepress/
        └── config.ts
```

For details on creating and managing OpenSpec structures, see the [OpenSpec documentation](https://openspec.dev/).

---

## Quick Setup

The easiest way to integrate OpenSpec is using the `withOpenSpec()` wrapper:

```typescript
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress'
import { withOpenSpec } from '@stritti/vitepress-plugin-openspec'

export default defineConfig(
  withOpenSpec({
    // Your regular VitePress config
    title: 'My Project',
    themeConfig: {
      nav: [{ text: 'Home', link: '/' }],
      sidebar: {},
    },
  })
)
```

### Zero-Config

No paths required! The plugin automatically detects:

- **`specDir`** – Walks up from the working directory until it finds an `openspec/` folder. The standard layout (`openspec/` at repo root) needs no configuration.
- **`srcDir`** – Detects the directory containing `.vitepress/` (working directory, `docs/` subdirectory, or parent when config is in `docs/.vitepress/`).

### Example with Custom Paths

If your `config.ts` lives in `docs/.vitepress/` and `openspec/` is at repo root:

```typescript
import { defineConfig } from 'vitepress'
import { withOpenSpec } from '@stritti/vitepress-plugin-openspec'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(
  withOpenSpec(
    {
      title: 'My Project',
    },
    {
      specDir: path.resolve(__dirname, '../../openspec'),
      outDir: 'openspec',
      srcDir: path.resolve(__dirname, '..'),
    }
  )
)
```

---

## Configuration Options

All APIs accept the same options object:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `specDir` | `string` | auto-detected | Path to your `openspec/` directory. Can be absolute or relative to working directory. Auto-detects nearest ancestor folder containing `openspec/`, falls back to `./openspec` |
| `outDir` | `string` | `'openspec'` | Output directory relative to VitePress `srcDir`. Generated pages will be at `docs/<outDir>/` |
| `srcDir` | `string` | auto-detected | VitePress source directory (the folder containing `.vitepress/`). Falls back to working directory |
| `nav` | `boolean` | `true` | Whether to prepend an OpenSpec entry to `themeConfig.nav` |
| `sidebar` | `boolean` | `true` | Whether to inject the OpenSpec sidebar section into `themeConfig.sidebar` |
| `navText` | `string` | `'Docs'` | Label for the nav entry injected into `themeConfig.nav` |

### Behavior Notes

> **Missing `specDir`:** If the specified `specDir` does not exist, the plugin emits a `console.warn` and skips page generation, nav, and sidebar. Your VitePress build continues normally. This is intentional for projects that haven't set up an `openspec/` folder yet.

> **Invalid `outDir`:** An `outDir` that is absolute, empty, or resolves outside the VitePress `srcDir` throws an error at config evaluation time. Unlike a missing `specDir`, a misconfigured output path is never silently ignored.

> **Array Sidebars:** If your `themeConfig.sidebar` is an array (single sidebar), it's automatically converted to the object form `{ '/': [...] }` so the OpenSpec section can be injected without discarding your existing entries.

---

## Output Structure

The plugin reads your `openspec/` source folder and generates pages in your VitePress `srcDir`:

```
openspec/                     ← Your source (committed to git)
├── specs/
│   └── auth/
│       └── spec.md
└── changes/
    ├── add-login/
    │   ├── .openspec.yaml
    │   ├── proposal.md
    │   └── tasks.md
    └── archive/
        └── 2024-01-15-old-feature/
            ├── .openspec.yaml
            └── proposal.md

docs/openspec/                ← Generated by plugin (add to .gitignore)
├── index.md                  ← OpenSpec overview page
├── specs/
│   ├── index.md              ← Specifications index
│   └── auth/
│       └── index.md          ← Mirrors spec.md with VitePress frontmatter
└── changes/
    ├── index.md              ← Changes index
    ├── add-login/
    │   ├── index.md          ← Change overview from .openspec.yaml
    │   ├── proposal.md
    │   └── tasks.md
    └── archive/
        └── 2024-01-15-old-feature/
            ├── index.md
            ├── proposal.md
            └── tasks.md
```

### Example Generated Pages

**`docs/openspec/index.md`** (Overview):
```markdown
---
title: OpenSpec
---,

# OpenSpec Documentation

## Specifications

- [Authentication](/openspec/specs/auth/)

## Changes

- [Add Login](/openspec/changes/add-login/)

## Archive

- [2024-01-15 Old Feature](/openspec/changes/archive/2024-01-15-old-feature/)
```

**`docs/openspec/specs/auth/index.md`** (Spec Page):
```markdown
---
title: Authentication
description: Handles user login and session management
---

# Authentication

## Description

Handles user login and session management for the application.

## Scenarios

- User can login with email/password
- User can logout
- Session expires after 24 hours
```

### .gitignore

The plugin automatically writes a `.gitignore` file in the output directory:

```
# Generated by vitepress-plugin-openspec
auth/
add-login/
index.md
specs/
changes/
archive/
```

**Add to your project's `.gitignore`:**
```
docs/openspec/
```

---

## Manual Setup

For full control over each integration point, wire up the lower-level APIs individually:

### 1. Generate Pages

Call `generateOpenSpecPages()` **before** `defineConfig()` to ensure pages exist when VitePress scans for routes:

```typescript
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateOpenSpecPages } from '@stritti/vitepress-plugin-openspec'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const specDir = path.resolve(__dirname, '../openspec')

// Critical: Must be called before defineConfig()
generateOpenSpecPages({
  specDir,
  outDir: 'openspec',
  srcDir: path.resolve(__dirname, '..'),
})
```

### 2. Add Vite Plugin for Live Reload

```typescript
import { defineConfig } from 'vitepress'
import openspec from '@stritti/vitepress-plugin-openspec'

export default defineConfig({
  vite: {
    plugins: [
      openspec({ specDir, outDir: 'openspec' }),
    ],
  },
})
```

### 3. Configure Nav and Sidebar

```typescript
import { openspecNav, generateOpenSpecSidebar } from '@stritti/vitepress-plugin-openspec'

export default defineConfig({
  themeConfig: {
    nav: [
      openspecNav(specDir, { outDir: 'openspec', text: 'Docs' }),
      // Your other nav items...
    ],
    sidebar: {
      '/openspec/': generateOpenSpecSidebar(specDir, { outDir: 'openspec' }),
      // Your other sidebar configs...
    },
  },
})
```

### Complete Manual Setup Example

```typescript
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import openspec, {
  generateOpenSpecPages,
  generateOpenSpecSidebar,
  openspecNav,
} from '@stritti/vitepress-plugin-openspec'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const specDir = path.resolve(__dirname, '../openspec')

// Must be called before defineConfig so pages exist when VitePress scans for routes
generateOpenSpecPages({
  specDir,
  outDir: 'openspec',
  srcDir: path.resolve(__dirname, '..'),
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
      { text: 'Home', link: '/' },
      openspecNav(specDir, { outDir: 'openspec', text: 'Docs' }),
    ],
    sidebar: {
      '/': [
        // Your existing sidebar items
      ],
      '/openspec/': generateOpenSpecSidebar(specDir, { outDir: 'openspec' }),
    },
  },
})
```

---

## How It Works

### The Challenge

VitePress scans `srcDir` for `.md` files **before** any Vite plugin hooks run. This means a standard Vite plugin that generates files in the `configResolved` hook would be too late – pages wouldn't be in the routing table on first build or in CI environments.

### The Solution

This plugin uses two complementary mechanisms:

1. **Synchronous Page Generation** – `generateOpenSpecPages()` runs before `defineConfig()` so all pages exist when VitePress scans for routes. This is critical for:
   - First builds
   - CI environments (GitHub Actions, etc.)
   - Any situation where files don't already exist

2. **Vite Plugin for Live Reload** – The `openspec()` Vite plugin calls `generateOpenSpecPages()` again on every config reload during `vitepress dev`, keeping pages in sync with your source files.

### Data Flow

1. User calls `generateOpenSpecPages({ specDir, outDir, srcDir })` at the top of `config.ts`
2. `readOpenSpecFolder()` scans `openspec/specs/`, `openspec/changes/`, and `openspec/changes/archive/`
3. For each spec: `generateSpecPage()` processes the content and writes `<outDir>/specs/<name>/index.md`
4. For each change: index page + artifact files are written to `<outDir>/changes/<name>/`
5. `generateOpenSpecSidebar()` and `openspecNav()` generate the navigation structures

---

## API Reference

### Functions

#### `withOpenSpec(config, options?)`

Wrapper for VitePress config that automatically integrates OpenSpec. Handles page generation, Vite plugin for live reload, nav entry, and sidebar section.

**Parameters:**
- `config` – Your VitePress config object
- `options` – Optional OpenSpec plugin options

**Returns:** Modified VitePress config

**Example:**
```typescript
import { defineConfig } from 'vitepress'
import { withOpenSpec } from '@stritti/vitepress-plugin-openspec'

export default defineConfig(
  withOpenSpec({
    title: 'My Project',
  }, {
    specDir: '../openspec',
    outDir: 'docs',
  })
)
```

#### `generateOpenSpecPages(options)`

Synchronously generates all VitePress Markdown pages from your `openspec/` folder.

**Must be called before `defineConfig()`** to ensure files exist when VitePress scans for routes.

**Parameters:**
- `options.specDir` – Path to openspec folder
- `options.outDir` – Output directory (default: 'openspec')
- `options.srcDir` – VitePress source directory

**Example:**
```typescript
import { generateOpenSpecPages } from '@stritti/vitepress-plugin-openspec'

generateOpenSpecPages({
  specDir: './openspec',
  outDir: 'openspec',
  srcDir: './docs',
})
```

#### `openspec(options)`

Vite plugin for use inside `defineConfig({ vite: { plugins: [...] } })`. Re-generates pages on every config reload, providing hot-reload support during `vitepress dev`.

**Parameters:**
- `options.specDir` – Path to openspec folder
- `options.outDir` – Output directory

**Example:**
```typescript
import openspec from '@stritti/vitepress-plugin-openspec'

export default defineConfig({
  vite: {
    plugins: [openspec({ specDir: './openspec', outDir: 'openspec' })],
  },
})
```

#### `openspecNav(specDir, options?)`

Generates a VitePress nav item pointing to the OpenSpec documentation.

**Parameters:**
- `specDir` – Path to openspec folder
- `options.outDir` – Output directory (default: 'openspec')
- `options.text` – Nav entry label (default: 'Docs')

**Returns:** Nav item object `{ text: string, link: string }`

**Example:**
```typescript
import { openspecNav } from '@stritti/vitepress-plugin-openspec'

openspecNav('./openspec', { outDir: 'openspec', text: 'Docs' })
// => { text: 'Docs', link: '/openspec/' }
```

#### `generateOpenSpecSidebar(specDir, options?)`

Generates a VitePress sidebar configuration with three groups:

- **Specifications** – One item per capability spec
- **Changes** – One item per active change, with artifact links
- **Archive** – Archived changes (collapsed by default)

**Parameters:**
- `specDir` – Path to openspec folder
- `options.outDir` – Output directory (default: 'openspec')

**Returns:** Sidebar configuration array

**Example:**
```typescript
import { generateOpenSpecSidebar } from '@stritti/vitepress-plugin-openspec'

export default defineConfig({
  themeConfig: {
    sidebar: {
      '/openspec/': generateOpenSpecSidebar('./openspec', { outDir: 'openspec' }),
    },
  },
})
```

---

## Troubleshooting

### Pages not appearing

**Problem:** OpenSpec pages don't show up in your VitePress site.

**Solutions:**
1. Ensure `openspec/` folder exists in the correct location
2. Verify `withOpenSpec()` or `generateOpenSpecPages()` is called **before** `defineConfig()`
3. Check that `specDir` points to the correct location
4. Run `vitepress build` to regenerate pages
5. Verify your `outDir` is relative to `srcDir`

### Missing sidebar entries

**Problem:** OpenSpec section doesn't appear in sidebar.

**Solutions:**
1. Ensure `sidebar: true` in options (default)
2. Verify your sidebar config is compatible (array-based sidebars are auto-converted)
3. Check that `generateOpenSpecPages()` was called before `defineConfig()`

### Invalid outDir error

**Problem:** Error about outDir being absolute or outside srcDir.

**Solution:** Use a relative path like `'openspec'` or `'docs/openspec'`. The path must be relative to your VitePress `srcDir` and cannot resolve outside of it.

### Changes not updating during dev

**Problem:** Edits to OpenSpec files don't appear during `vitepress dev`.

**Solutions:**
1. Ensure the `openspec()` Vite plugin is in your `vite.plugins` array
2. Verify `specDir` points to the correct location
3. Try restarting the dev server

### Generated files in git

**Problem:** Generated OpenSpec pages are being committed to git.

**Solution:** Add the output directory to your `.gitignore`:
```
docs/openspec/
```

The plugin automatically writes a `.gitignore` in the output directory, but you should also add it to your project's root `.gitignore`.

---

## See Also

- [API Reference](#api-reference) – Detailed type definitions and function signatures
- [OpenSpec Documentation](https://openspec.dev/) – Learn about OpenSpec format
- [VitePress Documentation](https://vitepress.dev/) – Learn about VitePress configuration
