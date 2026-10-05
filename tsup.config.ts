import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // TypeScript 7 no longer ships the JS compiler API that tsup's bundled
  // rollup-plugin-dts requires; declarations are emitted by `tsc` instead.
  dts: false,
  clean: true,
  sourcemap: true,
  external: ['vite', 'vitepress'],
  treeshake: true,
})
