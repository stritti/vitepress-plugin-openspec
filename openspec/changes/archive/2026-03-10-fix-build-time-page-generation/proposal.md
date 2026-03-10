## Why

The plugin generates Markdown pages in the `configResolved` hook — but VitePress has already scanned `srcDir` for `.md` files and registered the routes at that point. The generated pages are written after the scan and therefore do not exist in VitePress' routing. Locally it only works because the files from the previous build are still on disk. In CI (GitHub Actions) there is no previous build, so the pages are not found and return 404.

The timing problem:
```
1. VitePress evaluates config.ts
2. VitePress scans srcDir for .md files → registers routes   ← pages missing
3. Vite initialises plugins
4. configResolved hook → plugin writes files                  ← too late
5. VitePress builds registered pages → /openspec/* → 404
```

## What Changes

- New exported function `generateOpenSpecPages(options)`: synchronous, writes all generated pages to disk — for calling at the top of `config.ts` before VitePress scans
- Extend `OpenSpecPluginOptions` with a `srcDir` field: specifies where the generated pages are written (VitePress srcDir, e.g. `docs/`)
- The Vite plugin function `openspec()` remains: uses `generateOpenSpecPages()` internally for the dev server (hot reload) — but also calls it synchronously on startup to make pages available
- Update demo site `docs/.vitepress/config.ts`: call `generateOpenSpecPages()` at the top of the file

## Capabilities

### New Capabilities

*(none — plugin-internal API extension)*

### Modified Capabilities

*(no spec-level changes)*

## Impact

- `src/plugin.ts` — extract and export `generateOpenSpecPages()`; `openspec()` calls it internally
- `src/types.ts` — add `OpenSpecPluginOptions.srcDir`
- `src/index.ts` — export `generateOpenSpecPages`
- `docs/.vitepress/config.ts` — call `generateOpenSpecPages()` at the top
- Plugin users: must call `generateOpenSpecPages()` in their `config.ts` (breaking change, document it)
