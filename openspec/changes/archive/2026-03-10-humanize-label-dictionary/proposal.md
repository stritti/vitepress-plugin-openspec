## Why

`humanizeLabel()` currently splits on `-` and capitalizes the first letter of each word, producing `Openapi V3 Migration` instead of `OpenAPI v3 Migration`. Kebab-case destroys all case information, so acronyms and version tokens cannot be recovered from the string alone. This makes generated headings and sidebar labels look machine-generated for projects with API, REST, OAuth, or similar names.

## What Changes

- Add a static acronym dictionary to `humanizeLabel()` that maps lowercase tokens to their canonical form (e.g., `api` → `API`, `openapi` → `OpenAPI`)
- Add version token detection: tokens matching `/^v\d+$/` (e.g., `v3`, `v10`) stay lowercase
- Add optional `title` field support in `.openspec.yaml` for changes — if present, used verbatim instead of humanizing the directory name
- Add optional frontmatter `title:` support in `spec.md` files — if present, used verbatim as the spec label

## Capabilities

### New Capabilities

- `label-dictionary`: Acronym dictionary and version token detection within `humanizeLabel()`, plus `title` override support from `.openspec.yaml` and spec frontmatter.

### Modified Capabilities

- `label-humanization`: Extended with dictionary lookup and version token handling. Override via `title` field takes precedence over automatic humanization.
- `openspec-folder-reader`: Must read and expose `title` from `.openspec.yaml` for changes, and parse frontmatter `title` from `spec.md` files.

## Impact

- `src/utils.ts` — extend `humanizeLabel()`, update `readOpenSpecFolder()` to extract titles
- `src/types.ts` — add optional `title?: string` to `CapabilitySpec` and `Change`
- No breaking changes to the public API
- All call sites that currently pass `name` to display functions pick up `title ?? name` automatically
