# change-pages

## ADDED Requirements

### Requirement: Für jedes Change-Artefakt wird eine VitePress-Seite generiert
Das Plugin SHALL für jedes vorhandene Artefakt (proposal.md, design.md, tasks.md) eines Changes eine entsprechende Seite in `<outDir>/changes/<name>/<artifact>.md` im VitePress-`srcDir` schreiben.

#### Scenario: Change mit allen drei Artefakten
- **WHEN** ein Change `my-feature` die Dateien `proposal.md`, `design.md` und `tasks.md` enthält
- **THEN** werden drei Seiten generiert: `changes/my-feature/proposal.md`, `changes/my-feature/design.md`, `changes/my-feature/tasks.md`

#### Scenario: Change mit nur proposal.md
- **WHEN** ein Change nur `proposal.md` enthält
- **THEN** wird nur `changes/my-feature/proposal.md` generiert

### Requirement: Eine Index-Seite pro Change wird generiert
Das Plugin SHALL für jeden Change eine `<outDir>/changes/<name>/index.md` generieren, die den Change-Namen, das Erstellungsdatum und Links zu den vorhandenen Artefakten enthält.

#### Scenario: Change-Index mit allen Artefakten
- **WHEN** ein Change alle drei Artefakte hat
- **THEN** enthält `changes/<name>/index.md` Links zu proposal, design und tasks

### Requirement: Eine Übersichtsseite für alle Changes wird generiert
Das Plugin SHALL `<outDir>/changes/index.md` generieren, die alle aktiven Changes mit Name, Datum und Link zur Change-Index-Seite auflistet.

#### Scenario: Changes-Übersicht
- **WHEN** zwei aktive Changes existieren
- **THEN** enthält `changes/index.md` Links zu beiden Changes

### Requirement: Archivierte Changes werden in einem separaten Abschnitt auf der Übersichtsseite aufgelistet
Archivierte Changes aus `openspec/changes/archive/` SHALL in einem eigenen Abschnitt `## Archiv` auf der `changes/index.md` mit Archivierungsdatum aufgelistet werden.

#### Scenario: Archiv-Abschnitt
- **WHEN** ein archivierter Change existiert
- **THEN** enthält `changes/index.md` einen `## Archiv`-Abschnitt mit dem archivierten Change
