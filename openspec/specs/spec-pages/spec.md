## Requirements

### Requirement: Für jede Canonical Spec wird eine VitePress-Seite generiert
Das Plugin SHALL für jede Canonical Spec aus `openspec/specs/<capability>/spec.md` eine Seite in `<outDir>/specs/<capability>/index.md` im VitePress-`srcDir` schreiben, mit einem H1-Titel (humanisierter Capability-Name) und dem originalen Spec-Inhalt darunter.

#### Scenario: Spec-Seite wird generiert
- **WHEN** das Plugin für eine Canonical Spec mit `name: 'nav-integration'` ausgeführt wird
- **THEN** existiert `<srcDir>/<outDir>/specs/nav-integration/index.md` mit `# Nav Integration` als erstem Heading

#### Scenario: Inhalt der Spec ist vollständig übernommen
- **WHEN** die originale `spec.md` Requirements und Scenarios enthält
- **THEN** enthält die generierte Seite denselben Inhalt vollständig

### Requirement: Generated spec page H1 heading uses humanized label

The `# Heading` on a generated spec page MUST use the humanized (Title Case) form of the capability name.

#### Scenario: Spec page heading uses Title Case
- **WHEN** the plugin generates a page for spec `nav-integration`
- **THEN** the first line of the generated page is `# Nav Integration`

### Requirement: Eine Index-Seite für den Specs-Bereich wird generiert
Das Plugin SHALL eine Übersichtsseite `<outDir>/specs/index.md` generieren, die alle Capabilities mit humanisiertem Name und Link auflistet.

#### Scenario: Specs-Index enthält alle Capabilities
- **WHEN** drei Canonical Specs existieren
- **THEN** enthält `specs/index.md` Links zu allen drei Capability-Seiten mit humanisierten Labels

### Requirement: Generated spec page structure includes optional frontmatter

`generateSpecPage()` SHALL produce a page with the following structure when a description can be extracted:

```
---
description: "<extracted description>"
---

# <humanized title>

<transformed spec content>
```

When no description can be extracted, the frontmatter block is omitted and the page begins directly with the `# <title>` heading.

#### Scenario: Spec page with extractable description
- **WHEN** the plugin generates a page for spec `nav-integration` whose spec.md contains a `### Requirement:` heading
- **THEN** the generated page begins with a `---` frontmatter block containing `description:`

#### Scenario: Spec page without extractable description
- **WHEN** the plugin generates a page for a spec whose spec.md contains no `### Requirement:` heading
- **THEN** the generated page begins directly with `# Nav Integration` (no frontmatter)

### Requirement: Bereits existierende generierte Seiten werden überschrieben
Das Plugin SHALL bestehende Dateien im `<outDir>/specs/`-Ordner ohne Fehlermeldung überschreiben.

#### Scenario: Wiederholter Build
- **WHEN** das Plugin zweimal hintereinander ausgeführt wird
- **THEN** werden die Dateien beim zweiten Durchlauf überschrieben ohne Fehler
