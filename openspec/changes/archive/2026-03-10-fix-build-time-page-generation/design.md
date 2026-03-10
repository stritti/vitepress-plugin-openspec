## Context

VitePress wertet `config.ts` synchron aus, bevor es den `srcDir` nach `.md`-Dateien scannt. Das ist das entscheidende Timing-Fenster: Code, der bei der Auswertung von `config.ts` läuft (d.h. auf Modul-Ebene, nicht in einem Hook), läuft BEVOR VitePress die Routen registriert.

**Korrekte Reihenfolge nach dem Fix:**
```
1. VitePress wertet config.ts aus
   → generateOpenSpecPages() wird aufgerufen (synchron)
   → Seiten werden auf Disk geschrieben
2. VitePress scannt srcDir → findet generierte .md-Dateien → registriert Routen ✓
3. Vite initialisiert Plugins
4. configResolved / buildStart → kein nochmaliges Schreiben nötig (Dev: Watcher)
5. VitePress baut alle Seiten → /openspec/* → 200 ✓
```

## Goals / Non-Goals

**Goals:**
- Seiten existieren IMMER bevor VitePress scannt (erster Build, CI, fresh checkout)
- Kein zweiter Build-Lauf nötig
- Funktioniert in jedem Projekt, unabhängig von der Verzeichnisstruktur
- Dev-Server und Hot Reload bleiben funktionsfähig

**Non-Goals:**
- Virtuelles Dateisystem / In-Memory-Seiten (komplexer, andere Probleme)
- Automatisches Aufrufen ohne Code-Änderung in config.ts

## Decisions

**`generateOpenSpecPages()` als synchrone Funktion exportieren**
VitePress wertet config.ts synchron aus. Eine synchrone Funktion passt nahtlos in diesen Ablauf. `fs.writeFileSync` ist ausreichend — die Menge der Dateien ist gering.

**`srcDir` als Pflicht-Option in `generateOpenSpecPages()`**
Die Funktion muss wissen, wohin sie schreibt. Da sie außerhalb eines Vite-Kontexts aufgerufen wird, kann sie `resolvedConfig.root` nicht nutzen. Default: `process.cwd()` (funktioniert wenn VitePress aus dem docs-Verzeichnis gestartet wird). Explizit übergeben via `path.resolve(__dirname, '..')`.

**`openspec()` Vite-Plugin bleibt, nutzt intern `generateOpenSpecPages()`**
Im Dev-Server führt `configResolved` weiterhin eine Neugenerierung aus (für Hot Reload bei Änderungen am openspec-Ordner). Im Build wird `generateOpenSpecPages()` bereits in config.ts aufgerufen — der configResolved-Aufruf ist dann idempotent (überschreibt mit identischem Inhalt).

**Gleiche Optionen für beide APIs**
`generateOpenSpecPages(options)` und `openspec(options)` nutzen `OpenSpecPluginOptions` mit denselben Feldern: `specDir`, `outDir`, `srcDir`.

## Risks / Trade-offs

- **Breaking Change für Nutzer**: Bisherige config.ts-Setups ohne `generateOpenSpecPages()`-Aufruf werden in CI weiterhin 404 zeigen. Muss klar dokumentiert werden.
- **Synchrones I/O in config.ts**: Leicht ungewöhnlich, aber etabliertes Muster (z.B. `tailwindcss` liest Konfigs synchron). Dateimenge ist gering, kein Performance-Problem.
- **`srcDir` Default**: `process.cwd()` ist korrekt, wenn VitePress aus dem docs-Verzeichnis gestartet wird. Wenn aus Root gestartet, muss `srcDir` explizit angegeben werden — im JSDoc dokumentieren.
