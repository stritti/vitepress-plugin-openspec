## 1. Types

- [x] 1.1 Add `WithOpenSpecOptions` interface to `src/types.ts` (extends `OpenSpecPluginOptions` with `nav?: boolean` and `sidebar?: boolean`)
- [x] 1.2 Export `WithOpenSpecOptions` from `src/index.ts`

## 2. Implementation

- [x] 2.1 Implement `withOpenSpec(config, options?)` in `src/plugin.ts`
- [x] 2.2 Merge Vite plugin into `config.vite.plugins` (preserving existing plugins)
- [x] 2.3 Prepend nav entry to `config.themeConfig.nav` when `nav !== false` and themeConfig exists
- [x] 2.4 Inject sidebar section under `/${outDir}/` key when `sidebar !== false` and sidebar is an object
- [x] 2.5 Export `withOpenSpec` from `src/index.ts`

## 3. Tests

- [x] 3.1 Test: `withOpenSpec({})` calls `generateOpenSpecPages` and returns config with Vite plugin
- [x] 3.2 Test: nav entry is prepended when `themeConfig.nav` exists
- [x] 3.3 Test: sidebar section is injected under the correct key
- [x] 3.4 Test: `nav: false` skips nav injection
- [x] 3.5 Test: `sidebar: false` skips sidebar injection
- [x] 3.6 Test: existing Vite plugins are preserved

## 4. Documentation

- [x] 4.1 Update README to show `withOpenSpec` as the primary usage example
- [x] 4.2 Move existing verbose API to a "Advanced / manual setup" section
- [x] 4.3 Update JSDoc on `withOpenSpec` with example snippet showing other plugins alongside openspec
- [x] 4.4 Add usage note to README: "other Vite plugins go into `vite.plugins` as usual — `withOpenSpec` appends to the array without replacing it"
