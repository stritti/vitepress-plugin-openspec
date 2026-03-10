## Why

The plugin generates Markdown files at build time into `docs/<outDir>/` (e.g. `docs/openspec/`). This folder is currently checked into the repository even though it is purely generated and recreated on every build. This causes unnecessary commit noise and can lead to merge conflicts. It also confuses the OpenSpec CLI, which incorrectly recognises the generated folder as a real OpenSpec directory.

## What Changes

- `docs/openspec/` (generated output folder) is removed from the repository and added to `.gitignore`
- The plugin output folder is added to `.gitignore` generically so that other `outDir` configurations are also covered
- The existing `docs/openspec/` folder is removed from the Git index (`git rm --cached -r`)

## Capabilities

### New Capabilities

*(none)*

### Modified Capabilities

*(none — pure configuration change, no behaviour change in the plugin code)*

## Impact

- `.gitignore` — new entry for the generated output folder
- `docs/openspec/` — removed from Git tracking (files remain locally after build)
- No code change to the plugin itself
