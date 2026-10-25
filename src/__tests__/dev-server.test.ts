import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import type { Plugin } from 'vite'
import { openspec } from '../plugin.js'
import { resolveOptions } from '../lib/options.js'
import {
  createScheduler,
  readNavigationSignature,
  updateNavigationInMemory,
} from '../lib/dev-server.js'

interface WatcherLike {
  add: (p: string) => void
  on: (event: string, cb: (f: string) => void) => void
  off: (event: string, cb: (f: string) => void) => void
}

function createServerStub() {
  const listeners = new Map<string, Set<(f: string) => void>>()
  const onceClose: (() => void)[] = []
  return {
    watcher: {
      add: vi.fn(),
      on: vi.fn((event: string, cb: (f: string) => void) => {
        if (!listeners.has(event)) listeners.set(event, new Set())
        listeners.get(event)!.add(cb)
      }),
      off: vi.fn((event: string, cb: (f: string) => void) => {
        listeners.get(event)?.delete(cb)
      }),
    } as WatcherLike,
    ws: { send: vi.fn() },
    restart: vi.fn(),
    httpServer: {
      once: vi.fn((event: string, cb: () => void) => {
        if (event === 'close') onceClose.push(cb)
      }),
      removeListener: vi.fn(),
    },
    config: { root: '/project/docs' as string, vitepress: undefined as unknown },
    emit(event: 'change' | 'add' | 'unlink', file: string) {
      for (const cb of listeners.get(event) ?? []) cb(file)
    },
    close() {
      for (const cb of onceClose) cb()
    },
  }
}

function configResolvedCall(plugin: Plugin, server: ReturnType<typeof createServerStub>, srcDir: string) {
  const hook = plugin.configResolved as (config: unknown) => void
  hook({ root: srcDir })
  const configureServer = plugin.configureServer as (server: unknown) => void
  configureServer(server)
}

