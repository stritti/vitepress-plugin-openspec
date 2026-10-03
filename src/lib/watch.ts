import path from 'node:path'
import type { ResolvedOptions } from './options.js'

// File basenames the plugin itself writes into the output tree.
const GENERATED_BASENAMES = new Set([
  'index.md',
  '.gitignore',
  '.openspec-manifest.json',
  'proposal.md',
  'design.md',
  'tasks.md',
])

/**
 * Whether a file inside the output tree was written by this plugin (as
 * opposed to an openspec source artifact that happens to live in the same
 * tree when specDir and outDir overlap). Only plugin-generated files are
 * excluded from watch-triggered regeneration, so genuine source edits
 * under the zero-config layout still regenerate pages.
 */
export function isPluginGeneratedFile(options: ResolvedOptions, absFile: string): boolean {
  const relToOut = path.relative(options.absoluteOutDir, absFile)
  if (relToOut.startsWith('..') || path.isAbsolute(relToOut)) return false
  return GENERATED_BASENAMES.has(path.basename(absFile))
}

/**
 * Whether a watch event for this file should trigger regeneration of the
 * openspec pages. True for openspec source files (including
 * `.openspec.yaml`), false for files the plugin itself generated.
 */
export function isSourceArtifactEvent(options: ResolvedOptions, absFile: string): boolean {
  const relToSpec = path.relative(options.specDir, absFile)
  if (relToSpec.startsWith('..') || path.isAbsolute(relToSpec)) return false
  return !isPluginGeneratedFile(options, absFile)
}
