## Requirements

### Requirement: Für jedes Change-Artefakt wird eine VitePress-Seite generiert
Das Plugin SHALL für jedes vorhandene Artefakt (proposal.md, design.md, tasks.md) eines Changes eine entsprechende Seite in `<outDir>/changes/<name>/<artifact>.md` im VitePress-`srcDir` schreiben.

#### Scenario: Change mit allen drei Artefakten
- **WHEN** ein Change `my-feature` die Dateien `proposal.md`, `design.md` und `tasks.md` enthält
- **THEN** werden drei Seiten generiert: `changes/my-feature/proposal.md`, `changes/my-feature/design.md`, `changes/my-feature/tasks.md`

#### Scenario: Change mit nur proposal.md
- **WHEN** ein Change nur `proposal.md` enthält
- **THEN** wird nur `changes/my-feature/proposal.md` generiert

### Requirement: Eine Index-Seite pro Change wird generiert
Das Plugin SHALL für jeden Change eine `<outDir>/changes/<name>/index.md` generieren, die den humanisierten Change-Namen, das Erstellungsdatum und Links zu den vorhandenen Artefakten enthält.

#### Scenario: Change-Index mit allen Artefakten
- **WHEN** ein Change alle drei Artefakte hat
- **THEN** enthält `changes/<name>/index.md` Links zu proposal, design und tasks

### Requirement: Generated change index page H1 heading uses humanized label

The `# Heading` on a generated change index page MUST use the humanized (Title Case) form of the change name.

#### Scenario: Change index page heading uses Title Case
- **WHEN** the plugin generates an index page for change `readable-sidebar-labels`
- **THEN** the first line of the generated page is `# Readable Sidebar Labels`

### Requirement: Link text in index pages uses humanized labels

The link text used in `specs/index.md` and `changes/index.md` for individual items MUST use humanized labels.

#### Scenario: Changes-Übersicht
- **WHEN** zwei aktive Changes existieren
- **THEN** enthält `changes/index.md` Links zu beiden Changes mit humanisierten Labels

### Requirement: Archivierte Changes werden in einem separaten Abschnitt auf der Übersichtsseite aufgelistet
Archivierte Changes aus `openspec/changes/archive/` SHALL in einem eigenen Abschnitt `## Archiv` auf der `changes/index.md` mit Archivierungsdatum aufgelistet werden.

#### Scenario: Archiv-Abschnitt
- **WHEN** ein archivierter Change existiert
- **THEN** enthält `changes/index.md` einen `## Archiv`-Abschnitt mit dem archivierten Change mit humanisiertem Label
