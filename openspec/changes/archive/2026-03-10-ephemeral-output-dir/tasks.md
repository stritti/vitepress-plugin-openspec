## 1. .gitignore

- [x] 1.1 `docs/openspec/` zu `.gitignore` hinzufügen (generierter VitePress-Output)

## 2. Git-Tracking entfernen

- [x] 2.1 `git rm --cached -r docs/openspec/` ausführen, um den Ordner aus dem Git-Index zu entfernen (Dateien bleiben lokal erhalten)

## 3. Verify

- [x] 3.1 `git status` prüfen — `docs/openspec/` soll nicht mehr als tracked erscheinen
- [x] 3.2 `bun run docs:build` ausführen — Build muss weiterhin erfolgreich sein
