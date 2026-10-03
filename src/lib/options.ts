import path from 'node:path'
import type { OpenSpecPluginOptions } from '../types.js'

/**
 * Fully resolved and validated plugin options.
 */
export interface ResolvedOptions {
  /** Absolute path to the openspec/ directory */
  specDir: string
  /** Output directory name relative to srcDir (e.g. "openspec") */
  outDir: string
  /** Absolute VitePress source directory */
  srcDir: string
  /** Absolute output directory inside srcDir */
  absoluteOutDir: string
}

/**
 * Centralizes default resolution for all plugin entry points so
 * `generateOpenSpecPages()`, `openspec()` and `withOpenSpec()` behave
 * identically.
 *
 * @throws if `outDir` is not a relative path inside `srcDir`.
 */
export function resolveOptions(
  userOptions: OpenSpecPluginOptions = {},
  fallbackSrcDir?: string,
): ResolvedOptions {
  const specDir = userOptions.specDir ?? './openspec'
  const outDir = userOptions.outDir ?? 'openspec'
  const srcDir = userOptions.srcDir ?? fallbackSrcDir ?? process.cwd()
  if (path.isAbsolute(outDir) || outDir === '' || outDir === '.' || outDir === '..' || outDir.startsWith('../')) {
    throw new Error(
      `[vitepress-plugin-openspec] Invalid outDir "${outDir}": it must be a relative path inside the VitePress srcDir.`,
    )
  }
  return {
    specDir: path.resolve(specDir),
    outDir,
    srcDir: path.resolve(srcDir),
    absoluteOutDir: path.resolve(srcDir, outDir),
  }
}
