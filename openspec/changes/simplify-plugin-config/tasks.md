## 1. Types

- [ ] 1.1 Add `WithOpenSpecOptions` interface to `src/types.ts` (extends `OpenSpecPluginOptions` with `nav?: boolean` and `sidebar?: boolean`)
- [ ] 1.2 Export `WithOpenSpecOptions` from `src/index.ts`

## 2. Implementation

- [ ] 2.1 Implement `withOpenSpec(config, options?)` in `src/plugin.ts`
- [ ] 2.2 Merge Vite plugin into `config.vite.plugins` (preserving existing plugins)
- [ ] 2.3 Prepend nav entry to `config.themeConfig.nav` when `nav !== false` and themeConfig exists
- [ ] 2.4 Inject sidebar section under `/${outDir}/` key when `sidebar !== false` and sidebar is an object
- [ ] 2.5 Export `withOpenSpec` from `src/index.ts`

## 3. Tests

- [ ] 3.1 Test: `withOpenSpec({})` calls `generateOpenSpecPages` and returns config with Vite plugin
- [ ] 3.2 Test: nav entry is prepended when `themeConfig.nav` exists
- [ ] 3.3 Test: sidebar section is injected under the correct key
- [ ] 3.4 Test: `nav: false` skips nav injection
- [ ] 3.5 Test: `sidebar: false` skips sidebar injection
- [ ] 3.6 Test: existing Vite plugins are preserved

## 4. Documentation

- [ ] 4.1 Update README to show `withOpenSpec` as the primary usage example
- [ ] 4.2 Move existing verbose API to a "Advanced / manual setup" section
- [ ] 4.3 Update JSDoc on `withOpenSpec` with example snippet showing other plugins alongside openspec
- [ ] 4.4 Add usage note to README: "other Vite plugins go into `vite.plugins` as usual — `withOpenSpec` appends to the array without replacing it"
