## Why

Der Plugin generiert Markdown-Seiten im `configResolved`-Hook — aber VitePress hat zu diesem Zeitpunkt den `srcDir` bereits nach `.md`-Dateien gescannt und die Routen registriert. Die generierten Seiten werden erst nach dem Scan geschrieben und sind deshalb in VitePress' Routing nicht vorhanden. Lokal funktioniert es nur, weil die Dateien vom vorherigen Build noch auf der Disk liegen. In CI (GitHub Actions) gibt es keinen vorherigen Build, daher werden die Seiten nicht gefunden und liefern 404.

Das Timing-Problem:
```
1. VitePress wertet config.ts aus
2. VitePress scannt srcDir nach .md-Dateien → registriert Routen   ← Seiten fehlen
3. Vite initialisiert Plugins
4. configResolved-Hook → Plugin schreibt Dateien                    ← zu spät
5. VitePress baut registrierte Seiten → /openspec/* → 404
```

## What Changes

- Neue exportierte Funktion `generateOpenSpecPages(options)`: synchron, schreibt alle generierten Seiten auf Disk — für Aufruf am Anfang von `config.ts`, bevor VitePress scannt
- `OpenSpecPluginOptions` um `srcDir`-Feld erweitern: gibt an, wo die generierten Seiten abgelegt werden (VitePress srcDir, z.B. `docs/`)
- Vite-Plugin-Funktion `openspec()` bleibt bestehen: nutzt intern `generateOpenSpecPages()` für Dev-Server (Hot Reload) — ruft aber auch beim Start synchron auf, um Seiten bereitzustellen
- Demo-Site `docs/.vitepress/config.ts` aktualisieren: `generateOpenSpecPages()` am Anfang der Datei aufrufen

## Capabilities

### New Capabilities

*(keine neuen Capability-Specs — plugin-interne API-Erweiterung)*

### Modified Capabilities

*(keine spec-level-Änderungen)*

## Impact

- `src/plugin.ts` — `generateOpenSpecPages()` extrahieren und exportieren; `openspec()` ruft es intern auf
- `src/types.ts` — `OpenSpecPluginOptions.srcDir` hinzufügen
- `src/index.ts` — `generateOpenSpecPages` exportieren
- `docs/.vitepress/config.ts` — `generateOpenSpecPages()` am Anfang aufrufen
- Nutzer des Plugins: müssen `generateOpenSpecPages()` in ihrer `config.ts` aufrufen (Breaking Change, dokumentieren)
