## Why

VitePress sites that document APIs need a way to render OpenAPI/Swagger specs as structured documentation pages with proper sidebar navigation. Currently, the plugin generates Markdown files and provides `generateSidebarFromSpec()`, but there is no cohesive integration that seamlessly wires spec-driven pages into the existing VitePress navigation as a first-class menu entry alongside hand-authored content.

## What Changes

- The plugin gains a **unified integration mode** that combines page generation and sidebar injection in a single configuration step
- A new `openspecNav()` helper returns a ready-to-use VitePress `nav` entry for the spec section
- Generated pages are structured to mirror OpenSpec hierarchy (tags → operations) rather than a flat list
- The sidebar config returned by `generateSidebarFromSpec()` is enriched with collapsible groups per tag
- Index pages are enhanced with summary tables (method, path, description) for quick orientation

## Capabilities

### New Capabilities

- `nav-integration`: Provides a `openspecNav()` helper that returns a VitePress `nav[]` entry pointing to the generated spec section, enabling one-line integration into the site's top navigation
- `tag-grouped-sidebar`: Groups sidebar items by OpenAPI tag, with each tag rendered as a collapsible sidebar group containing its operations

### Modified Capabilities

- `sidebar-generation`: Existing `generateSidebarFromSpec()` output structure changes to return tag-grouped `SidebarItem[]` instead of a flat list — consumers relying on the flat structure will need to update

## Impact

- `src/utils.ts` — `generateSidebarFromSpec()` return shape changes; `generateIndexMarkdown()` gains summary table
- `src/plugin.ts` — no breaking changes; benefits from improved sidebar output automatically
- `src/index.ts` — exports new `openspecNav()` helper
- `src/types.ts` — `SidebarItem` extended with `collapsed` field; new `NavItem` type added
- Consumers of `generateSidebarFromSpec()` must update sidebar config (breaking change in output shape)
