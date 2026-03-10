## Context

`vitepress-plugin-openspec` currently writes per-endpoint Markdown files to disk and exposes `generateSidebarFromSpec()` for sidebar config, but users must manually wire the nav entry and the sidebar groups themselves. Sidebar items are returned as a flat list; there is no grouping by OpenAPI tag and no nav helper. Users with multi-spec VitePress sites must write glue code to produce a usable navigation structure.

Current public API surface: `openspec()` (Vite plugin), `generateSidebarFromSpec()` (sync helper).

## Goals / Non-Goals

**Goals:**
- Add `openspecNav()` — a synchronous helper that returns a VitePress `nav[]` entry for the spec section so users can drop it directly into `themeConfig.nav`
- Restructure `generateSidebarFromSpec()` output to group items by OpenAPI tag using VitePress's collapsible sidebar group format (`{ text, collapsed, items }`)
- Enrich index page (`generateIndexMarkdown`) with an HTTP-method + path summary table
- Keep the plugin's zero-runtime philosophy: all computation happens at build time / config-eval time; no runtime JS is added to the site

**Non-Goals:**
- Custom Vue components / interactive API explorers (out of scope; this plugin targets plain Markdown output)
- Auto-injection of nav/sidebar without explicit user call (users keep full control of their VitePress config)
- Support for OpenAPI 3.1 features beyond what the existing `extractEndpoints()` already handles
- Backward-compatible flat sidebar output — the shape change is intentional and noted as breaking

## Decisions

**D1 — Tag-grouped sidebar shape**
Return `{ text: tagName, collapsed: false, items: SidebarItem[] }[]` from `generateSidebarFromSpec()` instead of a flat `SidebarItem[]`.
*Why*: VitePress natively renders collapsible groups from this shape. Flat items give no visual hierarchy for specs with many tags.
*Alternative considered*: Keep flat output and add a separate `generateGroupedSidebarFromSpec()`. Rejected — maintaining two functions with overlapping logic increases surface area; a single idiomatic output is cleaner. The breaking change is acceptable at this early stage.

**D2 — `openspecNav()` as a thin wrapper**
`openspecNav(options)` calls the same `loadSpec()` / `extractEndpoints()` pipeline already used by `generateSidebarFromSpec()` and returns `{ text: string, link: string }` (or with `items` for multi-spec). It does not introduce a new parse path.
*Why*: Re-using the existing sync pipeline avoids a second file-read at config evaluation time and keeps the helpers consistent.

**D3 — Summary table in index page**
`generateIndexMarkdown()` emits a Markdown table with columns `Method | Path | Summary` sorted by tag then path.
*Why*: Index pages currently contain only a heading and a list of links. A table gives users an at-a-glance overview of the API surface without clicking into individual pages. Markdown tables are universally rendered by VitePress.

**D4 — `collapsed: false` as default**
Sidebar groups default to `collapsed: false` (expanded). Consumers can override by post-processing the returned array.
*Why*: Spec sections are typically small enough that collapsed-by-default would hide content unnecessarily. The `collapsed` field is added to `SidebarItem` type to allow consumer overrides.

## Risks / Trade-offs

**[Breaking change in `generateSidebarFromSpec()` output]** → Document clearly in changelog; bump minor version. Consumers that spread the flat array into an existing sidebar config will see a type error at build time (caught statically).

**[Double file read at config time]** If users call both `generateSidebarFromSpec()` and `openspecNav()` in `defineConfig()`, the spec file is parsed twice synchronously. → Both helpers are fast (YAML/JSON parse + iterate), so the overhead is negligible for typical spec sizes (<5 ms). A shared cache could be added later if profiling shows it matters.

**[Tag ordering]** OpenAPI tags are unordered in the spec object; iteration order depends on JSON key order. → Tags are sorted alphabetically in the sidebar groups. Users who need custom ordering can post-process the returned array.

## Migration Plan

1. Bump package to next minor version (breaking change in `generateSidebarFromSpec()`)
2. Update generated `SidebarItem[]` consuming code in tests and README examples
3. No data migration needed — generated Markdown files on disk are unchanged
4. Rollback: pin to previous version in `package.json`

## Open Questions

- Should `openspecNav()` support a `text` override option so users can rename the nav label without editing plugin config? (Low priority; can be added later)
- Should collapsed state be configurable via plugin options rather than post-processing? (Deferred — keep API minimal for now)
