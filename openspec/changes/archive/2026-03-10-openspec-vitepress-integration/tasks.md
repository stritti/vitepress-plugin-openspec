## 1. Types

- [x] 1.1 Add `collapsed?: boolean` to `SidebarItem` interface in `src/types.ts`
- [x] 1.2 Add `NavItem` type (`{ text: string, link: string }`) to `src/types.ts`
- [x] 1.3 Update `OpenSpecPluginOptions` to accept optional `text` field for nav label override

## 2. Tag-Grouped Sidebar

- [x] 2.1 In `src/utils.ts`, create `groupEndpointsByTag(endpoints: ParsedEndpoint[])` that groups endpoints by their first tag (fallback: `"Other"`) and sorts groups alphabetically
- [x] 2.2 Update `generateSidebarFromSpec()` to call `groupEndpointsByTag()` and return `{ text, collapsed: false, items }[]` instead of a flat array
- [x] 2.3 Write/update tests in `src/__tests__/utils.test.ts` to assert grouped sidebar output shape

## 3. Index Page Summary Table

- [x] 3.1 Update `generateIndexMarkdown()` in `src/utils.ts` to append a `| Method | Path | Summary |` table after the existing heading and links
- [x] 3.2 Sort table rows by tag (alphabetical) then path (alphabetical)
- [x] 3.3 Write/update tests to assert the table is present in index page output

## 4. openspecNav Helper

- [x] 4.1 Add `openspecNav(options: { spec: string, outDir: string, text?: string }): NavItem` function to `src/utils.ts`
- [x] 4.2 Implement: load spec via existing `loadSpec()`, read `info.title` as default text, derive link as `/${outDir}/`
- [x] 4.3 Throw descriptive error when spec file is not found (include path in message)
- [x] 4.4 Export `openspecNav` from `src/index.ts`
- [x] 4.5 Write tests for `openspecNav` covering default label, custom label, and missing-file error

## 5. Build & Validation

- [x] 5.1 Run `npm run lint` and fix any TypeScript errors
- [x] 5.2 Run `npm test` and confirm all tests pass
- [x] 5.3 Run `npm run build` and confirm ESM + CJS output includes `openspecNav` export
