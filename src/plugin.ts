import fs from 'node:fs'
import type { Plugin } from 'vite'
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
export function openspec(userOptions: OpenSpecPluginOptions = {}): Plugin {
  let resolvedOptions: ReturnType<typeof resolveOptions> | undefined
  let watcher: fs.FSWatcher | undefined

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
        return
      }
      generatePages(resolvedOptions)
    },

    configureServer(server) {
      if (!resolvedOptions) return
      const specDir = resolvedOptions.specDir
      watcher = fs.watch(
        specDir,
        { recursive: true },
        (event: fs.WatchEventType, file: string | null) => {
          if (typeof file === 'string' && file.startsWith('.')) return
          generatePages(resolvedOptions!)
          server.ws.send({ type: 'full-reload' })
        },
      )
      server.httpServer?.once('close', () => watcher?.close())
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
