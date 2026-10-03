import fs from 'node:fs'
import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import type { ResolvedOptions } from './lib/options.js'
import type { OpenSpecPluginOptions, WithOpenSpecOptions } from './types.js'
import { PLUGIN_NAME, logWarn } from './lib/logger.js'
import { resolveOptions } from './lib/options.js'
import { generatePages } from './lib/generator.js'
import { generateOpenSpecSidebar, openspecNav } from './lib/navigation.js'

/**
 * Synchronously generates all VitePress Markdown pages from the openspec/
 * directory and writes them to disk.
 *
 * Call this at the top of your `docs/.vitepress/config.ts` **before**
 * `defineConfig()` so the files exist when VitePress scans the source
 * directory for routes. In most cases `withOpenSpec()` (which calls this
 * internally) is the simpler integration point.
 */
export function generateOpenSpecPages(userOptions: OpenSpecPluginOptions = {}): void {
  const options = resolveOptions(userOptions)
  generatePages(options)
}

/**
 * Vite plugin that regenerates the openspec documentation pages whenever a
 * file inside the openspec/ directory changes. This makes `vitepress dev`
 * pick up spec edits without a manual restart.
 *
 * For the pages to be available on the first build (including CI), the pages
 * are generated once in `configResolved`. When using `withOpenSpec()` this
 * plugin is wired up automatically.
 */
let regenerateTimer: ReturnType<typeof setTimeout> | undefined

function onSourceChange(
  options: ResolvedOptions,
  server: ViteDevServer,
  file: string,
): void {
  const absFile = path.resolve(file)
  const relToSpec = path.relative(options.specDir, absFile)
  if (relToSpec.startsWith('..') || path.isAbsolute(relToSpec)) return
  // Ignore events for files inside the generated output directory to
  // avoid watch loops when outDir is nested inside specDir.
  const relToOut = path.relative(options.absoluteOutDir, absFile)
  if (!(relToOut.startsWith('..') || path.isAbsolute(relToOut))) return
  if (path.basename(absFile).startsWith('.')) return
  // Debounce: editors often emit several events per save
  if (regenerateTimer) clearTimeout(regenerateTimer)
  regenerateTimer = setTimeout(() => {
    regenerateTimer = undefined
    generatePages(options)
    server.ws.send({ type: 'full-reload' })
  }, 100)
}

export function openspec(userOptions: OpenSpecPluginOptions = {}): Plugin {
  let resolvedOptions: ResolvedOptions | undefined
  let watcher: { close: () => void } | undefined

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',

    configResolved(resolvedConfig) {
      const vpConfig = (resolvedConfig as unknown as { vitepress?: { srcDir?: string } }).vitepress
      const srcDir =
        userOptions.srcDir ?? vpConfig?.srcDir ?? resolvedConfig.root ?? process.cwd()
      try {
        resolvedOptions = resolveOptions(userOptions, srcDir)
      } catch (err) {
        logWarn(String(err))
        return
      }
      if (!fs.existsSync(resolvedOptions.specDir)) {
        logWarn(
          `openspec directory not found: ${resolvedOptions.specDir} — skipping page generation`,
        )
        resolvedOptions = undefined
        return
      }
      generatePages(resolvedOptions)
    },

    configureServer(server) {
      if (!resolvedOptions || !fs.existsSync(resolvedOptions.specDir)) return
      const options = resolvedOptions
      // Use Vite's own watcher: it is supported on all Node versions and
      // platforms declared by this package (unlike recursive fs.watch).
      watcher = server.watcher.on('change', (file: string) => {
        onSourceChange(options, server, file)
      })
    },

    closeBundle() {
      watcher?.close()
      watcher = undefined
    },
  }
}

/**
 * One-call VitePress config helper that wires up the full openspec integration.
 *
 * Calls `generateOpenSpecPages()` synchronously (required before VitePress scans
 * for routes), then merges the openspec Vite plugin, nav entry, and sidebar section
 * into the provided config object.
 *
 * Other Vite plugins go into `vite.plugins` as usual — `withOpenSpec` appends to
 * the array without replacing it.
 *
 * @param config - Your VitePress `UserConfig` object (same as what `defineConfig` accepts).
 * @param options - OpenSpec options. All fields are optional; defaults match `generateOpenSpecPages`.
 */
export function withOpenSpec<T extends Record<string, unknown>>(
  config: T,
  options: WithOpenSpecOptions = {},
): T {
  let resolved
  try {
    resolved = resolveOptions(options)
  } catch (err) {
    logWarn(String(err))
    return config
  }

  generatePages(resolved)

  const result = { ...config } as Record<string, unknown>

  // --- Vite plugin ---
  const vite = (result.vite ?? {}) as Record<string, unknown>
  const existingPlugins = (vite.plugins as unknown[]) ?? []
  result.vite = { ...vite, plugins: [...existingPlugins, openspec({ ...options })] }

  const themeConfig = (result.themeConfig ?? {}) as Record<string, unknown>

  // --- Nav ---
  if (options.nav !== false) {
    const navEntry = openspecNav(resolved.specDir, {
      outDir: resolved.outDir,
      text: options.navText,
    })
    const existingNav = (themeConfig.nav as unknown[]) ?? []
    themeConfig.nav = navEntry ? [navEntry, ...existingNav] : existingNav
  }

  // --- Sidebar ---
  if (options.sidebar !== false && !Array.isArray(themeConfig.sidebar)) {
    const sidebarKey = `/${resolved.outDir}/`
    const existingSidebar = (themeConfig.sidebar ?? {}) as Record<string, unknown>
    if (!existingSidebar[sidebarKey]) {
      const items = generateOpenSpecSidebar(resolved.specDir, { outDir: resolved.outDir })
      if (items.length > 0) {
        themeConfig.sidebar = { ...existingSidebar, [sidebarKey]: items }
      }
    }
  }

  result.themeConfig = themeConfig
  return result as T
}

export default openspec
