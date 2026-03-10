# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run lint      # TypeScript type checking (tsc --noEmit)
npm test          # Run tests once (vitest run)
npm run test:watch # Run tests in watch mode
npm run build     # Build ESM + CJS output with tsup
npm run dev       # Watch mode build
```

To run a single test file:
```bash
npx vitest run src/__tests__/utils.test.ts
```

## Architecture

**vitepress-plugin-openspec** is a VitePress plugin that reads an `openspec/` directory and generates Markdown pages + sidebar/nav config for VitePress sites. It visualizes the [OpenSpec](https://openspec.dev/) workflow — capability specs, active changes, and archived changes — as a navigable documentation section.

### Key files

- `src/index.ts` — Entry point; re-exports `openspec` plugin, `generateOpenSpecPages`, `generateOpenSpecSidebar`, and `openspecNav`
- `src/plugin.ts` — `generateOpenSpecPages()` (synchronous, call before `defineConfig()`) and `openspec()` Vite plugin (reruns on `configResolved`)
- `src/utils.ts` — `readOpenSpecFolder()`, page generators (`generateSpecPage`, `generateSpecsIndexPage`, `generateChangeIndexPage`, `generateChangesIndexPage`), sidebar/nav helpers, and spec content transformations (`extractSpecDescription`, `stripDeltaMarkers`, `transformScenarios`)
- `src/types.ts` — TypeScript interfaces: `OpenSpecPluginOptions`, `CapabilitySpec`, `Change`, `ChangeArtifact`, `OpenSpecFolder`, `SidebarItem`, `NavItem`

### Data flow

1. User calls `generateOpenSpecPages({ specDir, outDir, srcDir })` at the top of `config.ts` before `defineConfig()`
2. `readOpenSpecFolder()` scans `openspec/specs/`, `openspec/changes/`, and `openspec/changes/archive/`
3. For each spec: `generateSpecPage()` applies `extractSpecDescription` → `stripDeltaMarkers` → `transformScenarios` and writes `<outDir>/specs/<name>/index.md`
4. For each change: index page + artifact files are written to `<outDir>/changes/<name>/`
5. `generateOpenSpecSidebar()` and `openspecNav()` are synchronous helpers for `defineConfig()` sidebar/nav config

**Important:** `generateOpenSpecPages()` must be called synchronously before `defineConfig()` because VitePress scans `srcDir` for `.md` files before any Vite plugin hooks run.

### Build output

`tsup` produces dual ESM (`.js`) + CommonJS (`.cjs`) builds with TypeScript declarations (`.d.ts`) and source maps. `vite` and `vitepress` are declared external (peer dependencies).

### Test fixtures

`src/__tests__/fixture/openspec/` is the OpenSpec directory fixture used by all tests. It contains sample specs (`auth-flow`, `data-export`, `rest-api`), active changes (`add-login`, `fix-bug`, `oauth2-flow`), and archived changes.
