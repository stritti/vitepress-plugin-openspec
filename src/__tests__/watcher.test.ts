import { describe, it, expect } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { resolveOptions } from '../lib/options.js'
import { classifyLayout, isPluginGeneratedFile, isSourceArtifactEvent, invalidateGeneratedDestinations } from '../lib/watch.js'

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

  it('classifies the four layout relations', () => {
    expect(classifyLayout(separate)).toBe('disjoint')
    expect(classifyLayout(overlapping)).toBe('equal')
    const nestedOut = resolveOptions({ specDir: path.join(root, 'openspec'), outDir: 'openspec/site', srcDir: root })
    expect(classifyLayout(nestedOut)).toBe('out-inside-spec')
    const nestedSpec = resolveOptions({ specDir: path.join(root, 'openspec', 'source'), outDir: 'openspec', srcDir: root })
    expect(classifyLayout(nestedSpec)).toBe('spec-inside-out')
  })

  it('keeps nested source artifacts visible when specDir is inside outDir', () => {
    const reverse = resolveOptions({ specDir: path.join(root, 'openspec', 'source'), outDir: 'openspec', srcDir: root })
    // Source artifact inside specDir (and thus inside outDir): still a source
    const srcArtifact = path.join(reverse.specDir, 'changes', 'add-login', 'proposal.md')
    expect(isSourceArtifactEvent(reverse, srcArtifact)).toBe(true)
    expect(isPluginGeneratedFile(reverse, srcArtifact)).toBe(false)
    // Generated copy outside specDir: generated
    const genCopy = path.join(reverse.absoluteOutDir, 'changes', 'add-login', 'proposal.md')
    expect(isPluginGeneratedFile(reverse, genCopy)).toBe(true)
    expect(isSourceArtifactEvent(reverse, genCopy)).toBe(false)
    // Generated index page: generated
    expect(isPluginGeneratedFile(reverse, path.join(reverse.absoluteOutDir, 'index.md'))).toBe(true)
  })

  it('treats artifact copies as generated when outDir is a proper child of specDir', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-nested-'))
    try {
      const nested = resolveOptions({ specDir: path.join(dir, 'openspec'), outDir: 'openspec/site', srcDir: dir })
      expect(nested.specDir).toBe(path.join(dir, 'openspec'))
      expect(nested.absoluteOutDir).toBe(path.join(dir, 'openspec', 'site'))
      const copy = path.join(nested.absoluteOutDir, 'changes', 'add-login', 'proposal.md')
      // Without a manifest record the basename heuristic must NOT classify
      // it (a real source could live there) — only manifest entries do.
      expect(isPluginGeneratedFile(nested, copy)).toBe(false)
      // ... but once the manifest records the copy it is generated output
      fs.mkdirSync(nested.absoluteOutDir, { recursive: true })
      fs.writeFileSync(path.join(nested.absoluteOutDir, '.openspec-manifest.json'), JSON.stringify(['changes/add-login/proposal.md']))
      invalidateGeneratedDestinations(nested.absoluteOutDir)
      expect(isPluginGeneratedFile(nested, copy)).toBe(true)
      expect(isSourceArtifactEvent(nested, copy)).toBe(false)
      // the original source file is still a source
      expect(isSourceArtifactEvent(nested, path.join(nested.specDir, 'changes', 'add-login', 'proposal.md'))).toBe(true)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('manifest-based generated-file detection', () => {
  it('treats a nested source artifact not present in the manifest as a source', () => {
    // specDir nested below absoluteOutDir; no manifest exists yet
    const reverse = resolveOptions({ specDir: path.join(root, 'openspec', 'source'), outDir: 'openspec', srcDir: root })
    const srcArtifact = path.join(reverse.specDir, 'changes', 'add-login', 'proposal.md')
    expect(isPluginGeneratedFile(reverse, srcArtifact)).toBe(false)
    expect(isSourceArtifactEvent(reverse, srcArtifact)).toBe(true)
  })

  it('treats an artifact-basename file in a nested output as a source when it is not a manifest destination', () => {
    // specDir encompasses the canonical changes dir: docs/openspec with outDir openspec/changes
    const nested = resolveOptions({ specDir: path.join(root, 'openspec'), outDir: 'openspec/changes', srcDir: root })
    const srcArtifact = path.join(nested.specDir, 'changes', 'add-login', 'proposal.md')
    expect(isSourceArtifactEvent(nested, srcArtifact)).toBe(true)
  })

  it('classifies recorded manifest destinations as generated even inside overlapping layouts', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-manifest-'))
    try {
      const nested = resolveOptions({ specDir: path.join(dir, 'openspec'), outDir: 'openspec/changes', srcDir: dir })
      fs.mkdirSync(nested.absoluteOutDir, { recursive: true })
      fs.writeFileSync(path.join(nested.absoluteOutDir, '.openspec-manifest.json'), JSON.stringify(['changes/add-login/proposal.md']))
      invalidateGeneratedDestinations(nested.absoluteOutDir)
      const copy = path.join(nested.absoluteOutDir, 'changes', 'add-login', 'proposal.md')
      expect(isPluginGeneratedFile(nested, copy)).toBe(true)
      expect(isSourceArtifactEvent(nested, copy)).toBe(false)
      // the real source file at the same basename stays watchable
      const srcArtifact = path.join(nested.specDir, 'changes', 'add-login', 'proposal.md')
      expect(isSourceArtifactEvent(nested, srcArtifact)).toBe(true)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('generated destination cache', () => {
  it('invalidates cached manifest destinations', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-watch-'))
    try {
      fs.writeFileSync(path.join(dir, '.openspec-manifest.json'), JSON.stringify(['index.md']))
      const nested = resolveOptions({ specDir: path.join(dir, 'openspec'), outDir: 'out', srcDir: dir })
      fs.mkdirSync(nested.absoluteOutDir, { recursive: true })
      fs.writeFileSync(path.join(nested.absoluteOutDir, '.openspec-manifest.json'), JSON.stringify(['index.md']))
      expect(isPluginGeneratedFile(nested, path.join(nested.absoluteOutDir, 'index.md'))).toBe(true)
      fs.rmSync(path.join(nested.absoluteOutDir, '.openspec-manifest.json'))
      invalidateGeneratedDestinations(nested.absoluteOutDir)
      // index.md still matches the ALWAYS_GENERATED basename, so use an artifact name
      fs.writeFileSync(path.join(nested.absoluteOutDir, '.openspec-manifest.json'), JSON.stringify(['changes/x/proposal.md']))
      expect(isPluginGeneratedFile(nested, path.join(nested.absoluteOutDir, 'index.md'))).toBe(true)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
})
