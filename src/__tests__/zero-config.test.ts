import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { generateOpenSpecPages, withOpenSpec } from '../plugin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE = path.join(__dirname, 'fixture/openspec')

function copyFixture(dest: string): void {
  fs.mkdirSync(dest, { recursive: true })
  fs.cpSync(FIXTURE, path.join(dest, 'openspec'), { recursive: true })
}

describe('zero-config auto-detection', () => {
  let tmpDir: string
  const originalCwd = process.cwd()

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-zeroconfig-'))
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('detects openspec dir by walking up and srcDir via docs/.vitepress', () => {
    const docsDir = path.join(tmpDir, 'docs')
    fs.mkdirSync(path.join(docsDir, '.vitepress'), { recursive: true })
    copyFixture(tmpDir)
    process.chdir(path.join(docsDir, '.vitepress'))

    expect(generateOpenSpecPages()).toBe(true)
    expect(fs.existsSync(path.join(docsDir, 'openspec', 'index.md'))).toBe(true)
    expect(fs.existsSync(path.join(docsDir, 'openspec', 'specs', 'index.md'))).toBe(true)
    expect(fs.existsSync(path.join(tmpDir, 'openspec', 'specs', 'index.md'))).toBe(false)
  })

  it('does not mistake generated openspec output for the spec source folder', () => {
    const docsDir = path.join(tmpDir, 'docs')
    fs.mkdirSync(path.join(docsDir, '.vitepress'), { recursive: true })
    copyFixture(tmpDir)
    process.chdir(path.join(docsDir, '.vitepress'))

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    try {
      generateOpenSpecPages()
      generateOpenSpecPages()
    } finally {
      logSpy.mockRestore()
    }

    const specSource = fs.readFileSync(
      path.join(tmpDir, 'openspec', 'specs', 'auth-flow', 'spec.md'),
      'utf-8',
    )
    expect(specSource).not.toContain('# auth-flow')
  })

  it('withOpenSpec converts an array sidebar to object form and injects the openspec section', () => {
    const docsDir = path.join(tmpDir, 'docs')
    fs.mkdirSync(path.join(docsDir, '.vitepress'), { recursive: true })
    copyFixture(tmpDir)
    process.chdir(path.join(docsDir, '.vitepress'))

    const result = withOpenSpec({
      themeConfig: {
        sidebar: [{ text: 'Guide', link: '/guide' }],
      },
    })

    const sidebar = (result.themeConfig as unknown as { sidebar: Record<string, unknown[]> }).sidebar
    expect(Array.isArray(sidebar)).toBe(false)
    expect(sidebar['/']).toEqual([{ text: 'Guide', link: '/guide' }])
    expect(sidebar['/openspec/']).toBeDefined()
  })

  it('withOpenSpec works zero-config from docs/.vitepress', () => {
    const docsDir = path.join(tmpDir, 'docs')
    fs.mkdirSync(path.join(docsDir, '.vitepress'), { recursive: true })
    copyFixture(tmpDir)
    process.chdir(path.join(docsDir, '.vitepress'))

    const result = withOpenSpec({ themeConfig: {} })

    expect(fs.existsSync(path.join(docsDir, 'openspec', 'index.md'))).toBe(true)
    expect(fs.existsSync(path.join(tmpDir, 'openspec', 'index.md'))).toBe(false)
    const sidebar = (result.themeConfig as { sidebar: Record<string, unknown> }).sidebar
    expect(sidebar['/openspec/']).toBeDefined()
    const nav = (result.themeConfig as { nav: { text: string }[] }).nav
    expect(nav).toBeDefined()
  })

  it('warns instead of failing when no openspec source exists (incremental adoption)', () => {
    const docsDir = path.join(tmpDir, 'docs')
    fs.mkdirSync(docsDir, { recursive: true })
    process.chdir(docsDir)

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(generateOpenSpecPages()).toBe(false)
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not found'))
      expect(errorSpy).not.toHaveBeenCalled()
    } finally {
      warnSpy.mockRestore()
      errorSpy.mockRestore()
    }
  })

  it('detects an openspec root that contains only archived changes', () => {
    const docsDir = path.join(tmpDir, 'docs')
    fs.mkdirSync(path.join(docsDir, '.vitepress'), { recursive: true })
    fs.mkdirSync(path.join(tmpDir, 'openspec', 'changes', 'archive', '2026-01-01-old'), {
      recursive: true,
    })
    fs.writeFileSync(
      path.join(tmpDir, 'openspec', 'changes', 'archive', '2026-01-01-old', 'proposal.md'),
      '# Old',
    )
    process.chdir(path.join(docsDir, '.vitepress'))

    expect(generateOpenSpecPages()).toBe(true)
    expect(fs.existsSync(path.join(docsDir, 'openspec', 'changes', 'index.md'))).toBe(true)
  })

  it('recognizes config.yml as an openspec root marker', () => {
    const docsDir = path.join(tmpDir, 'docs')
    fs.mkdirSync(path.join(docsDir, '.vitepress'), { recursive: true })
    fs.mkdirSync(path.join(tmpDir, 'openspec'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'openspec', 'config.yml'), 'schema: 1\n')
    process.chdir(path.join(docsDir, '.vitepress'))

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    try {
      expect(generateOpenSpecPages()).toBe(true)
      expect(fs.existsSync(path.join(docsDir, 'openspec', 'index.md'))).toBe(true)
    } finally {
      logSpy.mockRestore()
    }
  })

  it('writes the generated marker so interrupted runs are recognizable as output', () => {
    const docsDir = path.join(tmpDir, 'docs')
    fs.mkdirSync(path.join(docsDir, '.vitepress'), { recursive: true })
    fs.mkdirSync(path.join(tmpDir, 'openspec', 'specs', 'auth-flow'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'openspec', 'specs', 'auth-flow', 'spec.md'), '# Auth')
    // Simulate an interrupted previous run: archive output exists, no marker
    fs.mkdirSync(path.join(docsDir, 'openspec', 'changes', 'archive', '2026-01-01-old'), {
      recursive: true,
    })
    process.chdir(path.join(docsDir, '.vitepress'))

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    try {
      expect(generateOpenSpecPages()).toBe(true)
      const marker = fs.readFileSync(path.join(docsDir, 'openspec', '.gitignore'), 'utf-8')
      expect(marker).toContain('Generated by vitepress-plugin-openspec')
    } finally {
      logSpy.mockRestore()
    }
  })

  it('treats marker-less archive output as generated when a real source exists above', () => {
    const docsDir = path.join(tmpDir, 'docs')
    fs.mkdirSync(path.join(docsDir, '.vitepress'), { recursive: true })
    fs.mkdirSync(path.join(tmpDir, 'openspec', 'specs', 'auth-flow'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'openspec', 'specs', 'auth-flow', 'spec.md'), '# Auth')
    // Simulate interrupted run: output archive without marker
    fs.mkdirSync(path.join(docsDir, 'openspec', 'changes', 'archive', '2026-01-01-old'), {
      recursive: true,
    })
    process.chdir(path.join(docsDir, '.vitepress'))

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(generateOpenSpecPages()).toBe(true)
      const gen = fs.readFileSync(path.join(docsDir, 'openspec', 'specs', 'index.md'), 'utf-8')
      expect(gen).toContain('auth-flow')
    } finally {
      logSpy.mockRestore()
      errorSpy.mockRestore()
    }
  })

  it('warns and skips when multiple .vitepress sites are ambiguous', () => {
    fs.mkdirSync(path.join(tmpDir, 'site-a', '.vitepress'), { recursive: true })
    fs.mkdirSync(path.join(tmpDir, 'site-b', '.vitepress'), { recursive: true })
    fs.mkdirSync(path.join(tmpDir, 'openspec'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'openspec', 'project.md'), '# Project')
    process.chdir(tmpDir)

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      expect(generateOpenSpecPages()).toBe(false)
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Multiple VitePress source directories'),
      )
    } finally {
      warnSpy.mockRestore()
    }
  })

  it('prefers docs/ when multiple .vitepress sites exist but docs/ is one of them', () => {
    fs.mkdirSync(path.join(tmpDir, 'docs', '.vitepress'), { recursive: true })
    fs.mkdirSync(path.join(tmpDir, 'site-b', '.vitepress'), { recursive: true })
    fs.mkdirSync(path.join(tmpDir, 'openspec', 'specs', 'auth-flow'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'openspec', 'specs', 'auth-flow', 'spec.md'), '# Auth')
    process.chdir(tmpDir)

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    try {
      expect(generateOpenSpecPages()).toBe(true)
      expect(fs.existsSync(path.join(tmpDir, 'docs', 'openspec', 'index.md'))).toBe(true)
      expect(fs.existsSync(path.join(tmpDir, 'site-b', 'openspec'))).toBe(false)
    } finally {
      logSpy.mockRestore()
    }
  })
})

