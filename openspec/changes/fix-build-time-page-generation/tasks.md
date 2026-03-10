## 1. Types (src/types.ts)

- [x] 1.1 `srcDir?: string` zu `OpenSpecPluginOptions` hinzufügen (default: `process.cwd()`)

## 2. Plugin-Kern (src/plugin.ts)

- [x] 2.1 Datei-Schreib-Logik aus `configResolved` in eine exportierte Funktion `generateOpenSpecPages(options)` extrahieren
- [x] 2.2 `generateOpenSpecPages()` synchron implementieren (kein async): nutzt die bestehenden `writeFile`/`copyFile`-Helfer
- [x] 2.3 `srcDir` aus Options auflösen: `options.srcDir ?? process.cwd()`
- [x] 2.4 `configResolved`-Hook vereinfachen: ruft intern `generateOpenSpecPages()` auf (für Dev-Server / Hot Reload)

## 3. Exports (src/index.ts)

- [x] 3.1 `generateOpenSpecPages` aus `./plugin.js` re-exportieren

## 4. Demo-Site (docs/.vitepress/config.ts)

- [x] 4.1 `generateOpenSpecPages` aus `vitepress-plugin-openspec` importieren
- [x] 4.2 `generateOpenSpecPages({ specDir, outDir: 'openspec', srcDir: path.resolve(__dirname, '..') })` am Anfang der Datei aufrufen (vor `defineConfig`)

## 5. Tests (src/__tests__/)

- [x] 5.1 Smoke-Test für `generateOpenSpecPages()`: schreibt Dateien in ein temp-Verzeichnis, prüft dass index.md existiert

## 6. Verify

- [x] 6.1 `bun run build` — Plugin-Build erfolgreich
- [x] 6.2 `bun test` — alle Tests grün (29/29)
- [x] 6.3 `bun run docs:build` (einmaliger Aufruf) — Build erfolgreich ohne vorherige Dateien
