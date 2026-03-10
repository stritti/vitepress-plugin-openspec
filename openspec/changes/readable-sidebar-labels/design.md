## Context

Names of capability specs and changes are kebab-case directory names on disk (e.g., `nav-integration`, `readable-sidebar-labels`). These names surface verbatim in sidebar `text` fields and page `# Headings`. A single pure-utility function can fix all occurrences.

## Goals / Non-Goals

**Goals:**
- Add `humanizeLabel(s: string): string` to `src/utils.ts`
- Apply it consistently at every display site in the same file

**Non-Goals:**
- Custom label overrides via plugin options or frontmatter (out of scope)
- Changing URL paths or filesystem names (these stay kebab-case)
- Internationalisation / locale-aware casing

## Decisions

**Algorithm: split on `-`, capitalize each word, join with space**

```
nav-integration   → Nav Integration
change-pages      → Change Pages
openspec-folder-reader → Openspec Folder Reader
```

Simple and deterministic. Avoids pulling in a third-party library for a one-liner transformation.

Alternative considered: regex `s.replace(/-./g, m => ' ' + m[1].toUpperCase()).replace(/^./, m => m.toUpperCase())` — equivalent but slightly less readable than the split/map/join form.

**Placement: module-private function, called at every display site**

All call sites are already in `src/utils.ts`, so no export needed. Applied in:
- `generateSpecPage` — spec page `# Heading`
- `generateChangeIndexPage` — change index `# Heading`
- `generateSpecsIndexPage` — spec link text in index
- `generateChangesIndexPage` — change link text in index
- `generateOpenSpecSidebar` — sidebar `text` for spec and change items

## Risks / Trade-offs

- Multi-word acronyms (e.g., `api-rate-limit`) become `Api Rate Limit` not `API Rate Limit` — acceptable for now; override support is a future concern.
- No user-visible configuration means no escape hatch, but this is intentional for v0.x simplicity.
