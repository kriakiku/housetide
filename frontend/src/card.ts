import { css, html, LitElement, nothing } from 'lit'
import type { PropertyDeclarations, PropertyValues, TemplateResult } from 'lit'
import { repeat } from 'lit/directives/repeat.js'

import type { I18n, MessageKey } from './i18n.ts'
import { createI18n } from './i18n.ts'
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
  icon,
  iconStyles,
  needsAttention,
  renderRow,
  renderSkeleton,
  renderTile,
  selectViews,
  taskStyles,
} from './panel/tile.ts'
import type { TaskContext } from './panel/tile.ts'
import { renderScene } from './scenes/index.ts'
import { sceneStyles, tokens } from './styles.ts'
import type { HomeAssistant, StatePayload, TaskView } from './types.ts'

export interface CardConfig {
  type?: string
  tasks?: string[]
  show?: 'today' | 'all'
  layout?: 'list' | 'scenes'
  title?: string
  animations?: boolean
}

interface FormField {
  name: string
}

const catalog: { tasks: Array<{ value: string; label: string }>; i18n: I18n } = {
  tasks: [],
  i18n: createI18n(typeof navigator === 'undefined' ? 'en' : navigator.language),
}

const FIELD_LABELS: Record<string, MessageKey> = {
  title: 'config_title',
  show: 'config_show',
  layout: 'config_layout',
  tasks: 'config_tasks',
  animations: 'config_animations',
}

export function assertCardConfig(config: CardConfig): void {
  if (config.show !== undefined && config.show !== 'today' && config.show !== 'all') {
    throw new Error('show must be "today" or "all"')
  }
  if (config.layout !== undefined && config.layout !== 'list' && config.layout !== 'scenes') {
    throw new Error('layout must be "list" or "scenes"')
  }
  if (config.tasks !== undefined && !Array.isArray(config.tasks)) {
    throw new Error('tasks must be a list of task ids')
  }
}

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
        gap: 12px;
      }

      .tiles .tile {
        background: var(--ht-surface-alt);
      }

      .tiles .undo {
        background: var(--ht-surface-alt);
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
        .row {
          grid-template-columns: 56px minmax(0, 1fr) auto;
          gap: 8px;
        }

        .row .thumb {
          width: 56px;
          height: 56px;
        }

        .row .go-wrap {
          width: 88px;
        }

        .row .undo {
          right: 96px;
        }

        .row .auto {
          font-size: 0;
          gap: 0;
        }
      }
    `,
  ]

  static getConfigForm(): {
    schema: object[]
    computeLabel: (field: FormField) => string | undefined
  } {
    const { i18n, tasks } = catalog
    return {
      schema: [
        { name: 'title', selector: { text: {} } },
        {
          name: 'show',
          selector: {
            select: {
              mode: 'dropdown',
              options: [
                { value: 'today', label: i18n.t('config_show_today') },
                { value: 'all', label: i18n.t('config_show_all') },
              ],
            },
          },
        },
        {
          name: 'layout',
          selector: {
            select: {
              mode: 'dropdown',
              options: [
                { value: 'list', label: i18n.t('config_layout_list') },
                { value: 'scenes', label: i18n.t('config_layout_scenes') },
              ],
            },
          },
        },
        {
          name: 'tasks',
          selector: { select: { multiple: true, custom_value: true, options: tasks } },
        },
        { name: 'animations', selector: { boolean: {} } },
      ],
      computeLabel: (field) => {
        const key = Object.hasOwn(FIELD_LABELS, field.name) ? FIELD_LABELS[field.name] : undefined
        return key ? i18n.t(key) : undefined
      },
    }
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
    this.live = new StateController(
      this,
      () => this.hass,
      (state) => {
        this.updateCatalog(state)
      },
    )
    this.tracker = new ActionTracker(this, () => this.hass)
  }

  setConfig(config: CardConfig): void {
    assertCardConfig(config)
    this.config = { ...config }
  }

  getCardSize(): number {
    const views = this.views()
    const each = this.config.layout === 'scenes' ? 5 : 2
    return Math.max(2, 1 + Math.max(1, views.length) * each)
  }

  getGridOptions(): { columns: number; rows: 'auto'; min_columns: number; min_rows: number } {
    return { columns: 12, rows: 'auto', min_columns: 6, min_rows: 2 }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('hass')) {
      this.live.sync()
      if (this.hass) catalog.i18n = localeOf(this.hass)
    }
  }

  private updateCatalog(state: StatePayload): void {
    catalog.tasks = state.tasks.map((task) => ({ value: task.id, label: task.title }))
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

  private body(hass: HomeAssistant, i18n: I18n, scenes: boolean): TemplateResult {
    const { state, failed } = this.live
    if (failed && !state) {
      return html`<div class="message" role="alert">
        <strong>${i18n.t('card_error')}</strong>
        <span>${i18n.t('card_error_hint')}</span>
      </div>`
    }
    if (!state) {
      return html`<div
        class=${scenes ? 'tiles' : 'list'}
        aria-busy="true"
        aria-label=${i18n.t('card_loading')}
      >
        ${renderSkeleton(2, scenes ? 'tile' : 'row')}
      </div>`
    }
    const views = this.views()
    if (views.length === 0) return this.empty(i18n)
    const ctx = this.context(hass, i18n)
    return html`<div class=${scenes ? 'tiles' : 'list'}>
      ${repeat(
        views,
        (view) => view.task_id,
        (view) => (scenes ? renderTile(view, ctx) : renderRow(view, ctx)),
      )}
    </div>`
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
    const scenes = this.config.layout === 'scenes'
    const attention = this.live.state ? this.views().filter((v) => needsAttention(v)).length : 0
    return html`<ha-card>
      <header>
        <h2>${this.config.title ?? i18n.t('card_title')}</h2>
        ${
          isOffline(hass)
            ? html`<span class="offline" role="status"
                >${icon('alert')}${i18n.t('disconnected')}</span
              >`
            : attention > 0
              ? html`<span class="count">${i18n.plural('tasks_due', attention)}</span>`
              : nothing
        }
      </header>
      ${this.body(hass, i18n, scenes)}
    </ha-card>`
  }
}
