## ADDED Requirements

### Requirement: openspecNav helper is exported
The plugin package SHALL export a synchronous `openspecNav(options)` function from its main entry point alongside the existing `openspec` and `generateSidebarFromSpec` exports.

#### Scenario: Import from package
- **WHEN** a consumer imports `{ openspecNav }` from `vitepress-plugin-openspec`
- **THEN** the import resolves without error

### Requirement: openspecNav returns a VitePress nav entry
`openspecNav(options)` SHALL return a single VitePress nav item object `{ text: string, link: string }` pointing to the root index page of the generated spec section.

#### Scenario: Single spec nav entry shape
- **WHEN** `openspecNav({ spec: './petstore.yaml', outDir: 'api' })` is called
- **THEN** it returns `{ text: 'API Reference', link: '/api/' }` (with `text` defaulting to the spec `info.title` and `link` derived from `outDir`)

#### Scenario: Custom nav label
- **WHEN** `openspecNav({ spec: './petstore.yaml', outDir: 'api', text: 'Petstore' })` is called
- **THEN** it returns `{ text: 'Petstore', link: '/api/' }`

### Requirement: openspecNav options accept the same spec path as the plugin
`openspecNav` SHALL accept the same `spec` option (file path string or array) as the `openspec` Vite plugin so users can reference the same spec without duplication.

#### Scenario: Relative path resolved from cwd
- **WHEN** `openspecNav({ spec: './docs/petstore.yaml', outDir: 'api' })` is called from the VitePress config directory
- **THEN** the spec is loaded and the nav entry reflects the spec's `info.title`

#### Scenario: Missing spec file throws descriptive error
- **WHEN** `openspecNav({ spec: './nonexistent.yaml', outDir: 'api' })` is called
- **THEN** it throws an error whose message includes the missing file path
