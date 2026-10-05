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
  return fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-arch-test-'))
}

describe('resolveOptions', () => {
  it('resolves defaults and absolute paths', () => {
    const o = resolveOptions({})
    expect(o.outDir).toBe('openspec')
    expect(path.isAbsolute(o.specDir)).toBe(true)
    expect(path.isAbsolute(o.srcDir)).toBe(true)
    expect(o.absoluteOutDir).toBe(path.join(o.srcDir, 'openspec'))
  })

  it('throws for absolute outDir', () => {
    expect(() => resolveOptions({ outDir: '/etc' })).toThrow(/outDir/)
  })

  it('throws for outDir escaping srcDir', () => {
    expect(() => resolveOptions({ outDir: '../outside' })).toThrow(/outDir/)
  })

  it('prefers fallback srcDir over cwd', () => {
    const o = resolveOptions({}, '/some/fallback')
    expect(o.srcDir).toBe(path.resolve('/some/fallback'))
  })
})

describe('stale output cleanup', () => {
  it('removes generated files that no longer exist in openspec/', () => {
    const dir = tmpDir()
    try {
      generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: dir })
      const staleSpec = path.join(dir, 'docs', 'specs', 'removed-spec', 'index.md')
      fs.mkdirSync(path.dirname(staleSpec), { recursive: true })
      fs.writeFileSync(staleSpec, '# stale', 'utf-8')
      // Simulate a file that was generated in a previous run and whose
      // openspec source has since been removed
      const manifestPath = path.join(dir, 'docs', '.openspec-manifest.json')
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as string[]
      manifest.push(path.join('specs', 'removed-spec', 'index.md'))
      fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf-8')
      generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: dir })
      expect(fs.existsSync(staleSpec)).toBe(false)
      expect(fs.existsSync(path.join(dir, 'docs', 'specs', 'removed-spec'))).toBe(false)
      // still-valid pages survive the cleanup
      expect(fs.existsSync(path.join(dir, 'docs', 'specs', 'auth-flow', 'index.md'))).toBe(true)
    } finally {
      fs.rmSync(dir, { recursive: true })
    }
  })

  it('writes a manifest listing all generated files', () => {
    const dir = tmpDir()
    try {
      generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: dir })
      const manifestPath = path.join(dir, 'docs', '.openspec-manifest.json')
      expect(fs.existsSync(manifestPath)).toBe(true)
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as string[]
      expect(manifest).toContain('index.md')
      expect(manifest).toContain('specs/index.md')
      expect(manifest).toContain(path.join('specs', 'auth-flow', 'index.md'))
    } finally {
      fs.rmSync(dir, { recursive: true })
    }
  })
})

describe('withOpenSpec option validation', () => {
  it('returns the config unchanged when outDir is invalid', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const result = withOpenSpec(
        { themeConfig: { nav: [{ text: 'Home', link: '/' }] } },
        { specDir: FIXTURE, outDir: '../evil', srcDir: tmpDir() },
      ) as { themeConfig: { nav: unknown[] }; vite?: unknown }
      expect(result.themeConfig.nav).toHaveLength(1)
      expect(result.vite).toBeUndefined()
    } finally {
      warnSpy.mockRestore()
    }
  })

  it('supports a custom navText', () => {
    const dir = tmpDir()
    try {
      const result = withOpenSpec(
        {},
        { specDir: FIXTURE, outDir: 'docs', srcDir: dir, navText: 'Specs' },
      ) as { themeConfig: { nav: { text: string; link: string }[] } }
      expect(result.themeConfig.nav[0]).toEqual({ text: 'Specs', link: '/docs/' })
    } finally {
      fs.rmSync(dir, { recursive: true })
    }
  })

  it('does not inject an empty sidebar section when openspec dir is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const dir = tmpDir()
    try {
      const result = withOpenSpec(
        { themeConfig: { sidebar: {} } },
        { specDir: '/non/existent', outDir: 'docs', srcDir: dir },
      ) as { themeConfig: { sidebar: Record<string, unknown> } }
      expect(Object.keys(result.themeConfig.sidebar)).toHaveLength(0)
    } finally {
      warnSpy.mockRestore()
      fs.rmSync(dir, { recursive: true })
    }
  })
})
