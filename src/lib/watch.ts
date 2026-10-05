import path from 'node:path'
import type { ResolvedOptions } from './options.js'
import { readManifest } from './generator.js'

// Basenames of files the plugin always writes into the output tree.
const ALWAYS_GENERATED_BASENAMES = new Set(['index.md', '.gitignore', '.openspec-manifest.json'])
// Artifact copies the plugin writes when the output tree is distinct
// from the openspec source tree.
const ARTIFACT_BASENAMES = new Set(['proposal.md', 'design.md', 'tasks.md'])

const generatedDestCache = new Map<string, Set<string>>()

/**
 * Resolved absolute destinations of all files recorded in the previous
 * run's manifest — i.e. paths the plugin itself wrote. Only these exact
 * destinations count as generated, never a basename heuristic, so real
 * source artifacts that live inside the output tree remain watchable.
 */
function generatedDestinations(absoluteOutDir: string): Set<string> {
  const cached = generatedDestCache.get(absoluteOutDir)
  if (cached) return cached
  const set = new Set<string>()
  for (const entry of readManifest(absoluteOutDir)) {
    set.add(path.resolve(absoluteOutDir, entry))
  }
  generatedDestCache.set(absoluteOutDir, set)
  return set
}

/**
 * Invalidates the cached manifest destinations after a regeneration wrote
 * a new manifest.
 */
export function invalidateGeneratedDestinations(absoluteOutDir: string): void {
  generatedDestCache.delete(absoluteOutDir)
}

function isInside(parent: string, child: string): boolean {
  const rel = path.relative(parent, child)
  return !(rel.startsWith('..') || path.isAbsolute(rel))
}

/**
 * Layout classification for the overlapping specDir/outDir cases:
 * - 'equal': specDir and outDir are the same directory
 * - 'out-inside-spec': outDir is a proper child of specDir
 * - 'spec-inside-out': specDir is a proper child of outDir
 * - 'disjoint': no overlap
 */
export type LayoutRelation = 'equal' | 'out-inside-spec' | 'spec-inside-out' | 'disjoint'

export function classifyLayout(options: ResolvedOptions): LayoutRelation {
  if (options.specDir === options.absoluteOutDir) return 'equal'
  if (isInside(options.specDir, options.absoluteOutDir)) return 'out-inside-spec'
  if (isInside(options.absoluteOutDir, options.specDir)) return 'spec-inside-out'
  return 'disjoint'
}

/**
 * Whether a file inside the output tree was written by this plugin (as
 * opposed to an openspec source artifact that happens to live in the same
 * tree when specDir and outDir overlap).
 *
 * Layout rules (generated destinations never coincide with source files):
 * - 'equal': the shared tree only receives index.md/.gitignore/manifest
 *   from the plugin; artifact-named files are sources.
 * - 'out-inside-spec' / 'disjoint': the plugin writes artifact copies into
 *   the output tree; every known basename inside it is generated.
 * - 'spec-inside-out': source files live inside the output tree; files
 *   inside specDir are sources, only files outside it are generated.
 */
export function isPluginGeneratedFile(options: ResolvedOptions, absFile: string): boolean {
  if (!isInside(options.absoluteOutDir, absFile)) return false
  // Only exact destinations recorded in the generation manifest are
  // generated output — never a basename heuristic. This keeps real source
  // artifacts inside an overlapping output tree watchable.
  if (generatedDestinations(options.absoluteOutDir).has(path.resolve(absFile))) return true
  const base = path.basename(absFile)
  switch (classifyLayout(options)) {
    case 'equal':
      return ALWAYS_GENERATED_BASENAMES.has(base)
    case 'out-inside-spec':
      // The output tree is nested inside specDir, so a basename match can
      // hit real source files too. Only the exact destinations recorded
      // in the manifest (checked above) plus the always-generated
      // top-level markers count as plugin output.
      return ALWAYS_GENERATED_BASENAMES.has(base) && !isInside(options.specDir, absFile)
    case 'disjoint':
      return ALWAYS_GENERATED_BASENAMES.has(base) || ARTIFACT_BASENAMES.has(base)
    case 'spec-inside-out':
      return !isInside(options.specDir, absFile) &&
        (ALWAYS_GENERATED_BASENAMES.has(base) || ARTIFACT_BASENAMES.has(base))
  }
}

/**
 * Whether a watch event for this file should trigger regeneration of the
 * openspec pages. True for openspec source files (including
 * `.openspec.yaml`), false for files the plugin itself generated.
 */
export function isSourceArtifactEvent(options: ResolvedOptions, absFile: string): boolean {
  if (!isInside(options.specDir, absFile)) return false
  return !isPluginGeneratedFile(options, absFile)
}
