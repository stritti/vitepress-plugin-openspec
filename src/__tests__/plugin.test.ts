import { describe, it, expect, afterEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { generateOpenSpecPages } from '../plugin.js'

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
})
