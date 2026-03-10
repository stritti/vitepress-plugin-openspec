## Tasks

### 1. Add `humanizeLabel` utility to `src/utils.ts`

- [x] 1.1 Add `function humanizeLabel(name: string): string` that splits on `-`, capitalizes the first letter of each word, and joins with a space
- [x] 1.2 Verify edge cases: empty string returns `""`, single word capitalizes first letter

### 2. Apply `humanizeLabel` in page generators

- [x] 2.1 In `generateSpecPage`: replace `spec.name` heading with `humanizeLabel(spec.name)`
- [x] 2.2 In `generateChangeIndexPage`: replace `change.name` heading with `humanizeLabel(change.name)`
- [x] 2.3 In `generateSpecsIndexPage`: replace `spec.name` link text with `humanizeLabel(spec.name)`
- [x] 2.4 In `generateChangesIndexPage`: replace `change.name` link text with `humanizeLabel(change.name)` (both active and archived sections)

### 3. Apply `humanizeLabel` in sidebar builder

- [x] 3.1 In `generateOpenSpecSidebar`: replace `s.name` with `humanizeLabel(s.name)` for spec items
- [x] 3.2 In `generateOpenSpecSidebar`: replace `c.name` with `humanizeLabel(c.name)` for change group text (active and archived)

### 4. Update tests

- [x] 4.1 Add unit tests for `humanizeLabel` in `src/__tests__/utils.test.ts` covering: multi-word, single-word, empty string
- [x] 4.2 Update any existing test assertions that compare against raw kebab-case headings or sidebar text to use the humanized form
