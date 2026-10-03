import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { resolveOptions } from '../lib/options.js'
import { isPluginGeneratedFile, isSourceArtifactEvent } from '../lib/watch.js'

const root = path.resolve('/project/docs')

describe('watch event filtering', () => {
  const separate = resolveOptions({ specDir: '/project/openspec', outDir: 'openspec', srcDir: root })
  const overlapping = resolveOptions({ specDir: '/project/docs/openspec', outDir: 'openspec', srcDir: root })

  it('accepts spec and change source files', () => {
    expect(isSourceArtifactEvent(separate, path.resolve('/project/openspec/specs/auth/spec.md'))).toBe(true)
    expect(isSourceArtifactEvent(separate, path.resolve('/project/openspec/changes/add-login/proposal.md'))).toBe(true)
    expect(isSourceArtifactEvent(separate, path.resolve('/project/openspec/changes/add-login/.openspec.yaml'))).toBe(true)
  })

  it('ignores files outside the openspec directory', () => {
    expect(isSourceArtifactEvent(separate, path.resolve('/project/docs/index.md'))).toBe(false)
    expect(isSourceArtifactEvent(separate, path.resolve('/project/other/x.md'))).toBe(false)
  })

  it('ignores plugin-generated files inside the output tree', () => {
    expect(isSourceArtifactEvent(separate, path.join(separate.absoluteOutDir, 'index.md'))).toBe(false)
    expect(isSourceArtifactEvent(separate, path.join(separate.absoluteOutDir, 'specs', 'index.md'))).toBe(false)
    expect(isSourceArtifactEvent(separate, path.join(separate.absoluteOutDir, '.openspec-manifest.json'))).toBe(false)
  })

  it('still accepts genuine source edits under the zero-config overlapping layout', () => {
    // specDir === absoluteOutDir: source spec.md must trigger regeneration
    expect(isSourceArtifactEvent(overlapping, path.join(overlapping.specDir, 'specs', 'auth', 'spec.md'))).toBe(true)
    // while generated index pages do not
    expect(isSourceArtifactEvent(overlapping, path.join(overlapping.absoluteOutDir, 'specs', 'auth', 'index.md'))).toBe(false)
    expect(isPluginGeneratedFile(overlapping, path.join(overlapping.absoluteOutDir, 'specs', 'auth', 'index.md'))).toBe(true)
  })

  it('accepts artifact add/remove events under the overlapping layout', () => {
    // Artifacts are only "generated" when the output tree is separate from
    // the source tree; in the overlapping layout they are source files.
    expect(isSourceArtifactEvent(overlapping, path.join(overlapping.specDir, 'changes', 'add-login', 'proposal.md'))).toBe(true)
    expect(isPluginGeneratedFile(overlapping, path.join(overlapping.specDir, 'changes', 'add-login', 'proposal.md'))).toBe(false)
  })

  it('treats artifact copies as generated in the separate layout', () => {
    expect(isPluginGeneratedFile(separate, path.join(separate.absoluteOutDir, 'changes', 'add-login', 'proposal.md'))).toBe(true)
    expect(isSourceArtifactEvent(separate, path.join(separate.absoluteOutDir, 'changes', 'add-login', 'proposal.md'))).toBe(false)
  })
})
