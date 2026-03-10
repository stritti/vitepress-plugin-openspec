## Context

Der Plugin schreibt in `configResolved` alle generierten Markdown-Seiten in `<srcDir>/<outDir>/`. Bei der Default-Konfiguration (`outDir: 'openspec'`) landen diese in `docs/openspec/`. Dieser Ordner ist aktuell nicht in `.gitignore` eingetragen und wird daher mitgetrackt.

Das verursacht zwei Probleme:
1. **Commit-Lärm**: Jede Änderung an `openspec/` erzeugt Änderungen in `docs/openspec/`
2. **CLI-Verwirrung**: Die OpenSpec-CLI findet `docs/openspec/` und verwendet es fälschlicherweise als Quell-Verzeichnis

## Goals / Non-Goals

**Goals:**
- `docs/<outDir>/` aus Git-Tracking entfernen
- Generisch formulieren, sodass beliebige `outDir`-Werte abgedeckt sind

**Non-Goals:**
- Änderungen am Plugin-Code
- Änderungen an der Build-Reihenfolge oder dem Timing-Verhalten

## Decisions

**`.gitignore` auf Docs-Ebene, nicht auf Root-Ebene**
Der generierte Ordner liegt unter `docs/`. Ein Eintrag `docs/openspec/` im Root-`.gitignore` ist präzise. Alternativ wäre ein `docs/.gitignore` möglich, aber eine Root-Datei ist übersichtlicher.

**Generischer Eintrag statt hartcodiertem `docs/openspec/`**
Da `outDir` konfigurierbar ist, wird der Eintrag im Kommentar erklärt — der konkrete Pfad `docs/openspec/` ist aber ausreichend für dieses Projekt, da `outDir` in `docs/.vitepress/config.ts` fest auf `'openspec'` steht.

**`git rm --cached` statt Dateien löschen**
Die Dateien sollen lokal nach dem Build weiter existieren (VitePress braucht sie zum Rendern). Nur das Git-Tracking wird entfernt.

## Risks / Trade-offs

- **Erster Checkout ohne Build**: Nach einem frischen `git clone` existiert `docs/openspec/` nicht. Der Build muss einmal laufen, bevor VitePress die Seiten kennt (bekanntes Timing-Problem, unabhängig von diesem Change).
- **CI**: Der GitHub Actions Workflow baut den Plugin und dann die Docs — der generierte Ordner entsteht zur Build-Zeit. Kein Problem.
