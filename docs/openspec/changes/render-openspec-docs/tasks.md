## 1. Typen (src/types.ts)

- [x] 1.1 Bestehende OpenAPI-Typen (`OpenSpecPluginOptions`, `ParsedEndpoint`, `ParsedSpec`) durch OpenSpec-Typen ersetzen: `CapabilitySpec`, `Change`, `ChangeArtifact`, `OpenSpecFolder`, `OpenSpecPluginOptions`
- [x] 1.2 `NavItem` und `SidebarItem` beibehalten (unverändert)

## 2. Folder-Reader (src/utils.ts)

- [x] 2.1 Bestehende OpenAPI-Funktionen entfernen (`loadSpecFile`, `extractEndpoints`, `parseSpec`, `slugify`, `generateEndpointMarkdown`, `generateIndexMarkdown`, `groupEndpointsByTag`)
- [x] 2.2 `readOpenSpecFolder(dir: string): OpenSpecFolder` implementieren: scannt `specs/`, `changes/`, `changes/archive/`
- [x] 2.3 `.openspec.yaml` mit `js-yaml` auslesen für Change-Metadaten (`created`, `status`)
- [x] 2.4 `generateSpecPage(spec: CapabilitySpec): string` implementieren (H1 + Spec-Inhalt)
- [x] 2.5 `generateSpecsIndexPage(specs: CapabilitySpec[], outDir: string): string` implementieren
- [x] 2.6 `generateChangeIndexPage(change: Change, outDir: string): string` implementieren
- [x] 2.7 `generateChangesIndexPage(folder: OpenSpecFolder, outDir: string): string` implementieren (aktive + Archiv-Abschnitt)
- [x] 2.8 `generateOpenSpecSidebar(specDir: string, options?): SidebarItem[]` implementieren
- [x] 2.9 `openspecNav(specDir: string, options?): NavItem` implementieren

## 3. Plugin (src/plugin.ts)

- [x] 3.1 Bestehende OpenAPI-Implementierung von `openspec()` und `generateSidebarFromSpec()` entfernen
- [x] 3.2 Neues `openspec(options: OpenSpecPluginOptions): Plugin` implementieren: liest `openspec/`-Ordner und schreibt alle Seiten in `configResolved`
- [x] 3.3 Spec-Seiten schreiben: für jede Canonical Spec `<outDir>/specs/<cap>/index.md`
- [x] 3.4 Specs-Index schreiben: `<outDir>/specs/index.md`
- [x] 3.5 Change-Seiten schreiben: für jeden aktiven Change Artefakte und `index.md` kopieren
- [x] 3.6 Changes-Index schreiben: `<outDir>/changes/index.md` mit aktiven + archivierten Changes
- [x] 3.7 Root-Index schreiben: `<outDir>/index.md` mit Links zu Specs und Changes

## 4. Exports (src/index.ts)

- [x] 4.1 `generateSidebarFromSpec` und `openspecNav` (alte OpenAPI-Version) durch `generateOpenSpecSidebar` und `openspecNav` (neue OpenSpec-Version) ersetzen
- [x] 4.2 OpenAPI-Typen aus Exports entfernen; neue OpenSpec-Typen exportieren

## 5. Tests (src/__tests__/)

- [x] 5.1 Bestehende Tests und `sample.yaml`-Fixture entfernen
- [x] 5.2 Miniatur-`openspec/`-Fixture erstellen: zwei Specs, zwei aktive Changes, ein archivierter Change
- [x] 5.3 Tests für `readOpenSpecFolder()` schreiben
- [x] 5.4 Tests für `generateSpecPage()`, `generateSpecsIndexPage()` schreiben
- [x] 5.5 Tests für `generateChangesIndexPage()` schreiben
- [x] 5.6 Tests für `generateOpenSpecSidebar()` schreiben
- [x] 5.7 Tests für `openspecNav()` schreiben

## 6. Demo-Site (docs/)

- [x] 6.1 `docs/.vitepress/config.ts` auf neue API umstellen: `openspecNav` und `generateOpenSpecSidebar` statt bisheriger Funktionen
- [x] 6.2 `docs/petstore.yaml` entfernen (nicht mehr benötigt)
- [x] 6.3 Lokalen Build prüfen: `bun run build && bun run docs:build`

## 7. Abschluss

- [x] 7.1 `bun run lint` — TypeScript-Fehler beheben
- [x] 7.2 `bun test` — alle Tests grün
- [x] 7.3 Version in `package.json` auf `0.2.0` bumpen (Breaking Change)
