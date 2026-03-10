## Why

Das Plugin heißt `vitepress-plugin-openspec` weil es die **OpenSpec-Projektdokumentation** (openspec.dev) in VitePress integrieren soll — nicht OpenAPI oder Swagger. Die bisherige Implementierung basierte auf einem Missverständnis. Dieser Change ersetzt sie durch die korrekte Funktionalität: die Artefakte aus dem `openspec/`-Ordner eines Projekts werden als strukturierte, navigierbare VitePress-Dokumentationsseiten gerendert.

## What Changes

- **BREAKING**: Die bestehende OpenAPI/Swagger-Implementierung (`loadSpecFile`, `extractEndpoints`, `parseSpec`, `generateEndpointMarkdown`, OpenAPI-spezifische Typen) wird vollständig ersetzt
- Das Plugin liest den `openspec/`-Ordner des Projekts und generiert daraus VitePress-Seiten
- Canonical Specs (`openspec/specs/<capability>/spec.md`) → eigene Seite pro Capability
- Change-Artefakte (`openspec/changes/<name>/{proposal,design,tasks}.md`) → eigene Seiten pro Artefakt, gruppiert nach Change
- Archivierte Changes (`openspec/changes/archive/`) werden als eigener, eingeklappter Sidebar-Bereich dargestellt
- `generateSidebarFromSpec()` → **BREAKING** ersetzt durch `generateOpenSpecSidebar()`
- `openspecNav()` bleibt als Konzept erhalten, liest aber den `openspec/`-Ordner statt eine OpenAPI-Datei

## Capabilities

### New Capabilities

- `openspec-folder-reader`: Scannt den `openspec/`-Ordner und gibt eine strukturierte Darstellung aller Specs, Changes und archivierten Changes zurück
- `spec-pages`: Generiert VitePress-Seiten für alle Canonical Specs aus `openspec/specs/` mit Index-Seite
- `change-pages`: Generiert VitePress-Seiten für alle aktiven und archivierten Changes aus `openspec/changes/` mit Index-Seite pro Change
- `openspec-navigation`: `generateOpenSpecSidebar()` und `openspecNav()` für die VitePress-Konfiguration

### Modified Capabilities

(none — vollständige Neuentwicklung)

## Impact

- `src/types.ts` — vollständig neu mit OpenSpec-spezifischen Typen; `NavItem` und `SidebarItem` bleiben erhalten
- `src/utils.ts` — vollständig neu: OpenSpec-Folder-Reader und Seiten-Generator statt OpenAPI-Parser
- `src/plugin.ts` — vollständig neu: liest `openspec/`-Ordner statt OpenAPI-YAML-Dateien
- `src/index.ts` — aktualisierte Exports; `generateSidebarFromSpec` entfällt, `generateOpenSpecSidebar` neu
- `src/__tests__/` — alle bestehenden Tests werden ersetzt; `sample.yaml` wird entfernt
- `docs/.vitepress/config.ts` — muss auf die neue API umgestellt werden
