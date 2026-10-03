import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateOpenSpecPages, withOpenSpec } from '../plugin.js'
import { resolveOptions } from '../lib/options.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE = path.join(__dirname, 'fixture/openspec')

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-review-test-'))
}

describe('outDir traversal validation (review: normalized outDir escapes srcDir)', () => {
  it('rejects outDir with traversal after an initial segment', () => {
    expect(() => resolveOptions({ outDir: 'nested/../../outside' })).toThrow(/outDir/)
    expect(() => resolveOptions({ outDir: 'a/b/../../../c' })).toThrow(/outDir/)
  })

  it('rejects backslash traversal variants', () => {
    expect(() => resolveOptions({ outDir: 'nested\\..\\..\\outside' })).toThrow(/outDir/)
  })

  it('accepts nested outDir that stays inside srcDir', () => {
    const o = resolveOptions({ outDir: 'nested/deep/docs' })
    expect(o.outDir).toBe('nested/deep/docs')
    expect(o.absoluteOutDir).toBe(path.join(o.srcDir, 'nested', 'deep', 'docs'))
  })
})

describe('manifest robustness (review: traversal entries / invalid manifest)', () => {
  it('never deletes files outside the output directory via traversal entries', () => {
    const dir = tmpDir()
    try {
      generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: dir })
      const victim = path.join(dir, 'victim.txt')
      fs.writeFileSync(victim, 'keep me', 'utf-8')
      const manifestPath = path.join(dir, 'docs', '.openspec-manifest.json')
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as string[]
      manifest.push('../../victim.txt')
      fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf-8')
      generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: dir })
      expect(fs.existsSync(victim)).toBe(true)
    } finally {
      fs.rmSync(dir, { recursive: true })
    }
  })

  it('recovers from a corrupt manifest and re-enables cleanup', () => {
    const dir = tmpDir()
    try {
      generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: dir })
      const manifestPath = path.join(dir, 'docs', '.openspec-manifest.json')
      fs.writeFileSync(manifestPath, '{truncated json', 'utf-8')
      generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: dir })
      // manifest was rewritten with a valid file list
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as string[]
      expect(manifest).toContain('index.md')
      // and cleanup works again afterwards
      manifest.push(path.join('specs', 'gone', 'index.md'))
      fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf-8')
      const stale = path.join(dir, 'docs', 'specs', 'gone', 'index.md')
      fs.mkdirSync(path.dirname(stale), { recursive: true })
      fs.writeFileSync(stale, '# stale', 'utf-8')
      generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: dir })
      expect(fs.existsSync(stale)).toBe(false)
    } finally {
      fs.rmSync(dir, { recursive: true })
    }
  })
})

describe('overlapping specDir/outDir (review: source files must survive)', () => {
  it('never records or deletes openspec source files when outDir is inside specDir', () => {
    const dir = tmpDir()
    try {
      // Copy fixture so we can mutate it safely
      const specDir = path.join(dir, 'openspec')
      fs.cpSync(FIXTURE, specDir, { recursive: true })
      generateOpenSpecPages({ specDir, outDir: 'openspec', srcDir: dir })
      const manifestPath = path.join(dir, 'openspec', '.openspec-manifest.json')
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as string[]
      // Source artifacts are never recorded where they would be
      // self-copies; only genuinely generated files are listed.
      expect(manifest).not.toContain(path.join('changes', 'add-login', 'proposal.md'))
      expect(manifest).not.toContain(path.join('changes', 'fix-bug', 'design.md'))
      // Generated index pages ARE tracked so stale cleanup keeps working
      expect(manifest).toContain(path.join('changes', 'add-login', 'index.md'))
      // Original change artifact survives even after the change is removed
      const proposal = path.join(specDir, 'changes', 'add-login', 'proposal.md')
      expect(fs.existsSync(proposal)).toBe(true)
      fs.rmSync(path.join(specDir, 'changes', 'add-login', '.openspec.yaml'))
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        generateOpenSpecPages({ specDir, outDir: 'openspec', srcDir: dir })
      } finally {
        warnSpy.mockRestore()
      }
      // Source artifact survives stale cleanup
      expect(fs.existsSync(proposal)).toBe(true)
      // Its generated index page was cleaned up as stale
      expect(fs.existsSync(path.join(specDir, 'changes', 'add-login', 'index.md'))).toBe(false)
    } finally {
      fs.rmSync(dir, { recursive: true })
    }
  })
})

describe('watcher guard (review: no ENOENT when specDir is missing)', () => {
  it('withOpenSpec leaves themeConfig untouched and does not throw for missing specDir', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const dir = tmpDir()
    try {
      const result = withOpenSpec(
        { themeConfig: { sidebar: {} } },
        { specDir: path.join(dir, 'no-such-openspec'), outDir: 'docs', srcDir: dir },
      ) as { themeConfig: { sidebar: Record<string, unknown> } }
      expect(Object.keys(result.themeConfig.sidebar)).toHaveLength(0)
    } finally {
      warnSpy.mockRestore()
      fs.rmSync(dir, { recursive: true })
    }
  })
})
