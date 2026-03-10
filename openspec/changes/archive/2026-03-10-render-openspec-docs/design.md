## Context

The plugin was previously implemented incorrectly as an OpenAPI renderer. Its actual purpose is rendering **OpenSpec project artifacts** from a project's `openspec/` folder. OpenSpec folders have a fixed structure:

```
openspec/
  config.yaml                        ← project metadata
  specs/
    <capability>/spec.md             ← canonical specs
  changes/
    <name>/.openspec.yaml            ← change metadata
    <name>/proposal.md
    <name>/design.md
    <name>/tasks.md
    <name>/specs/<cap>/spec.md       ← delta specs
    archive/<date>-<name>/...        ← archived changes
```

Since OpenSpec artifacts are already Markdown, the core task of the plugin is: scan folder → copy pages into the VitePress `srcDir` → return sidebar/nav configuration.

## Goals / Non-Goals

**Goals:**
- `openspecPlugin()` as a Vite plugin reads the `openspec/` folder and writes all artifact Markdown files into the VitePress `srcDir` (with adjusted paths)
- Generates index pages for the specs and changes sections
- `generateOpenSpecSidebar()` returns a structured VitePress sidebar (specs group + changes group + archive group)
- `openspecNav()` returns a VitePress nav entry

**Non-Goals:**
- Content transformation of Markdown files (no conversion of OpenSpec syntax into Vue components)
- Support for other spec formats (OpenAPI, Swagger, AsyncAPI)
- Live reloading on changes in the `openspec/` folder (can be added later)

## Decisions

**D1 — Copy Markdown files directly, do not transform**
The OpenSpec Markdown files are copied unchanged into the VitePress `srcDir`. VitePress renders them as normal Markdown pages.
*Why*: Simplest implementation; no custom syntax parsers needed. OpenSpec Markdown is already readable.
*Alternative*: Enrich Markdown with custom badges, callouts, and VitePress components. Deferred to a later iteration.

**D2 — Folder structure in the VitePress `srcDir` mirrors the `openspec/` structure**
```
<outDir>/specs/<capability>/index.md   ← copied from openspec/specs/<cap>/spec.md
<outDir>/changes/<name>/proposal.md    ← copied
<outDir>/changes/<name>/design.md      ← copied
<outDir>/changes/<name>/tasks.md       ← copied
<outDir>/changes/archive/<name>/...    ← copied
<outDir>/index.md                      ← generated (overview page)
<outDir>/specs/index.md                ← generated
<outDir>/changes/index.md              ← generated
```
*Why*: Predictable, intuitive URL structure.

**D3 — `generateOpenSpecSidebar()` is synchronous and reads the file system**
Same as `generateSidebarFromSpec()` previously: synchronous function that reads directly from the file system, suitable for `defineConfig()`.
*Why*: VitePress evaluates the config before the Vite plugin hooks run.

**D4 — `.openspec.yaml` is read for change metadata**
`created` and `status` fields are used for index pages and sidebar sorting.
*Why*: Gives users meaningful additional information (date, status) without manual maintenance.

**D5 — Archived changes as a collapsed sidebar group**
Archived changes (`changes/archive/`) are presented as a separate `collapsed: true` group.
*Why*: Keeps the sidebar clean; older changes are accessible but not prominent.

## Risks / Trade-offs

**[VitePress build timing]** VitePress scans pages before `configResolved` → files must already exist or the plugin must use an earlier hook. → Same approach as before: files are written in `configResolved`. On the first build the files must already be present on disk (which is always the case for existing projects).

**[Delta specs in changes vs. canonical specs]** Delta specs in `changes/<name>/specs/` have different semantics from canonical specs. → For now, only canonical specs from `openspec/specs/` and the top-level artifacts (proposal, design, tasks) of changes are rendered. Delta specs within changes are not rendered separately (they are part of the change context).

**[Breaking change to the public API]** `generateSidebarFromSpec` and the OpenAPI types are removed. → Version bump to 0.2.0; migration documented in CHANGELOG.

## Migration Plan

1. Replace `src/types.ts`, `src/utils.ts`, `src/plugin.ts` completely
2. Update `src/index.ts` exports
3. Replace tests (new fixture: miniaturised `openspec/` folder)
4. Update `docs/.vitepress/config.ts` to the new API
5. Bump version to 0.2.0

## Open Questions

- Should delta specs (within changes) also be rendered in a later iteration?
- Should `openspecPlugin()` optionally support file watching for hot reload in dev mode?
