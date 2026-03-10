## Tasks

### 1. Extend `humanizeLabel` in `src/utils.ts`

- [x] 1.1 Add the acronym dictionary as a module-level `const` mapping lowercase tokens to canonical display strings (api→API, rest→REST, graphql→GraphQL, grpc→gRPC, openapi→OpenAPI, oauth→OAuth, oauth2→OAuth2, http→HTTP, https→HTTPS, url→URL, uri→URI, sdk→SDK, ui→UI, ux→UX, id→ID, db→DB, sql→SQL, css→CSS, html→HTML, json→JSON, yaml→YAML, xml→XML, jwt→JWT, ci→CI, cd→CD)
- [x] 1.2 Update `humanizeLabel()` algorithm: for each token, check version pattern `/^v\d+$/` first (keep as-is), then dictionary lookup, then fallback to capitalize-first-letter

### 2. Add `title` to data types in `src/types.ts`

- [x] 2.1 Add `title?: string` to the `Change` interface
- [x] 2.2 Add `title?: string` to the `CapabilitySpec` interface

### 3. Read `title` in `readOpenSpecFolder()` in `src/utils.ts`

- [x] 3.1 When building a `Change` object, read `title` from the parsed `.openspec.yaml` metadata (already available as `meta.title`) and pass it through
- [x] 3.2 Add a `parseFrontmatterTitle(content: string): string | undefined` helper that extracts `title:` from a YAML frontmatter block using a simple regex (no extra package needed)
- [x] 3.3 When building a `CapabilitySpec` object, call `parseFrontmatterTitle` on the spec content and set `title` on the object

### 4. Apply `title ?? humanizeLabel(name)` at all display sites

- [x] 4.1 In `generateSpecPage`: use `spec.title ?? humanizeLabel(spec.name)` for the H1
- [x] 4.2 In `generateChangeIndexPage`: use `change.title ?? humanizeLabel(change.name)` for the H1
- [x] 4.3 In `generateSpecsIndexPage`: use `spec.title ?? humanizeLabel(spec.name)` for link text
- [x] 4.4 In `generateChangesIndexPage`: use `change.title ?? humanizeLabel(change.name)` for link text (active and archived)
- [x] 4.5 In `generateOpenSpecSidebar`: use `spec.title ?? humanizeLabel(spec.name)` for spec items and `change.title ?? humanizeLabel(change.name)` for change group text

### 5. Update tests

- [x] 5.1 Add unit tests for the extended `humanizeLabel` covering: known acronym (`rest-api` → `REST API`), version token (`openapi-v3` → `OpenAPI v3`), unknown word fallback, empty string
- [x] 5.2 Add a fixture spec with frontmatter `title:` and assert it is used as the display label in `generateSpecPage` and sidebar
- [x] 5.3 Add a fixture change with `title:` in `.openspec.yaml` and assert it is used in `generateChangeIndexPage` and sidebar
