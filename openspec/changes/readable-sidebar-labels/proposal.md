## Why

Capability spec names and change names are stored as kebab-case directory names (e.g., `nav-integration`, `change-pages`, `readable-sidebar-labels`). The plugin currently renders these raw names verbatim as sidebar labels and page headings, making the documentation look machine-generated and hard to read.

## What Changes

- Add a `humanizeLabel()` utility that converts kebab-case strings to Title Case (e.g., `nav-integration` → `Nav Integration`)
- Apply this transformation everywhere a name is used as a human-visible label:
  - Sidebar `text` for spec items and change items
  - `# Heading` on generated spec pages (`generateSpecPage`)
  - `# Heading` on generated change index pages (`generateChangeIndexPage`)
  - Link text in the specs index page (`generateSpecsIndexPage`)
  - Link text in the changes index page (`generateChangesIndexPage`)

## Capabilities

### New Capabilities

- `label-humanization`: Utility function that converts kebab-case identifiers to human-readable Title Case labels for display in VitePress sidebar and page headings.

### Modified Capabilities

- `sidebar-generation`: Sidebar `text` fields for spec and change items now use humanized labels instead of raw kebab-case names.
- `spec-pages`: Generated spec page `# Heading` uses humanized label.
- `change-pages`: Generated change index page `# Heading` uses humanized label.

## Impact

- `src/utils.ts` — add `humanizeLabel()`, apply it in all page generators and sidebar builders
- Pure cosmetic change; no structural or behavioral changes to generated pages
- No breaking changes to the public API
