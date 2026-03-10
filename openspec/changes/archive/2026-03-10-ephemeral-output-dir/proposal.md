## Why

Der Plugin generiert zur Build-Zeit Markdown-Dateien in `docs/<outDir>/` (z.B. `docs/openspec/`). Dieser Ordner wird aktuell ins Repository eingecheckt, obwohl er rein generiert ist und bei jedem Build neu erzeugt wird. Das erzeugt unnötigen Commit-Lärm und kann zu Merge-Konflikten führen. Außerdem verwirrt es die OpenSpec-CLI, die den generierten Ordner fälschlicherweise als echtes OpenSpec-Verzeichnis erkennt.

## What Changes

- `docs/openspec/` (generierter Output-Ordner) wird aus dem Repository entfernt und zu `.gitignore` hinzugefügt
- Der Plugin-Output-Ordner wird generisch zu `.gitignore` hinzugefügt, sodass auch andere `outDir`-Konfigurationen abgedeckt sind
- Der bestehende `docs/openspec/`-Ordner wird aus dem Git-Index entfernt (`git rm --cached -r`)

## Capabilities

### New Capabilities

*(keine)*

### Modified Capabilities

*(keine — reine Konfigurationsänderung, kein Verhaltensänderung am Plugin-Code)*

## Impact

- `.gitignore` — neuer Eintrag für den generierten Output-Ordner
- `docs/openspec/` — aus Git-Tracking entfernt (Dateien bleiben lokal nach Build)
- Kein Code-Change am Plugin selbst
