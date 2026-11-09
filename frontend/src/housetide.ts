import { HousetideCardEditor } from './card-editor.ts'
import { HousetideCard } from './card.ts'
import { HousetideEditor } from './panel/editor.ts'
import { HousetideHistory } from './panel/history.ts'
import { HousetidePanel } from './panel/panel.ts'
import { HousetideTasks } from './panel/tasks.ts'
import { HousetideToday } from './panel/today.ts'

const ELEMENTS: Record<string, CustomElementConstructor> = {
  'housetide-card': HousetideCard,
  'housetide-card-editor': HousetideCardEditor,
  'housetide-panel': HousetidePanel,
  'housetide-today': HousetideToday,
  'housetide-tasks': HousetideTasks,
  'housetide-editor': HousetideEditor,
  'housetide-history': HousetideHistory,
}

for (const [name, element] of Object.entries(ELEMENTS)) {
  if (!customElements.get(name)) customElements.define(name, element)
}

interface CustomCardEntry {
  type: string
  name: string
  description: string
  preview?: boolean
}

declare global {
  interface Window {
    customCards?: CustomCardEntry[]
  }
}

window.customCards ??= []
if (!window.customCards.some((card) => card.type === 'housetide-card')) {
  window.customCards.push({
    type: 'housetide-card',
    name: 'Housetide',
    description: 'Recurring household tasks with delightful little scenes.',
    preview: true,
  })
}
