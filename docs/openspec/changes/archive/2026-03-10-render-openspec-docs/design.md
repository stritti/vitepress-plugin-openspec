## Context

Das Plugin wurde bisher fälschlicherweise als OpenAPI-Renderer implementiert. Die eigentliche Aufgabe ist das Rendern von **OpenSpec-Projektartefakten** aus dem `openspec/`-Ordner eines Projekts. OpenSpec-Ordner haben eine feste Struktur:

```
openspec/
  config.yaml                        ← Projekt-Metadaten
  specs/
    <capability>/spec.md             ← Canonical Specs
  changes/
    <name>/.openspec.yaml            ← Change-Metadaten
    <name>/proposal.md
    <name>/design.md
    <name>/tasks.md
    <name>/specs/<cap>/spec.md       ← Delta Specs
    archive/<date>-<name>/...        ← Archivierte Changes
```

Da OpenSpec-Artefakte bereits Markdown sind, ist die Kernaufgabe des Plugins: Ordner scannen → Seiten in den VitePress-`srcDir` kopieren → Sidebar/Nav-Konfiguration zurückgeben.

## Goals / Non-Goals

**Goals:**
- `openspecPlugin()` als Vite-Plugin liest den `openspec/`-Ordner und schreibt alle Artefakt-Markdown-Dateien in den VitePress-`srcDir` (mit angepassten Pfaden)
- Generiert Index-Seiten für die Specs- und Changes-Bereiche
- `generateOpenSpecSidebar()` gibt eine strukturierte VitePress-Sidebar zurück (Specs-Gruppe + Changes-Gruppe + Archive-Gruppe)
- `openspecNav()` gibt einen VitePress-Nav-Eintrag zurück

**Non-Goals:**
- Inhaltliche Transformation der Markdown-Dateien (keine Konvertierung von OpenSpec-Syntax in Vue-Komponenten)
- Support für andere Spec-Formate (OpenAPI, Swagger, AsyncAPI)
- Live-Reloading bei Änderungen im `openspec/`-Ordner (kann später ergänzt werden)

## Decisions

**D1 — Markdown-Dateien direkt kopieren, nicht transformieren**
Die OpenSpec-Markdown-Dateien werden unverändert in den VitePress-`srcDir` kopiert. VitePress rendert sie als normale Markdown-Seiten.
*Warum*: Einfachste Implementierung; keine Custom-Syntax-Parser nötig. OpenSpec-Markdown ist bereits gut lesbar.
*Alternative*: Markdown mit Custom-Badges, Callouts und VitePress-Komponenten anreichern. Für spätere Iteration aufheben.

**D2 — Ordnerstruktur im VitePress-`srcDir` spiegelt die `openspec/`-Struktur**
```
<outDir>/specs/<capability>/index.md   ← kopiert von openspec/specs/<cap>/spec.md
<outDir>/changes/<name>/proposal.md    ← kopiert
<outDir>/changes/<name>/design.md      ← kopiert
<outDir>/changes/<name>/tasks.md       ← kopiert
<outDir>/changes/archive/<name>/...    ← kopiert
<outDir>/index.md                      ← generiert (Übersichtsseite)
<outDir>/specs/index.md                ← generiert
<outDir>/changes/index.md              ← generiert
```
*Warum*: Vorhersehbare, intuitive URL-Struktur.

**D3 — `generateOpenSpecSidebar()` ist synchron und liest das Dateisystem**
Wie `generateSidebarFromSpec()` bisher: synchrone Funktion, die direkt aus `process.cwd()` liest und für `defineConfig()` geeignet ist.
*Warum*: VitePress evaluiert die Config vor den Vite-Plugin-Hooks.

**D4 — `.openspec.yaml` wird für Change-Metadaten ausgelesen**
`created` und `status`-Felder werden für die Index-Seiten und Sidebar-Sortierung verwendet.
*Warum*: Gibt dem Nutzer sinnvolle Zusatzinformationen (Datum, Status) ohne manuelle Pflege.

**D5 — Archive-Changes als eingeklappte Sidebar-Gruppe**
Archivierte Changes (`changes/archive/`) werden als separate `collapsed: true`-Gruppe dargestellt.
*Warum*: Hält die Sidebar übersichtlich; ältere Changes sind zugänglich aber nicht prominent.

## Risks / Trade-offs

**[Timing-Problem beim VitePress-Build]** VitePress scannt Seiten vor `configResolved` → Dateien müssen bereits existieren oder der Plugin muss einen frühen Hook nutzen. → Gleicher Ansatz wie bisher: Dateien werden in `configResolved` geschrieben. Beim ersten Build müssen die Dateien bereits im `openspec/`-Ordner liegen (was für bestehende Projekte immer der Fall ist).

**[Delta-Specs in Changes vs. Canonical Specs]** Delta-Specs in `changes/<name>/specs/` haben andere Semantik als Canonical Specs. → Für jetzt werden nur Canonical Specs aus `openspec/specs/` und die Top-Level-Artefakte (proposal, design, tasks) der Changes gerendert. Delta-Specs innerhalb von Changes werden nicht separat gerendert (sie sind Teil des Change-Kontexts).

**[Breaking Change der öffentlichen API]** `generateSidebarFromSpec` und die OpenAPI-Typen entfallen. → Versionsbump auf 0.2.0; Migration in CHANGELOG dokumentieren.

## Migration Plan

1. `src/types.ts`, `src/utils.ts`, `src/plugin.ts` vollständig ersetzen
2. `src/index.ts` Exports aktualisieren
3. Tests ersetzen (neue Fixture: miniaturisierter `openspec/`-Ordner)
4. `docs/.vitepress/config.ts` auf neue API umstellen
5. Version auf 0.2.0 bumpen

## Open Questions

- Sollen Delta-Specs (innerhalb von Changes) in einer späteren Iteration auch gerendert werden?
- Soll `openspecPlugin()` optional Datei-Watching für Hot-Reload im Dev-Modus unterstützen?
