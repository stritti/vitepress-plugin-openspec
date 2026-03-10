### Requirement: generateSidebarFromSpec returns grouped sidebar structure
`generateSidebarFromSpec()` SHALL return `SidebarItem[]` where each item is a tag group containing child operation items, replacing the previous flat list of operation links.

#### Scenario: Return value is an array of group objects
- **WHEN** `generateSidebarFromSpec({ spec: './petstore.yaml', outDir: 'api' })` is called
- **THEN** the return value is an array where each element has `{ text: string, collapsed: boolean, items: SidebarItem[] }`

#### Scenario: Child items link to individual endpoint pages
- **WHEN** an endpoint `GET /pets` is tagged `pets`
- **THEN** the `pets` group's `items` array contains `{ text: 'GET /pets', link: '/api/pets/get-pets' }`

### Requirement: Index page includes summary table
`generateIndexMarkdown()` SHALL include a Markdown table with columns `Method`, `Path`, and `Summary` listing all operations, sorted by tag then path.

#### Scenario: Summary table present in index output
- **WHEN** `generateIndexMarkdown()` is called for a spec with multiple endpoints
- **THEN** the output contains a Markdown table with `| Method | Path | Summary |` header row

#### Scenario: Table rows sorted by tag then path
- **WHEN** a spec has endpoints across multiple tags
- **THEN** table rows are grouped by tag (alphabetically) and within each tag sorted by path alphabetically
