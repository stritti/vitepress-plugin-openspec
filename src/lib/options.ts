import path from 'node:path'
import type { OpenSpecPluginOptions } from '../types.js'
import { detectSrcDir, findOpenSpecDir } from './detect.js'

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
 * Defaults are zero-config: `srcDir` falls back to the auto-detected
 * VitePress source directory (the folder containing `.vitepress`), and
 * `specDir` falls back to the nearest ancestor `openspec/` folder,
 * skipping generated output recognized by its marker.
 *
 * @throws if `outDir` is not a relative path inside `srcDir`.
 */
export function resolveOptions(
  userOptions: OpenSpecPluginOptions = {},
  fallbackSrcDir?: string,
): ResolvedOptions {
  // Normalize Windows-style separators so traversal variants like
  // "nested\\..\\..\\outside" cannot bypass the containment check.
  const outDir = (userOptions.outDir ?? 'openspec').replace(/\\/g, '/')
  if (path.isAbsolute(outDir) || outDir === '' || outDir === '.' || outDir === '..') {
    throw new Error(
      `[vitepress-plugin-openspec] Invalid outDir "${outDir}": it must be a relative path inside the VitePress srcDir.`,
    )
  }
  const srcDir = userOptions.srcDir ?? fallbackSrcDir ?? detectSrcDir(process.cwd()) ?? process.cwd()
  const absoluteSrcDir = path.resolve(srcDir)
  const absoluteOutDir = path.resolve(absoluteSrcDir, outDir)
  const rel = path.relative(absoluteSrcDir, absoluteOutDir)
  if (rel.startsWith('..') || path.isAbsolute(rel) || rel === '') {
    throw new Error(
      `[vitepress-plugin-openspec] Invalid outDir "${outDir}": it resolves outside the VitePress srcDir.`,
    )
  }
  const specDir = userOptions.specDir ?? findOpenSpecDir(process.cwd(), absoluteOutDir) ?? './openspec'
  return {
    specDir: path.resolve(specDir),
    outDir,
    srcDir: absoluteSrcDir,
    absoluteOutDir,
  }
}
