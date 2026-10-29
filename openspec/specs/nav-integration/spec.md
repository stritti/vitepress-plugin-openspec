## Purpose

Provide the `openspecNav()` helper that returns a VitePress nav entry pointing at the generated OpenSpec section.

## Requirements

### Requirement: openspecNav helper is exported

The plugin package SHALL export a synchronous `openspecNav(specDir, options?)` function from its main entry point.

#### Scenario: Import from package
- **WHEN** a consumer imports `{ openspecNav }` from `@stritti/vitepress-plugin-openspec`
- **THEN** the import resolves without error

### Requirement: openspecNav returns a VitePress nav entry

`openspecNav(specDir, options?)` SHALL return a single nav item `{ text: string, link: string }` whose link points to the root index page of the generated section.

#### Scenario: Default nav entry
- **WHEN** `openspecNav('./openspec')` is called
- **THEN** it returns `{ text: 'Docs', link: '/openspec/' }`

#### Scenario: Custom label and output directory
- **WHEN** `openspecNav('./openspec', { outDir: 'project-docs', text: 'Specs' })` is called
- **THEN** it returns `{ text: 'Specs', link: '/project-docs/' }`

#### Scenario: Missing openspec directory throws descriptive error
- **WHEN** `openspecNav('./nonexistent')` is called
- **THEN** it throws an error whose message includes the resolved missing path