describe('withOpenSpec zero-config edge cases', () => {
  let tmpDir: string
  const originalCwd = process.cwd()

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-zeroconfig-with-'))
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('honors the wrapped config srcDir when resolving output', () => {
    fs.mkdirSync(path.join(tmpDir, '.vitepress'), { recursive: true })
    copyFixture(tmpDir)
    process.chdir(tmpDir)

    const result = withOpenSpec({ srcDir: 'content', themeConfig: {} })
    void result
    expect(fs.existsSync(path.join(tmpDir, 'content', 'openspec', 'index.md'))).toBe(true)
    expect(fs.existsSync(path.join(tmpDir, 'openspec', 'index.md'))).toBe(false)
  })

  it('warns only once about ambiguous source directories in withOpenSpec', () => {
    fs.mkdirSync(path.join(tmpDir, 'site-a', '.vitepress'), { recursive: true })
    fs.mkdirSync(path.join(tmpDir, 'site-b', '.vitepress'), { recursive: true })
    process.chdir(tmpDir)

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      withOpenSpec({ themeConfig: {} })
      const calls = warnSpy.mock.calls.filter(([msg]) =>
        String(msg).includes('Multiple VitePress source directories'),
      )
      expect(calls.length).toBe(1)
    } finally {
      warnSpy.mockRestore()
    }
  })

  it('withOpenSpec skips integration when source detection is ambiguous', () => {
    fs.mkdirSync(path.join(tmpDir, 'site-a', '.vitepress'), { recursive: true })
    fs.mkdirSync(path.join(tmpDir, 'site-b', '.vitepress'), { recursive: true })
    fs.mkdirSync(path.join(tmpDir, 'openspec', 'specs', 'auth-flow'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'openspec', 'specs', 'auth-flow', 'spec.md'), '# Auth')
    process.chdir(tmpDir)

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const result = withOpenSpec({ themeConfig: { nav: [] } })
      const themeConfig = result.themeConfig as Record<string, unknown>
      expect((themeConfig.nav as unknown[]).length).toBe(0)
      expect(fs.existsSync(path.join(tmpDir, 'openspec', 'index.md'))).toBe(false)
      expect(fs.existsSync(path.join(tmpDir, 'site-a', 'openspec'))).toBe(false)
      expect(fs.existsSync(path.join(tmpDir, 'site-b', 'openspec'))).toBe(false)
    } finally {
      warnSpy.mockRestore()
    }
  })

  it('normalizes an array sidebar even when generation is skipped (sidebar: false)', () => {
    process.chdir(tmpDir)
    const result = withOpenSpec(
      { themeConfig: { sidebar: [{ text: 'Guide', link: '/guide' }] } },
      { sidebar: false, specDir: '/non/existent' },
    )
    const sidebar = (result.themeConfig as { sidebar: Record<string, unknown> }).sidebar
    expect(Array.isArray(sidebar)).toBe(false)
    expect(sidebar['/']).toEqual([{ text: 'Guide', link: '/guide' }])
    expect(sidebar['/openspec/']).toBeUndefined()
  })

  it('normalizes an array sidebar even when the source is missing', () => {
    process.chdir(tmpDir)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const result = withOpenSpec(
        { themeConfig: { sidebar: [{ text: 'Guide', link: '/guide' }] } },
        { specDir: '/non/existent' },
      )
      const sidebar = (result.themeConfig as { sidebar: Record<string, unknown> }).sidebar
      expect(Array.isArray(sidebar)).toBe(false)
      expect(sidebar['/']).toEqual([{ text: 'Guide', link: '/guide' }])
      expect(sidebar['/openspec/']).toBeUndefined()
    } finally {
      warnSpy.mockRestore()
    }
  })

  it('returns false instead of throwing when the output directory is unwritable', () => {
    const docsDir = path.join(tmpDir, 'docs')
    fs.mkdirSync(path.join(docsDir, '.vitepress'), { recursive: true })
    fs.mkdirSync(path.join(tmpDir, 'openspec', 'specs', 'auth-flow'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'openspec', 'specs', 'auth-flow', 'spec.md'), '# Auth')
    // make the output location a file so mkdir fails
    fs.writeFileSync(path.join(docsDir, 'openspec'), 'not a directory')
    process.chdir(path.join(docsDir, '.vitepress'))

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(generateOpenSpecPages()).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to'))
    } finally {
      errorSpy.mockRestore()
    }
  })
})

