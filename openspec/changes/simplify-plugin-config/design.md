## Context

The current plugin integration requires users to wire up four distinct API calls with shared options, handle ESM `__dirname` resolution manually, and ensure correct call ordering (page generation before `defineConfig`). This produces ~20 lines of boilerplate that is easy to get wrong and intimidating for new users.

The core constraint is that `generateOpenSpecPages()` **must run synchronously** before VitePress scans `srcDir` for Markdown routes — no Vite plugin hook fires early enough. Any simplified API must preserve this invariant.

## Goals / Non-Goals

**Goals:**
- Single `withOpenSpec(vitepressConfig, options?)` call replaces all manual wiring
- Auto-detect `specDir` and `srcDir` without requiring `__dirname` manipulation
- Merge openspec Vite plugin, nav entry, and sidebar section automatically
- Remain fully additive — all existing lower-level APIs continue to work unchanged

**Non-Goals:**
- Changing how page generation works internally
- Providing async variants (constraint: must stay synchronous)
- Auto-detecting the correct `specDir` by walking up the directory tree (fragile)
- Supporting per-call options overrides beyond the top-level `withOpenSpec` options

## Decisions

### 1. Function signature: wraps UserConfig, returns UserConfig

```typescript
function withOpenSpec(config: UserConfig, options?: WithOpenSpecOptions): UserConfig
```

`config` is the plain VitePress config object (same as what `defineConfig` accepts).
`withOpenSpec` is called in place of — or wrapping — `defineConfig`:

```typescript
// Option A: replace defineConfig
export default withOpenSpec({ ... }, { specDir: '../openspec' })

// Option B: wrap defineConfig output (also valid)
export default defineConfig(withOpenSpec({ ... }))
```

**Rationale**: Accepting the raw config object (not a wrapped `defineConfig` call) is simpler and avoids wrapping a wrapper. Both usage patterns work since `defineConfig` is an identity function.

### 2. srcDir auto-detection uses process.cwd()

When `srcDir` is not provided, fall back to `process.cwd()`. This matches the existing default in `generateOpenSpecPages`. Users who place `config.ts` inside `docs/.vitepress/` and have `openspec/` at the repo root will need to pass `srcDir` explicitly — but this was already true. No regression.

**Alternative considered**: Parse `import.meta.url` from the caller stack frame. Rejected as fragile and non-standard.

### 3. Nav merge: prepend to themeConfig.nav array

`openspecNav()` returns a single `NavItem`. `withOpenSpec` prepends it to `config.themeConfig.nav` if the array exists, or creates it. Can be opted out with `nav: false` in options.

**Alternative considered**: Append instead of prepend. Rejected because the openspec section is often a primary nav item and users expect it first. Users who want it elsewhere should use the lower-level API.

### 4. Sidebar merge: inject under the outDir key

`generateOpenSpecSidebar()` returns `SidebarItem[]`. `withOpenSpec` sets `config.themeConfig.sidebar[`/${outDir}/`]` if sidebar is an object (VitePress multi-sidebar format). Can be opted out with `sidebar: false` in options.

### 5. Type: import UserConfig from vitepress (peer dep)

`vitepress` is already a declared peer dependency. Importing its types is acceptable. Use `UserConfig` from `'vitepress'` for the config parameter type — this gives full type safety without duplicating the interface.

### 6. WithOpenSpecOptions: extends OpenSpecPluginOptions

```typescript
interface WithOpenSpecOptions extends OpenSpecPluginOptions {
  nav?: boolean    // default: true — whether to inject nav entry
  sidebar?: boolean // default: true — whether to inject sidebar section
}
```

## Risks / Trade-offs

- **Sidebar collision**: If the user already defines `sidebar['/openspec/']`, `withOpenSpec` will overwrite it. → Mitigation: only set the key if not already defined; log a warning if overwriting.
- **Tight coupling to themeConfig shape**: VitePress's `DefaultTheme` sidebar/nav types are not guaranteed stable across major versions. → Mitigation: use defensive type casting; this risk already exists in the nav/sidebar helpers.
- **`defineConfig` not called**: If user uses `withOpenSpec` without `defineConfig`, they lose VitePress's type narrowing. → Non-issue: `defineConfig` is an identity function in VitePress; wrapping with it is optional and documented as such.

## Migration Plan

No migration required — purely additive. Existing users can adopt `withOpenSpec` at their own pace. README updated to show the new API as primary, with existing API documented as "advanced / manual" alternative.
