## ADDED Requirements

### Requirement: generateOpenSpecSidebar gibt eine strukturierte Sidebar zurück
`generateOpenSpecSidebar(specDir: string, options?)` SHALL synchron eine VitePress-Sidebar-Konfiguration zurückgeben mit drei Gruppen: "Specifications" (alle Canonical Specs), "Changes" (alle aktiven Changes) und "Archiv" (alle archivierten Changes, eingeklappt).

#### Scenario: Vollständige Sidebar
- **WHEN** `generateOpenSpecSidebar('./openspec', { outDir: 'project-docs' })` aufgerufen wird
- **THEN** enthält das Ergebnis eine Gruppe `{ text: 'Specifications', items: [...] }`, eine Gruppe `{ text: 'Changes', items: [...] }` und eine Gruppe `{ text: 'Archiv', collapsed: true, items: [...] }`

#### Scenario: Leeres Archiv wird weggelassen
- **WHEN** keine archivierten Changes existieren
- **THEN** enthält das Ergebnis keine Archiv-Gruppe

### Requirement: Change-Einträge in der Sidebar haben Untereinträge für Artefakte
Jeder aktive Change in der Sidebar SHALL als eingeklappte Gruppe mit Links zu den vorhandenen Artefakten (Proposal, Design, Tasks) dargestellt werden.

#### Scenario: Change mit allen Artefakten
- **WHEN** ein Change alle drei Artefakte hat
- **THEN** hat der Change-Sidebar-Eintrag `items: [{ text: 'Proposal' }, { text: 'Design' }, { text: 'Tasks' }]`

### Requirement: openspecNav gibt einen VitePress-Nav-Eintrag zurück
`openspecNav(specDir: string, options?)` SHALL synchron `{ text: string, link: string }` zurückgeben, wobei `text` konfigurierbar ist (Default: `'Docs'`) und `link` auf `/<outDir>/` zeigt.

#### Scenario: Standard-Nav-Eintrag
- **WHEN** `openspecNav('./openspec', { outDir: 'project-docs' })` aufgerufen wird
- **THEN** gibt es `{ text: 'Docs', link: '/project-docs/' }`

#### Scenario: Benutzerdefinierter Text
- **WHEN** `openspecNav('./openspec', { outDir: 'project-docs', text: 'Projektdoku' })` aufgerufen wird
- **THEN** gibt es `{ text: 'Projektdoku', link: '/project-docs/' }`

### Requirement: openspecPlugin ist als Vite-Plugin exportiert
`openspecPlugin(options)` SHALL als named export `openspec` aus dem Paket exportiert werden und ein gültiges Vite-Plugin-Objekt zurückgeben.

#### Scenario: Plugin-Export
- **WHEN** `import openspec from 'vitepress-plugin-openspec'` importiert wird
- **THEN** kann `openspec({ specDir: './openspec' })` als Vite-Plugin in `defineConfig` verwendet werden
