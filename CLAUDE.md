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

**vitepress-plugin-openspec** is a Vite plugin that reads OpenAPI/Swagger spec files and generates Markdown pages + sidebar config for VitePress sites.

### Key files

- `src/index.ts` — Entry point; re-exports `openspec` plugin and `generateSidebarFromSpec` helper
- `src/plugin.ts` — Core plugin using Vite's `configResolved` hook to parse specs and write generated Markdown files to disk before VitePress processes them
- `src/utils.ts` — File loading (JSON/YAML), endpoint extraction (OpenAPI 3.x + Swagger 2.x), slug generation, and Markdown generation
- `src/types.ts` — TypeScript interfaces: `OpenSpecPluginOptions`, `ParsedEndpoint`, `ParsedSpec`, `SidebarItem`

### Data flow

1. User configures plugin with spec file path(s) and output directory
2. On `configResolved`, the plugin calls `parseSpec()` → `extractEndpoints()` → `generateEndpointMarkdown()` per endpoint + `generateIndexMarkdown()`
3. Files are written to `<vitepress-srcDir>/<outDir>/`
4. `generateSidebarFromSpec()` is a synchronous variant for use directly in `defineConfig()` at evaluation time

### Build output

`tsup` produces dual ESM (`.js`) + CommonJS (`.cjs`) builds with TypeScript declarations (`.d.ts`) and source maps. `vite` and `vitepress` are declared external (peer dependencies).

### Test fixture

`src/__tests__/petstore.yaml` is the OpenAPI 3.0 fixture used by all tests.
