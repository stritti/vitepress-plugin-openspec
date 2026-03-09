import fs from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'
import type { Plugin } from 'vite'
import type { OpenSpecPluginOptions, ParsedSpec, SidebarItem } from './types.js'
import {
  generateEndpointMarkdown,
  generateIndexMarkdown,
  loadSpecFile,
  parseSpec,
} from './utils.js'

const PLUGIN_NAME = 'vitepress-plugin-openspec'

/**
 * Builds the sidebar configuration for the generated API pages.
 */
function buildSidebar(
  parsed: ParsedSpec,
  outDir: string,
  groupByTags: boolean,
): SidebarItem[] {
  if (groupByTags && parsed.tags.length > 0) {
    const groups: SidebarItem[] = []

    for (const tag of parsed.tags) {
      const tagEndpoints = parsed.endpoints.filter((e) => e.tags.includes(tag))
      groups.push({
        text: tag,
        collapsed: false,
        items: tagEndpoints.map((e) => ({
          text: `${e.method} ${e.path}`,
          link: `/${outDir}/${e.slug}`,
        })),
      })
    }

    const untagged = parsed.endpoints.filter((e) => e.tags.length === 0)
    if (untagged.length > 0) {
      groups.push({
        text: 'Other',
        collapsed: false,
        items: untagged.map((e) => ({
          text: `${e.method} ${e.path}`,
          link: `/${outDir}/${e.slug}`,
        })),
      })
    }

    return groups
  }

  return parsed.endpoints.map((e) => ({
    text: `${e.method} ${e.path}`,
    link: `/${outDir}/${e.slug}`,
  }))
}

/**
 * Writes all generated Markdown files to the output directory.
 */
function writeGeneratedFiles(
  parsed: ParsedSpec,
  absoluteOutDir: string,
  relativeOutDir: string,
  options: Required<OpenSpecPluginOptions>,
): void {
  fs.mkdirSync(absoluteOutDir, { recursive: true })

  // Write the index page
  const indexContent = generateIndexMarkdown(parsed, relativeOutDir)
  fs.writeFileSync(path.join(absoluteOutDir, 'index.md'), indexContent, 'utf-8')

  // Write one page per endpoint
  for (const endpoint of parsed.endpoints) {
    const content = generateEndpointMarkdown(endpoint, options.includeSchemas)
    fs.writeFileSync(path.join(absoluteOutDir, `${endpoint.slug}.md`), content, 'utf-8')
  }
}

/**
 * VitePress plugin that reads one or more OpenAPI spec files and generates
 * Markdown documentation pages inside the VitePress source directory.
 *
 * @example
 * ```typescript
 * // .vitepress/config.ts
 * import { defineConfig } from 'vitepress'
 * import openspec from 'vitepress-plugin-openspec'
 *
 * export default defineConfig({
 *   vite: {
 *     plugins: [
 *       openspec({ spec: './openapi.yaml' }),
 *     ],
 *   },
 * })
 * ```
 */
export function openspec(userOptions: OpenSpecPluginOptions): Plugin {
  const options: Required<OpenSpecPluginOptions> = {
    outDir: 'api',
    title: '',
    groupByTags: true,
    includeSchemas: true,
    generateSidebar: true,
    ...userOptions,
  }

  const specFiles = Array.isArray(options.spec) ? options.spec : [options.spec]

  // Collected sidebar items across all specs (populated during configResolved)
  let generatedSidebar: SidebarItem[] = []

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',

    /**
     * After the Vite config is resolved we know the VitePress `srcDir`.
     * We parse the spec(s) and write the Markdown files here so that
     * VitePress picks them up during its own build/dev pipeline.
     */
    configResolved(resolvedConfig) {
      // VitePress sets config.vitepress on the resolved Vite config
      const vpConfig = (resolvedConfig as unknown as { vitepress?: { srcDir?: string } }).vitepress
      const srcDir = vpConfig?.srcDir ?? resolvedConfig.root ?? process.cwd()

      const absoluteOutDir = path.resolve(srcDir, options.outDir)

      generatedSidebar = []

      for (const specFile of specFiles) {
        try {
          const raw = loadSpecFile(specFile)
          const parsed = parseSpec(raw)

          // Allow the user-supplied title to override the spec title
          if (options.title) {
            parsed.title = options.title
          }

          writeGeneratedFiles(parsed, absoluteOutDir, options.outDir, options)

          if (options.generateSidebar) {
            const sidebar = buildSidebar(parsed, options.outDir, options.groupByTags)
            generatedSidebar.push({
              text: parsed.title,
              collapsed: false,
              items: sidebar,
            })
          }

          console.log(
            `${pc.bold(pc.cyan(`[${PLUGIN_NAME}]`))} Generated ${pc.green(String(parsed.endpoints.length))} endpoint page(s) from ${pc.cyan(specFile)} → ${pc.cyan(absoluteOutDir)}`,
          )
        } catch (err) {
          console.error(
            `${pc.bold(pc.red(`[${PLUGIN_NAME}]`))} Failed to process spec file "${specFile}": ${String(err)}`,
          )
        }
      }
    },
  }
}

/**
 * Synchronously parses one or more OpenAPI spec files and returns a sidebar
 * configuration that can be used directly in your VitePress config.
 *
 * Because the VitePress config object is evaluated **before** any Vite plugin
 * hooks run, the sidebar must be computed eagerly. This helper reads the spec
 * file(s) at config-evaluation time and returns the sidebar items so they can
 * be placed in `themeConfig.sidebar`.
 *
 * @example
 * ```typescript
 * import { defineConfig } from 'vitepress'
 * import openspec, { generateSidebarFromSpec } from 'vitepress-plugin-openspec'
 *
 * export default defineConfig({
 *   vite: {
 *     plugins: [openspec({ spec: './openapi.yaml' })],
 *   },
 *   themeConfig: {
 *     sidebar: {
 *       '/api/': generateSidebarFromSpec('./openapi.yaml', { outDir: 'api' }),
 *     },
 *   },
 * })
 * ```
 */
export function generateSidebarFromSpec(
  spec: string | string[],
  options: Pick<OpenSpecPluginOptions, 'outDir' | 'groupByTags' | 'title'> = {},
): SidebarItem[] {
  const outDir = options.outDir ?? 'api'
  const groupByTags = options.groupByTags ?? true
  const specFiles = Array.isArray(spec) ? spec : [spec]
  const sidebar: SidebarItem[] = []

  for (const specFile of specFiles) {
    try {
      const raw = loadSpecFile(specFile)
      const parsed = parseSpec(raw)
      if (options.title) parsed.title = options.title

      sidebar.push({
        text: parsed.title,
        collapsed: false,
        items: buildSidebar(parsed, outDir, groupByTags),
      })
    } catch (err) {
      console.error(
        `${pc.bold(pc.red(`[${PLUGIN_NAME}]`))} generateSidebarFromSpec: failed to process "${specFile}": ${String(err)}`,
      )
    }
  }

  return sidebar
}

export default openspec
