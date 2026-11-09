import { css, html, LitElement, nothing } from 'lit'
import type { PropertyDeclarations, PropertyValues, TemplateResult } from 'lit'
import { repeat } from 'lit/directives/repeat.js'

import type { I18n } from './i18n.ts'
import { activeGestures, CARD_LAYOUTS, GESTURE_ACTIONS, GESTURE_NAMES } from './panel/gestures.ts'
import type { CardLayout, GestureAction, GestureMap } from './panel/gestures.ts'
import {
  ActionTracker,
  hassChanged,
  isOffline,
  localeOf,
  pageHidden,
  StateController,
  zoneOf,
} from './panel/live.ts'
import { weekdayIndex } from './panel/model.ts'
import {
  effectiveHide,
  HIDE_KEYS,
  icon,
  iconStyles,
  needsAttention,
  renderBubble,
  renderCompact,
  renderPicture,
  renderRow,
  renderSkeleton,
  renderTile,
  selectViews,
  taskStyles,
} from './panel/tile.ts'
import type { HideKey, TaskContext, TaskOptions } from './panel/tile.ts'
import { renderScene } from './scenes/index.ts'
import { sceneStyles, tokens } from './styles.ts'
import type { HomeAssistant, TaskView } from './types.ts'

export interface CardConfig {
  type?: string
  tasks?: string[]
  show?: 'today' | 'all'
  layout?: CardLayout
  columns?: number | 'auto'
  hide?: HideKey[]
  gestures?: GestureMap
  title?: string
  animations?: boolean
}

export const GRID_LAYOUTS: readonly CardLayout[] = ['scenes', 'picture', 'bubbles']
export const COLUMN_COUNTS = [2, 3, 4, 5, 6] as const

function listed<T extends string>(allowed: readonly T[], value: unknown): value is T {
  return allowed.some((item) => item === value)
}

function quoted(values: readonly string[]): string {
  return values.map((value) => `"${value}"`).join(', ')
}

function assertHide(hide: unknown): void {
  if (!Array.isArray(hide)) throw new Error(`hide must be a list of ${quoted(HIDE_KEYS)}`)
  for (const key of hide) {
    if (!listed(HIDE_KEYS, key)) {
      throw new Error(`hide has unknown item ${String(key)}: use ${quoted(HIDE_KEYS)}`)
    }
  }
}

function assertGestures(gestures: unknown): void {
  if (typeof gestures !== 'object' || gestures === null || Array.isArray(gestures)) {
    throw new Error('gestures must be a mapping of gesture to action')
  }
  for (const [gesture, action] of Object.entries(gestures)) {
    if (!listed(GESTURE_NAMES, gesture)) {
      throw new Error(`gestures has unknown gesture ${gesture}: use ${quoted(GESTURE_NAMES)}`)
    }
    if (!listed<GestureAction>(GESTURE_ACTIONS, action)) {
      throw new Error(`gestures.${gesture} must be one of ${quoted(GESTURE_ACTIONS)}`)
    }
  }
}

export function assertCardConfig(config: CardConfig): void {
  if (config.show !== undefined && config.show !== 'today' && config.show !== 'all') {
    throw new Error('show must be "today" or "all"')
  }
  if (config.layout !== undefined && !listed(CARD_LAYOUTS, config.layout)) {
    throw new Error(`layout must be one of ${quoted(CARD_LAYOUTS)}`)
  }
  if (
    config.columns !== undefined &&
    config.columns !== 'auto' &&
    !COLUMN_COUNTS.some((count) => count === config.columns)
  ) {
    throw new Error('columns must be "auto" or a number from 2 to 6')
  }
  if (config.hide !== undefined) assertHide(config.hide)
  if (config.gestures !== undefined) assertGestures(config.gestures)
  if (config.tasks !== undefined && !Array.isArray(config.tasks)) {
    throw new Error('tasks must be a list of task ids')
  }
}

