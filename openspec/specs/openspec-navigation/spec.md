## ADDED Requirements

### Requirement: generateOpenSpecSidebar returns a structured sidebar

`generateOpenSpecSidebar(specDir: string, options?)` SHALL synchronously return a VitePress sidebar configuration with three groups: "Specifications" (all canonical specs), "Changes" (all active changes), and "Archiv" (all archived changes, collapsed).

#### Scenario: Full sidebar
- **WHEN** `generateOpenSpecSidebar('./openspec', { outDir: 'project-docs' })` is called
- **THEN** the result contains a group `{ text: 'Specifications', items: [...] }`, a group `{ text: 'Changes', items: [...] }`, and a group `{ text: 'Archiv', collapsed: true, items: [...] }`

#### Scenario: Empty archive is omitted
- **WHEN** no archived changes exist
- **THEN** the result contains no archive group

### Requirement: Change entries in the sidebar have sub-items for artifacts

Each active change in the sidebar SHALL be rendered as a collapsed group with links to the available artifacts (Proposal, Design, Tasks).

#### Scenario: Change with all artifacts
- **WHEN** a change has all three artifacts
- **THEN** the change sidebar entry has `items: [{ text: 'Proposal' }, { text: 'Design' }, { text: 'Tasks' }]`

### Requirement: openspecNav returns a VitePress nav entry

`openspecNav(specDir: string, options?)` SHALL synchronously return `{ text: string, link: string }`, where `text` is configurable (default: `'Docs'`) and `link` points to `/<outDir>/`.

#### Scenario: Default nav entry
- **WHEN** `openspecNav('./openspec', { outDir: 'project-docs' })` is called
- **THEN** it returns `{ text: 'Docs', link: '/project-docs/' }`

#### Scenario: Custom text
- **WHEN** `openspecNav('./openspec', { outDir: 'project-docs', text: 'Project Docs' })` is called
- **THEN** it returns `{ text: 'Project Docs', link: '/project-docs/' }`

### Requirement: openspecPlugin is exported as a Vite plugin

`openspecPlugin(options)` SHALL be exported as the named export `openspec` from the package and return a valid Vite plugin object.

#### Scenario: Plugin export
- **WHEN** `import openspec from 'vitepress-plugin-openspec'` is imported
- **THEN** `openspec({ specDir: './openspec' })` can be used as a Vite plugin in `defineConfig`
