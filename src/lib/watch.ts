import path from 'node:path'
import type { ResolvedOptions } from './options.js'

// Basenames of files the plugin writes into the output tree. Artifact
// copies (proposal.md, design.md, tasks.md) are only written when the
// output tree is distinct from the openspec source tree.
const ALWAYS_GENERATED_BASENAMES = new Set(['index.md', '.gitignore', '.openspec-manifest.json'])
const ARTIFACT_BASENAMES = new Set(['proposal.md', 'design.md', 'tasks.md'])

function isOutputInsideSpecDir(options: ResolvedOptions): boolean {
  const rel = path.relative(options.specDir, options.absoluteOutDir)
  return !(rel.startsWith('..') || path.isAbsolute(rel))
}

/**
 * Whether a file inside the output tree was written by this plugin (as
 * opposed to an openspec source artifact that happens to live in the same
 * tree when specDir and outDir overlap). In the overlapping layout the
 * plugin never copies artifacts onto themselves, so artifact-named files
 * there are source files.
 */
export function isPluginGeneratedFile(options: ResolvedOptions, absFile: string): boolean {
  const relToOut = path.relative(options.absoluteOutDir, absFile)
  if (relToOut.startsWith('..') || path.isAbsolute(relToOut)) return false
  const base = path.basename(absFile)
  if (ALWAYS_GENERATED_BASENAMES.has(base)) return true
  return ARTIFACT_BASENAMES.has(base) && !isOutputInsideSpecDir(options)
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
