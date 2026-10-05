import path from 'node:path'

/**
 * Rewrites relative markdown links in an artifact file's content so that they
 * use absolute VitePress paths instead of paths relative to the original
 * openspec source directory.
 *
 * Links that point outside the openspec root, absolute paths, HTTP URLs, and
 * anchor-only links are left unchanged.
 */
export function rewriteRelativeLinks(
  content: string,
  srcFilePath: string,
  openspecRootDir: string,
  outDir: string,
): string {
  const srcDir = path.dirname(srcFilePath)
  return content.replace(
    /(\[[^\]]*\])\(([^)]+)\)/g,
    (_match, linkText: string, urlPart: string) => {
      const titleMatch = urlPart.match(/^(.+?)(\s+["'][^"']*["'])?\s*$/)
      if (!titleMatch) return _match
      const rawUrl = titleMatch[1].trim()
      const title = titleMatch[2] ?? ''
      if (
        !rawUrl ||
        rawUrl.startsWith('http://') ||
        rawUrl.startsWith('https://') ||
        rawUrl.startsWith('//') ||
        rawUrl.startsWith('/') ||
        rawUrl.startsWith('#') ||
        rawUrl.startsWith('mailto:') ||
        rawUrl.startsWith('tel:')
      ) {
        return _match
      }
      const hashIdx = rawUrl.indexOf('#')
      const urlWithoutFragment = hashIdx >= 0 ? rawUrl.slice(0, hashIdx) : rawUrl
      const fragment = hashIdx >= 0 ? rawUrl.slice(hashIdx) : ''
      if (!urlWithoutFragment) {
        return _match
      }
      const resolvedPath = path.resolve(srcDir, urlWithoutFragment)
      const relToOpenspec = path.relative(openspecRootDir, resolvedPath)
      if (relToOpenspec.startsWith('..') || path.isAbsolute(relToOpenspec)) {
        return _match
      }
      const vitePath = relToOpenspec.replace(/\.md$/, '').replace(/\\/g, '/')
      const absoluteLink = `/${outDir}/${vitePath}${fragment}`
      return `${linkText}(${absoluteLink}${title})`
    },
  )
}
