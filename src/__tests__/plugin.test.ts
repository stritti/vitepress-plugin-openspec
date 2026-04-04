import { describe, it, expect, vi, afterEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { generateOpenSpecPages, withOpenSpec } from '../plugin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE = path.join(__dirname, 'fixture/openspec')

describe('generateOpenSpecPages', () => {
  let tmpDir: string

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true })
    }
  })

  it('writes root index.md to srcDir/outDir/', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir })
    expect(fs.existsSync(path.join(tmpDir, 'docs', 'index.md'))).toBe(true)
  })

  it('writes specs index and spec pages', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir })
    expect(fs.existsSync(path.join(tmpDir, 'docs', 'specs', 'index.md'))).toBe(true)
    expect(fs.existsSync(path.join(tmpDir, 'docs', 'specs', 'auth-flow', 'index.md'))).toBe(true)
  })

  it('writes changes index', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir })
    expect(fs.existsSync(path.join(tmpDir, 'docs', 'changes', 'index.md'))).toBe(true)
  })

  it('root index contains openspec.dev link', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir })
    const content = fs.readFileSync(path.join(tmpDir, 'docs', 'index.md'), 'utf-8')
    expect(content).toContain('openspec.dev')
  })

  it('writes .gitignore into the output directory', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir })
    const gitignorePath = path.join(tmpDir, 'docs', '.gitignore')
    expect(fs.existsSync(gitignorePath)).toBe(true)
    const content = fs.readFileSync(gitignorePath, 'utf-8')
    expect(content).toContain('*')
    expect(content).toContain('!.gitignore')
  })

  it('overwrites an existing .gitignore on re-run (idempotent)', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir })
    const gitignorePath = path.join(tmpDir, 'docs', '.gitignore')
    fs.writeFileSync(gitignorePath, 'stale content', 'utf-8')
    generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir })
    const content = fs.readFileSync(gitignorePath, 'utf-8')
    expect(content).not.toContain('stale content')
    expect(content).toContain('!.gitignore')
  })

  it('warns and writes no files when specDir does not exist', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      generateOpenSpecPages({ specDir: '/non/existent', outDir: 'docs', srcDir: tmpDir })
      expect(fs.existsSync(path.join(tmpDir, 'docs'))).toBe(false)
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('vitepress-plugin-openspec'))
    } finally {
      warnSpy.mockRestore()
    }
  })
})

describe('withOpenSpec', () => {
  let tmpDir: string

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true })
    }
  })

  it('returns config with openspec Vite plugin added', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    const result = withOpenSpec({}, { specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir }) as Record<string, unknown>
    const plugins = (result.vite as { plugins: { name: string }[] }).plugins
    expect(plugins.some((p) => p.name === 'vitepress-plugin-openspec')).toBe(true)
  })

  it('calls generateOpenSpecPages (output files exist)', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    withOpenSpec({} as Record<string, unknown>, { specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir })
    expect(fs.existsSync(path.join(tmpDir, 'docs', 'index.md'))).toBe(true)
  })

  it('prepends nav entry when themeConfig.nav exists', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    const result = withOpenSpec(
      { themeConfig: { nav: [{ text: 'Home', link: '/' }] } },
      { specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir },
    )
    const nav = (result.themeConfig as { nav: { text: string }[] }).nav
    expect(nav[0].text).not.toBe('Home')
    expect(nav[1]).toEqual({ text: 'Home', link: '/' })
  })

  it('injects sidebar under the correct key', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    const result = withOpenSpec(
      { themeConfig: { sidebar: {} } },
      { specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir },
    )
    const sidebar = (result.themeConfig as { sidebar: Record<string, unknown> }).sidebar
    expect(sidebar['/docs/']).toBeDefined()
  })

  it('skips nav injection when nav: false', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    const result = withOpenSpec(
      { themeConfig: { nav: [{ text: 'Home', link: '/' }] } },
      { specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir, nav: false },
    )
    const nav = (result.themeConfig as { nav: { text: string }[] }).nav
    expect(nav).toHaveLength(1)
    expect(nav[0]).toEqual({ text: 'Home', link: '/' })
  })

  it('skips sidebar injection when sidebar: false', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    const result = withOpenSpec(
      { themeConfig: { sidebar: {} } },
      { specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir, sidebar: false },
    )
    const sidebar = (result.themeConfig as { sidebar: Record<string, unknown> }).sidebar
    expect(Object.keys(sidebar)).toHaveLength(0)
  })

  it('preserves existing Vite plugins', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    const myPlugin = { name: 'my-plugin' }
    const result = withOpenSpec(
      { vite: { plugins: [myPlugin] } },
      { specDir: FIXTURE, outDir: 'docs', srcDir: tmpDir },
    )
    const plugins = (result.vite as { plugins: { name: string }[] }).plugins
    expect(plugins.some((p) => p.name === 'my-plugin')).toBe(true)
    expect(plugins.some((p) => p.name === 'vitepress-plugin-openspec')).toBe(true)
  })

  it('does not prepend nav entry when specDir is missing', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'))
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const result = withOpenSpec(
        { themeConfig: { nav: [{ text: 'Home', link: '/' }] } },
        { specDir: '/non/existent', outDir: 'docs', srcDir: tmpDir },
      )
      const nav = (result.themeConfig as { nav: { text: string }[] }).nav
      expect(nav).toHaveLength(1)
      expect(nav[0]).toEqual({ text: 'Home', link: '/' })
    } finally {
      warnSpy.mockRestore()
    }
  })
})
