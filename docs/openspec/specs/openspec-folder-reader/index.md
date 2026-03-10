# openspec-folder-reader

## ADDED Requirements

### Requirement: Plugin liest den openspec-Ordner und gibt eine strukturierte Darstellung zurück
Die Funktion `readOpenSpecFolder(dir: string): OpenSpecFolder` SHALL den angegebenen Ordner scannen und eine strukturierte Darstellung aller Canonical Specs, aktiven Changes und archivierten Changes zurückgeben.

#### Scenario: Vollständiger openspec-Ordner
- **WHEN** `readOpenSpecFolder('./openspec')` auf einen Ordner mit `specs/` und `changes/` aufgerufen wird
- **THEN** gibt es ein Objekt mit `specs: CapabilitySpec[]`, `changes: Change[]` und `archivedChanges: Change[]`

#### Scenario: Leerer oder fehlender Ordner
- **WHEN** `readOpenSpecFolder('./openspec')` auf einen nicht existierenden Ordner aufgerufen wird
- **THEN** wird ein Fehler mit dem Ordnerpfad im Text geworfen

### Requirement: Canonical Specs werden aus openspec/specs/ gelesen
Für jeden Unterordner in `openspec/specs/` der eine `spec.md` enthält SHALL ein `CapabilitySpec`-Objekt mit `name` (Ordnername) und `specPath` (absoluter Pfad zur spec.md) erstellt werden.

#### Scenario: Mehrere Capabilities
- **WHEN** `openspec/specs/` die Ordner `nav-integration/` und `sidebar-generation/` enthält, jeweils mit `spec.md`
- **THEN** enthält das Ergebnis zwei `CapabilitySpec`-Einträge mit den korrekten Namen

#### Scenario: Unterordner ohne spec.md wird ignoriert
- **WHEN** ein Unterordner in `openspec/specs/` keine `spec.md` enthält
- **THEN** wird er nicht in das Ergebnis aufgenommen

### Requirement: Changes werden mit ihren Artefakten gelesen
Für jeden Unterordner in `openspec/changes/` (außer `archive/`) der eine `.openspec.yaml` enthält SHALL ein `Change`-Objekt erstellt werden mit `name`, `artifacts` (welche von proposal/design/tasks vorhanden sind) und `metadata` aus `.openspec.yaml`.

#### Scenario: Change mit allen Artefakten
- **WHEN** `openspec/changes/my-feature/` die Dateien `.openspec.yaml`, `proposal.md`, `design.md`, `tasks.md` enthält
- **THEN** enthält das Change-Objekt alle drei Artefakte in `artifacts`

#### Scenario: Change mit fehlendem Design
- **WHEN** `openspec/changes/my-feature/` nur `.openspec.yaml` und `proposal.md` enthält
- **THEN** enthält `artifacts` nur `proposal`

### Requirement: Archivierte Changes werden aus changes/archive/ gelesen
Unterordner in `openspec/changes/archive/` SHALL als archivierte Changes mit denselben Feldern wie aktive Changes gelesen werden, zusätzlich mit dem Datum aus dem Ordnernamen (`YYYY-MM-DD-<name>`).

#### Scenario: Archivierter Change
- **WHEN** `openspec/changes/archive/2026-03-10-my-feature/` existiert mit `.openspec.yaml`
- **THEN** wird ein archiviertes Change-Objekt mit `archivedDate: '2026-03-10'` und `name: 'my-feature'` erstellt
