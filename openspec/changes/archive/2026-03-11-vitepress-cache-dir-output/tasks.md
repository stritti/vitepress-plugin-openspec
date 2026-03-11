## 1. Implementation

- [x] 1.1 Add a `writeGitignore(absoluteOutDir)` helper (or inline the write) in `src/plugin.ts` that writes `<absoluteOutDir>/.gitignore` with the standard ignore-all-except-self content
- [x] 1.2 Call the gitignore write at the end of the `try` block in `generateOpenSpecPages()`, after all page files are written

## 2. Tests

- [x] 2.1 Add a test in `src/__tests__/plugin.test.ts` (or equivalent) that verifies `<outDir>/.gitignore` exists with the correct content after `generateOpenSpecPages()` runs
- [x] 2.2 Add a test that verifies re-running `generateOpenSpecPages()` overwrites a modified `.gitignore` with the canonical content (idempotency)

## 3. Documentation

- [x] 3.1 Update `README.md` to note that the output directory is automatically gitignored and that a manual `docs/openspec` entry in `.gitignore` is no longer required