describe('openspec vite plugin lifecycle', () => {
  let tmpDir: string
  let specDir: string
  let srcDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-dev-'))
    specDir = path.join(tmpDir, 'openspec')
    srcDir = path.join(tmpDir, 'docs')
    fs.mkdirSync(path.join(specDir, 'specs', 'auth'), { recursive: true })
    fs.writeFileSync(path.join(specDir, 'specs', 'auth', 'spec.md'), '# Auth\n\n### Requirement: Login\n\nUser can log in.\n')
    fs.mkdirSync(srcDir, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it('wires watchers, registers close handler, and detaches on httpServer close', () => {
    const plugin = openspec({ specDir, srcDir, outDir: 'openspec' })
    const server = createServerStub()
    configResolvedCall(plugin, server, srcDir)
    expect(server.watcher.add).toHaveBeenCalledWith(specDir)
    expect(server.httpServer.once).toHaveBeenCalledWith('close', expect.any(Function))
    server.close()
    expect(server.watcher.off).toHaveBeenCalledWith('change', expect.any(Function))
    expect(server.watcher.off).toHaveBeenCalledWith('add', expect.any(Function))
    expect(server.watcher.off).toHaveBeenCalledWith('unlink', expect.any(Function))
  })

  it('does not register watchers when the openspec directory is missing', () => {
    fs.rmSync(specDir, { recursive: true })
    const plugin = openspec({ specDir, srcDir, outDir: 'openspec' })
    const server = createServerStub()
    configResolvedCall(plugin, server, srcDir)
    expect(server.watcher.add).not.toHaveBeenCalled()
  })

  it('re-regenerates pages on a source content change and sends a full-reload', () => {
    vi.useFakeTimers()
    const plugin = openspec({ specDir, srcDir, outDir: 'openspec' })
    const server = createServerStub()
    configResolvedCall(plugin, server, srcDir)
    const specFile = path.join(specDir, 'specs', 'auth', 'spec.md')
    fs.appendFileSync(specFile, '\nMore content\n')
    server.emit('change', specFile)
    vi.advanceTimersByTime(200)
    expect(server.ws.send).toHaveBeenCalledWith({ type: 'full-reload' })
    expect(server.restart).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('restarts the server (not just reload) when navigation changes', () => {
    vi.useFakeTimers()
    const plugin = openspec({ specDir, srcDir, outDir: 'openspec' })
    const server = createServerStub()
    configResolvedCall(plugin, server, srcDir)
    // Adding a new spec folder changes the sidebar -> navigation restart path
    fs.mkdirSync(path.join(specDir, 'specs', 'billing'), { recursive: true })
    fs.writeFileSync(path.join(specDir, 'specs', 'billing', 'spec.md'), '# Billing\n')
    server.emit('add', path.join(specDir, 'specs', 'billing', 'spec.md'))
    vi.advanceTimersByTime(200)
    expect(server.restart).toHaveBeenCalledWith(true)
    vi.useRealTimers()
  })

  it('ignores watch events for files outside the openspec directory', () => {
    vi.useFakeTimers()
    const plugin = openspec({ specDir, srcDir, outDir: 'openspec' })
    const server = createServerStub()
    configResolvedCall(plugin, server, srcDir)
    server.emit('change', path.join(srcDir, 'index.md'))
    vi.advanceTimersByTime(200)
    expect(server.ws.send).not.toHaveBeenCalled()
    expect(server.restart).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('ignores events for its own generated output files', () => {
    vi.useFakeTimers()
    const plugin = openspec({ specDir, srcDir, outDir: 'openspec' })
    const server = createServerStub()
    configResolvedCall(plugin, server, srcDir)
    const generated = path.join(srcDir, 'openspec', 'index.md')
    server.emit('change', generated)
    vi.advanceTimersByTime(200)
    expect(server.ws.send).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('detaches listeners in closeBundle so consecutive builds do not accumulate them', () => {
    const plugin = openspec({ specDir, srcDir, outDir: 'openspec' })
    const server = createServerStub()
    configResolvedCall(plugin, server, srcDir)
    ;(plugin.closeBundle as () => void)()
    expect(server.watcher.off).toHaveBeenCalledWith('change', expect.any(Function))
  })
})

describe('readNavigationSignature', () => {
  let tmpDir: string
  afterEach(() => fs.rmSync(tmpDir, { recursive: true, force: true }))

  it('fingerprint changes when a spec is added', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-sig-'))
    const options = resolveOptions({ specDir: path.join(tmpDir, 'openspec'), srcDir: tmpDir, outDir: 'openspec' })
    fs.mkdirSync(path.join(options.specDir, 'specs', 'a'), { recursive: true })
    fs.writeFileSync(path.join(options.specDir, 'specs', 'a', 'spec.md'), '# A\n')
    const before = readNavigationSignature(options)
    fs.mkdirSync(path.join(options.specDir, 'specs', 'b'), { recursive: true })
    fs.writeFileSync(path.join(options.specDir, 'specs', 'b', 'spec.md'), '# B\n')
    const after = readNavigationSignature(options)
    expect(before).not.toEqual(after)
  })

  it('returns "unreadable" when specDir does not exist', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-sig-'))
    const options = resolveOptions({ specDir: path.join(tmpDir, 'openspec'), srcDir: tmpDir, outDir: 'openspec' })
    expect(readNavigationSignature(options)).toBe('unreadable')
  })
})

describe('updateNavigationInMemory', () => {
  let tmpDir: string
  afterEach(() => fs.rmSync(tmpDir, { recursive: true, force: true }))

  function setup() {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-nav-'))
    const specDir = path.join(tmpDir, 'openspec')
    fs.mkdirSync(path.join(specDir, 'specs', 'auth'), { recursive: true })
    fs.writeFileSync(path.join(specDir, 'specs', 'auth', 'spec.md'), '# Auth\n')
    const options = resolveOptions({ specDir, srcDir: tmpDir, outDir: 'openspec' })
    const themeConfig: Record<string, unknown> = { sidebar: {} }
    const server = {
      config: { vitepress: { site: { themeConfig } } },
      ws: { send: vi.fn() },
      restart: vi.fn(),
      watcher: { add: vi.fn(), on: vi.fn(), off: vi.fn() },
      httpServer: { once: vi.fn(), removeListener: vi.fn() },
    }
    return { options, themeConfig, server }
  }

  it('injects the generated sidebar under its route key', () => {
    const { options, themeConfig, server } = setup()
    updateNavigationInMemory(options, server as never, true)
    const sidebar = themeConfig.sidebar as Record<string, unknown[]>
    expect(Array.isArray(sidebar['/openspec/'])).toBe(true)
  })

  it('uses the legacy vitepress.themeConfig location as fallback', () => {
    const { options, server } = setup()
    const legacyThemeConfig: Record<string, unknown> = {}
    ;(server.config as { vitepress: unknown }).vitepress = { themeConfig: legacyThemeConfig }
    updateNavigationInMemory(options, server as never, true)
    expect(legacyThemeConfig.sidebar).toBeDefined()
  })

  it('does nothing when the plugin does not own the sidebar entry', () => {
    const { options, themeConfig, server } = setup()
    updateNavigationInMemory(options, server as never, false)
    expect(themeConfig.sidebar).toEqual({})
  })

  it('removes the sidebar entry when nothing is generated', () => {
    const { options, themeConfig, server } = setup()
    const sidebar = themeConfig.sidebar as Record<string, unknown>
    sidebar['/openspec/'] = [{ text: 'stale', link: '/x' }]
    fs.rmSync(options.specDir, { recursive: true, force: true })
    updateNavigationInMemory(options, server as never, true)
    expect(sidebar['/openspec/']).toBeUndefined()
  })

  it('does nothing when no themeConfig is present', () => {
    const { options, server } = setup()
    ;(server.config as { vitepress: unknown }).vitepress = {}
    expect(() => updateNavigationInMemory(options, server as never, true)).not.toThrow()
  })
})

describe('createScheduler', () => {
  it('debounces bursts into one regeneration', async () => {
    vi.useFakeTimers()
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-sched-'))
    const options = resolveOptions({ specDir: path.join(tmpDir, 'openspec'), srcDir: tmpDir, outDir: 'openspec' })
    const server = { ws: { send: vi.fn() }, watcher: { add: vi.fn(), on: vi.fn(), off: vi.fn() }, httpServer: { once: vi.fn(), removeListener: vi.fn() } }
    const scheduler = createScheduler()
    scheduler.schedule(options, server as never)
    scheduler.schedule(options, server as never)
    expect(server.ws.send).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(150)
    expect(server.ws.send).toHaveBeenCalledTimes(1)
    scheduler.cancel()
    vi.useRealTimers()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('cancel prevents a pending scheduled run', async () => {
    vi.useFakeTimers()
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-sched-'))
    const options = resolveOptions({ specDir: path.join(tmpDir, 'openspec'), srcDir: tmpDir, outDir: 'openspec' })
    const server = { ws: { send: vi.fn() }, watcher: { add: vi.fn(), on: vi.fn(), off: vi.fn() }, httpServer: { once: vi.fn(), removeListener: vi.fn() } }
    const scheduler = createScheduler()
    scheduler.schedule(options, server as never)
    scheduler.cancel()
    await vi.advanceTimersByTimeAsync(200)
    expect(server.ws.send).not.toHaveBeenCalled()
    vi.useRealTimers()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })
})
