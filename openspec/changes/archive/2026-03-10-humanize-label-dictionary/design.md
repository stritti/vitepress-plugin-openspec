## Context

`humanizeLabel(name: string)` currently does a simple split/capitalize/join. It lives in `src/utils.ts` as a module-private function. All display sites (`generateSpecPage`, `generateChangeIndexPage`, sidebar builders, index link text) call it with `spec.name` or `change.name`.

The fix has two independent layers:
1. Smarter `humanizeLabel` — dictionary + version token regex
2. User override — `title` field read at folder-scan time, passed through to display sites

## Goals / Non-Goals

**Goals:**
- `openapi-v3-migration` → `OpenAPI v3 Migration` automatically
- `rest-api-docs` → `REST API Docs` automatically
- Version tokens (`v1`, `v2`, `v3`, `v10`) stay lowercase
- User can override any label with `title:` in `.openspec.yaml` or spec frontmatter
- Override is verbatim — no further processing applied

**Non-Goals:**
- Locale-aware casing
- Dictionary extensibility via plugin options (future concern)
- Non-English acronyms

## Decisions

### Dictionary contents

A focused set of ~25 tokens covering the likely vocabulary of OpenSpec users:

```
api       → API        rest      → REST
graphql   → GraphQL    grpc      → gRPC
openapi   → OpenAPI    oauth     → OAuth
oauth2    → OAuth2     http      → HTTP
https     → HTTPS      url       → URL
uri       → URI        sdk       → SDK
ui        → UI         ux        → UX
id        → ID         db        → DB
sql       → SQL        css       → CSS
html      → HTML       json      → JSON
yaml      → YAML       xml       → XML
jwt       → JWT        ci        → CI
cd        → CD
```

Rationale: these are the tokens most likely to appear in spec/change names in software projects. The list is conservative — better to miss a rare acronym than to wrongly uppercase a real word.

### Version token detection

Tokens matching `/^v\d+$/` (v1, v2, v3, v10, v42…) are kept lowercase. Rationale: `v3` reads more naturally than `V3` in `OpenAPI v3 Migration`.

### humanizeLabel algorithm

```
for each word in name.split('-'):
  if word matches /^v\d+$/  → keep as-is
  if word in dictionary     → use dictionary value
  else                      → capitalize first letter
join with ' '
```

### Override via title field

`readOpenSpecFolder()` already reads `.openspec.yaml`. Extend it to also read `title:` and store it on `Change`. Add `title?: string` to the `Change` type.

For specs, parse the frontmatter block (`---\ntitle: ...\n---`) from `spec.md` and store it on `CapabilitySpec`.

Display sites use `change.title ?? humanizeLabel(change.name)` and `spec.title ?? humanizeLabel(spec.name)`.

### Where the fallback lives

Keep `humanizeLabel` as a module-private function — no need to export it. The override logic (`title ?? humanizeLabel(name)`) is applied at each call site, keeping the data model clean (name = filesystem identity, title = display label).

## Risks / Trade-offs

- Dictionary will always be incomplete — acceptable, it covers the vast majority of real cases
- `grpc` → `gRPC` is non-obvious casing; if it looks wrong to some users they can override with `title:`
- Frontmatter parsing is a new dependency — use a minimal regex, not a full parser, to avoid adding packages
