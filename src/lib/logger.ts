import pc from 'picocolors'

export const PLUGIN_NAME = 'vitepress-plugin-openspec'

function prefix(color: (s: string) => string): string {
  return pc.bold(color(`[${PLUGIN_NAME}]`))
}

export function logWarn(message: string): void {
  console.warn(`${prefix(pc.yellow)} ${message}`)
}

export function logInfo(message: string): void {
  console.log(`${prefix(pc.cyan)} ${message}`)
}

export function logError(message: string): void {
  console.error(`${prefix(pc.red)} ${message}`)
}
