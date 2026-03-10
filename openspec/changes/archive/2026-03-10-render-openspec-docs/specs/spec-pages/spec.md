## ADDED Requirements

### Requirement: Für jede Canonical Spec wird eine VitePress-Seite generiert
Das Plugin SHALL für jede Canonical Spec aus `openspec/specs/<capability>/spec.md` eine Seite in `<outDir>/specs/<capability>/index.md` im VitePress-`srcDir` schreiben, mit einem H1-Titel (Capability-Name) und dem originalen Spec-Inhalt darunter.

#### Scenario: Spec-Seite wird generiert
- **WHEN** das Plugin für eine Canonical Spec mit `name: 'nav-integration'` ausgeführt wird
- **THEN** existiert `<srcDir>/<outDir>/specs/nav-integration/index.md` mit `# nav-integration` als erstem Heading

#### Scenario: Inhalt der Spec ist vollständig übernommen
- **WHEN** die originale `spec.md` Requirements und Scenarios enthält
- **THEN** enthält die generierte Seite denselben Inhalt vollständig

### Requirement: Eine Index-Seite für den Specs-Bereich wird generiert
Das Plugin SHALL eine Übersichtsseite `<outDir>/specs/index.md` generieren, die alle Capabilities mit Name und Link auflistet.

#### Scenario: Specs-Index enthält alle Capabilities
- **WHEN** drei Canonical Specs existieren
- **THEN** enthält `specs/index.md` Links zu allen drei Capability-Seiten

### Requirement: Bereits existierende generierte Seiten werden überschrieben
Das Plugin SHALL bestehende Dateien im `<outDir>/specs/`-Ordner ohne Fehlermeldung überschreiben.

#### Scenario: Wiederholter Build
- **WHEN** das Plugin zweimal hintereinander ausgeführt wird
- **THEN** werden die Dateien beim zweiten Durchlauf überschrieben ohne Fehler
