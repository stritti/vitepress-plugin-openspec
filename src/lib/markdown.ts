import type { CapabilitySpec } from '../types.js'
import { humanizeLabel } from './reader.js'

export function extractSpecDescription(content: string): string | undefined {
  const reqMatch = content.match(/^### Requirement:[^\n]*\n+([\s\S]*?)(?=\n#{1,4} |\n*$)/m)
  if (!reqMatch) return undefined
  const para = reqMatch[1].trim()
  if (!para) return undefined
  const sentenceMatch = para.match(/^([^.?!]+[.?!])/)
  if (!sentenceMatch) return undefined
  let sentence = sentenceMatch[1].trim()
  if (sentence.length > 160) {
    const cut = sentence.lastIndexOf(' ', 160)
    sentence = (cut > 0 ? sentence.slice(0, cut) : sentence.slice(0, 160)) + '…'
  }
  return sentence.replace(/([\\"])/g, '\\$1')
}

export function stripDeltaMarkers(content: string): string {
  const stripped = content
    .split('\n')
    .filter((line) => !/^## (ADDED|MODIFIED|REMOVED) Requirements\s*$/.test(line))
    .join('\n')
  return stripped.replace(/\n{3,}/g, '\n\n')
}

export function transformScenarios(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let inScenario = false
  for (const line of lines) {
    const scenarioMatch = line.match(/^#### Scenario: (.+)$/)
    const isHeading = /^#{1,6} /.test(line)
    if (scenarioMatch) {
      if (inScenario) result.push(':::')
      result.push(`:::details ${scenarioMatch[1]}`)
      inScenario = true
    } else if (isHeading && inScenario) {
      result.push(':::')
      result.push('')
      result.push(line)
      inScenario = false
    } else {
      result.push(line)
    }
  }
  if (inScenario) result.push(':::')
  return result.join('\n')
}

export function specTitle(spec: CapabilitySpec): string {
  return spec.title ?? humanizeLabel(spec.name)
}
