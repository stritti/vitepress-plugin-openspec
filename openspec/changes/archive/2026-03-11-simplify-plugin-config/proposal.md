## Why

Setting up `vitepress-plugin-openspec` currently requires boilerplate that is error-prone: users must manually call `generateOpenSpecPages()` before `defineConfig()`, resolve `__dirname` for ESM modules, and repeat the same `specDir`/`outDir` options across three separate API calls. A single higher-level helper can eliminate all of this.

## What Changes

- Introduce a `withOpenSpec(vitepressConfig, options?)` wrapper function that handles the full integration in one call
- The wrapper calls `generateOpenSpecPages()` synchronously before returning the config
- It auto-merges the Vite plugin, nav entry, and sidebar section into the provided config
- `specDir` and `srcDir` are resolved automatically relative to `process.cwd()` when not specified
- Existing lower-level APIs (`generateOpenSpecPages`, `openspec`, `generateOpenSpecSidebar`, `openspecNav`) remain unchanged and fully supported — no breaking changes

## Capabilities

### New Capabilities
- `simplified-config-api`: A `withOpenSpec()` helper that wraps a VitePress `UserConfig` object, wires up all openspec integration (page generation, Vite plugin, sidebar, nav) in a single call, and returns the fully merged config.

### Modified Capabilities
<!-- No existing capability requirements change — this is purely additive -->

## Impact

- `src/index.ts`: export new `withOpenSpec` function
- `src/plugin.ts`: add `withOpenSpec` implementation
- `src/types.ts`: add `WithOpenSpecOptions` type (extends `OpenSpecPluginOptions` with nav/sidebar merge options)
- README.md: update usage example to show the simplified API alongside the existing verbose API