describe('monorepo source selection', () => {
  let tmpDir: string
  const originalCwd = process.cwd()

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-monorepo-'))
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('prefers the nearest weak source over a strong ancestor in a monorepo', () => {
    const pkgDir = path.join(tmpDir, 'packages', 'my-pkg')
    const docsDir = path.join(pkgDir, 'docs')
    fs.mkdirSync(path.join(docsDir, '.vitepress'), { recursive: true })
    // local archive-only source in the package
    fs.mkdirSync(path.join(pkgDir, 'openspec', 'changes', 'archive', '2026-01-01-local'), {
      recursive: true,
    })
    fs.writeFileSync(
      path.join(pkgDir, 'openspec', 'changes', 'archive', '2026-01-01-local', 'proposal.md'),
      '# Local',
    )
    // repo-root source with a strong marker
    fs.mkdirSync(path.join(tmpDir, 'openspec', 'specs', 'root-cap'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'openspec', 'specs', 'root-cap', 'spec.md'), '# Root')
    process.chdir(path.join(docsDir, '.vitepress'))

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    try {
      expect(generateOpenSpecPages()).toBe(true)
      const changesIndex = fs.readFileSync(
        path.join(docsDir, 'openspec', 'changes', 'index.md'),
        'utf-8',
      )
      expect(changesIndex).toContain('2026-01-01-local')
      expect(changesIndex).not.toContain('Root')
    } finally {
      logSpy.mockRestore()
    }
  })
})