const MIN_GRID: Record<CardLayout, readonly [number, number]> = {
  list: [6, 2],
  scenes: [6, 2],
  picture: [3, 2],
  compact: [4, 1],
  bubbles: [3, 1],
}

const GRID_COLUMNS_PER_CELL = 1.5

const SKELETONS = {
  list: 'row',
  scenes: 'tile',
  picture: 'picture',
  compact: 'compact',
  bubbles: 'bubble',
} as const

const RENDERERS = {
  list: renderRow,
  scenes: renderTile,
  picture: renderPicture,
  compact: renderCompact,
  bubbles: renderBubble,
} as const

export class HousetideCard extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false, hasChanged: hassChanged },
    config: { state: true },
  }

  static override styles = [
    tokens,
    iconStyles,
    sceneStyles,
    taskStyles,
    css`
      :host {
        display: block;
      }

      ha-card {
        corner-shape: var(--ht-corner);
        position: relative;
        display: block;
        box-sizing: border-box;
        height: 100%;
        padding: 12px 16px;
        container-type: inline-size;
      }

      header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        min-height: 32px;
        margin-bottom: 4px;
      }

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .count {
        color: var(--ht-muted);
        font-size: 0.875rem;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 10px;
      }

      .tiles.pictures {
        grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
        gap: 8px;
      }

      .bubbles {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .bubbles[class*='columns-'] {
        display: grid;
        justify-items: center;
      }

      .tiles.columns-2,
      .bubbles.columns-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .tiles.columns-3,
      .bubbles.columns-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .tiles.columns-4,
      .bubbles.columns-4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .tiles.columns-5,
      .bubbles.columns-5 {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }

      .tiles.columns-6,
      .bubbles.columns-6 {
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }

      ha-card.dense {
        padding: 8px;
      }

      .dense .empty {
        grid-template-columns: 52px 1fr;
        min-height: 52px;
      }

      .dense .empty .thumb {
        width: 52px;
        height: 52px;
      }

      .empty {
        display: grid;
        grid-template-columns: 72px 1fr;
        align-items: center;
        gap: 12px;
        min-height: 88px;
        color: var(--ht-muted);
      }

      .empty .thumb {
        width: 72px;
        height: 72px;
      }

      .message {
        display: grid;
        gap: 4px;
        padding: 16px 0;
      }

      .message strong {
        color: var(--ht-fg);
      }

      .message span {
        color: var(--ht-muted);
        font-size: 0.875rem;
      }

      .offline {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--ht-warning);
        font-size: 0.8125rem;
      }

      @container (max-width: 340px) {
        .row .go-wrap {
          width: 80px;
        }

        .row .undo {
          right: 98px;
        }
      }
    `,
  ]

  static getConfigElement(): HTMLElement {
    return document.createElement('housetide-card-editor')
  }

  static getStubConfig(): CardConfig {
    return { show: 'today', layout: 'list', animations: true }
  }

  declare hass: HomeAssistant | undefined
  declare config: CardConfig

  private readonly live: StateController
  private readonly tracker: ActionTracker

  constructor() {
    super()
    this.config = {}
    this.live = new StateController(this, () => this.hass)
    this.tracker = new ActionTracker(this, () => this.hass)
  }

  setConfig(config: CardConfig): void {
    assertCardConfig(config)
    this.config = { ...config }
  }

  private layout(): CardLayout {
    return this.config.layout ?? 'list'
  }

  private columnCount(): number | undefined {
    const { columns } = this.config
    return typeof columns === 'number' ? columns : undefined
  }

  getCardSize(): number {
    const count = Math.max(1, this.views().length)
    const header = this.config.hide?.includes('header') ? 0 : 1
    return Math.max(1, header + this.bodySize(count))
  }

  private bodySize(count: number): number {
    const columns = this.columnCount()
    switch (this.layout()) {
      case 'list':
        return count * 2
      case 'scenes':
        return count * 5
      case 'compact':
        return Math.ceil(count * 1.2)
      case 'picture':
        return Math.ceil(count / (columns ?? 3)) * Math.ceil(9.6 / (columns ?? 3))
      default:
        return Math.ceil(Math.ceil(count / (columns ?? 5)) * 1.7)
    }
  }

  getGridOptions(): { columns: number; rows: 'auto'; min_columns: number; min_rows: number } {
    const layout = this.layout()
    const [least, min_rows] = MIN_GRID[layout]
    const cells = layout === 'picture' || layout === 'bubbles' ? this.columnCount() : undefined
    const min_columns = cells ? Math.max(least, Math.ceil(cells * GRID_COLUMNS_PER_CELL)) : least
    return { columns: 12, rows: 'auto', min_columns, min_rows }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('hass')) this.live.sync()
  }

  private views(): TaskView[] {
    const { state } = this.live
    if (!state) return []
    return selectViews(state.views, {
      show: this.config.show ?? 'today',
      ids: this.config.tasks,
      tracker: this.tracker,
    })
  }

  private context(hass: HomeAssistant, i18n: I18n): TaskContext {
    const { now } = this.live
    return {
      i18n,
      tracker: this.tracker,
      now,
      animations: this.config.animations !== false && !pageHidden(),
      day: weekdayIndex(now, zoneOf(hass)),
      offline: isOffline(hass),
    }
  }

  private body(hass: HomeAssistant, i18n: I18n): TemplateResult {
    const { state, failed } = this.live
    if (failed && !state) {
      return html`<div class="message" role="alert">
        <strong>${i18n.t('card_error')}</strong>
        <span>${i18n.t('card_error_hint')}</span>
      </div>`
    }
    const layout = this.layout()
    if (!state) {
      return html`<div
        class=${this.gridClass(layout)}
        aria-busy="true"
        aria-label=${i18n.t('card_loading')}
      >
        ${renderSkeleton(2, SKELETONS[layout])}
      </div>`
    }
    const views = this.views()
    if (views.length === 0) return this.empty(i18n)
    const ctx = this.context(hass, i18n)
    const options: TaskOptions = {
      hide: effectiveHide(layout, this.config.hide),
      gestures: activeGestures(layout, this.config.gestures),
    }
    const render = RENDERERS[layout]
    return html`<div class=${this.gridClass(layout)}>
      ${repeat(
        views,
        (view) => view.task_id,
        (view) => render(view, ctx, options),
      )}
    </div>`
  }

  private gridClass(layout: CardLayout): string {
    if (layout === 'list') return 'list'
    if (layout === 'compact') return 'list compact-list'
    const base = { scenes: 'tiles', picture: 'tiles pictures', bubbles: 'bubbles' }[layout]
    const columns = this.columnCount()
    return columns ? `${base} columns-${columns}` : base
  }

  private empty(i18n: I18n): TemplateResult {
    return html`<div class="empty" data-part="empty">
      <div class="thumb">
        ${renderScene(
          { name: 'generic', state: 'clean', fill: 0, stink: 0, progress: 1 },
          { animations: false },
        )}
      </div>
      <div>${i18n.t('card_empty')}</div>
    </div>`
  }

  override render(): TemplateResult | typeof nothing {
    const { hass } = this
    if (!hass) return nothing
    const i18n = localeOf(hass)
    const layout = this.layout()
    const attention = this.live.state ? this.views().filter((v) => needsAttention(v)).length : 0
    const offline = isOffline(hass)
      ? html`<span class="offline" role="status">${icon('alert')}${i18n.t('disconnected')}</span>`
      : nothing
    const headless = this.config.hide?.includes('header') === true
    return html`<ha-card class=${layout === 'list' || layout === 'scenes' ? '' : 'dense'}>
      ${
        headless
          ? offline
          : html`<header>
              <h2>${this.config.title ?? i18n.t('card_title')}</h2>
              ${
                offline === nothing && attention > 0
                  ? html`<span class="count">${i18n.plural('tasks_due', attention)}</span>`
                  : offline
              }
            </header>`
      }
      ${this.body(hass, i18n)}
    </ha-card>`
  }
}
