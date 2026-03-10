## Tasks

### 1. Extract description from spec content

- [x] 1.1 Add `extractSpecDescription(content: string): string | undefined` in `src/utils.ts` that finds the first `### Requirement:` heading, takes the paragraph text immediately following it, extracts the first sentence (up to `.`, `?`, or `!`), trims it, and caps at 160 characters at word boundary with `…`
- [x] 1.2 Return `undefined` if no `### Requirement:` heading is found

### 2. Strip delta section markers

- [x] 2.1 Add `stripDeltaMarkers(content: string): string` that removes lines matching `/^## (ADDED|MODIFIED|REMOVED) Requirements\s*$/` and collapses resulting consecutive blank lines to a single blank line

### 3. Transform scenario blocks to VitePress detail containers

- [x] 3.1 Add `transformScenarios(content: string): string` that replaces `#### Scenario: <title>` lines with `:::details <title>` and inserts a closing `:::` before the next heading of any level (`/^#{1,6} /`) or at end of content — handling back-to-back scenarios correctly

### 4. Update `generateSpecPage` to apply all three transformations

- [x] 4.1 Call `extractSpecDescription(spec.content)` and prepend `---\ndescription: "..."\n---\n\n` when a description is found
- [x] 4.2 Apply `stripDeltaMarkers()` to `spec.content` before rendering
- [x] 4.3 Apply `transformScenarios()` after `stripDeltaMarkers()`

### 5. Update tests

- [x] 5.1 Add unit tests for `extractSpecDescription`: with requirement, without requirement, long sentence (truncation), sentence with special characters
- [x] 5.2 Add unit tests for `stripDeltaMarkers`: ADDED/MODIFIED/REMOVED headers removed, content preserved, plain specs unaffected, consecutive blank lines collapsed
- [x] 5.3 Add unit tests for `transformScenarios`: single scenario, back-to-back scenarios, scenario at EOF, no scenarios (passthrough)
- [x] 5.4 Update `generateSpecPage` tests: assert frontmatter present when description extractable, assert no `## ADDED Requirements` in output, assert `:::details` containers present
