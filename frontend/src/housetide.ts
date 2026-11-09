import { HousetideCardEditor } from './card-editor.ts'
import { HousetideCard } from './card.ts'
import { HousetideEditor } from './panel/editor.ts'
import { HousetideHistory } from './panel/history.ts'
import { HousetidePanel } from './panel/panel.ts'
import { HousetidePomodoro } from './panel/pomodoro.ts'
import { HousetideTasks } from './panel/tasks.ts'
import { HousetideToday } from './panel/today.ts'
import { HousetidePomodoroCard } from './pomodoro-card.ts'

const ELEMENTS: Record<string, CustomElementConstructor> = {
  'housetide-card': HousetideCard,
  'housetide-card-editor': HousetideCardEditor,
  'housetide-panel': HousetidePanel,
  'housetide-today': HousetideToday,
  'housetide-tasks': HousetideTasks,
  'housetide-editor': HousetideEditor,
  'housetide-history': HousetideHistory,
  'housetide-pomodoro': HousetidePomodoro,
  'housetide-pomodoro-card': HousetidePomodoroCard,
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

const CARDS: CustomCardEntry[] = [
  {
    type: 'housetide-card',
    name: 'Housetide',
    description: 'Recurring household tasks with delightful little scenes.',
    preview: true,
  },
  {
    type: 'housetide-pomodoro-card',
    name: 'Housetide Pomodoro',
    description: 'A Pomodoro timer with a tomato that works alongside you.',
    preview: true,
  },
]

window.customCards ??= []
for (const card of CARDS) {
  if (!window.customCards.some((known) => known.type === card.type)) window.customCards.push(card)
}
