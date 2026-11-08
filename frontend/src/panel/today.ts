import { css, html, LitElement, nothing } from 'lit'
import type { PropertyDeclarations, TemplateResult } from 'lit'
import { repeat } from 'lit/directives/repeat.js'

import { renderScene } from '../scenes/index.ts'
import { sceneStyles, tokens } from '../styles.ts'
import type { HomeAssistant, StatePayload, TaskView } from '../types.ts'
import {
  ActionTracker,
  hassChanged,
  isOffline,
  localeOf,
  orderKey,
  compareKeys,
  zoneOf,
} from './live.ts'
import { weekdayIndex } from './model.ts'
import {
  icon,
  iconStyles,
  needsAttention,
  renderRow,
  renderSkeleton,
  renderTile,
  selectViews,
  taskStyles,
} from './tile.ts'
import type { TaskContext } from './tile.ts'

const MAX_LATER = 8
const LAYOUT_KEY = 'housetide.today.layout'

type TodayLayout = 'scenes' | 'list'

function storedLayout(): TodayLayout {
  try {
    return localStorage.getItem(LAYOUT_KEY) === 'list' ? 'list' : 'scenes'
  } catch {
    return 'scenes'
  }
}

function storeLayout(layout: TodayLayout): void {
  try {
    localStorage.setItem(LAYOUT_KEY, layout)
  } catch {
    return
  }
}

export class HousetideToday extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false, hasChanged: hassChanged },
    state: { attribute: false },
    now: { attribute: false },
    animations: { attribute: false },
    active: { attribute: false },
    layout: { state: true },
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

      :host([hidden]) {
        display: none;
      }

      .summary {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        min-height: 28px;
        margin-bottom: 10px;
      }

      .date {
        color: var(--ht-muted);
      }

      .count {
        font-size: 1.125rem;
        font-weight: 600;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 10px;
      }

      .side {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .views {
        display: inline-flex;
        gap: 2px;
        padding: 2px;
        border-radius: 999px;
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
      }

      .view {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 36px;
        padding: 0;
        border: none;
        border-radius: 999px;
        corner-shape: var(--ht-corner);
        background: transparent;
        color: var(--ht-muted);
        cursor: pointer;
        touch-action: manipulation;
      }

      .view[aria-pressed='true'] {
        background: var(--ht-accent);
        color: var(--ht-on-accent);
      }

      .view:focus-visible {
        outline: 2px solid var(--ht-accent);
        outline-offset: 2px;
      }

      .clear {
        display: grid;
        justify-items: center;
        gap: 4px;
        padding: 12px 0 24px;
        text-align: center;
      }

      .clear .art {
        width: min(260px, 50vh);
      }

      .clear h2 {
        margin: 12px 0 0;
        font-size: 1.5rem;
      }

      .clear p {
        margin: 0;
        color: var(--ht-muted);
      }

      h3 {
        margin: 20px 0 8px;
        color: var(--ht-muted);
        font-size: 0.875rem;
        font-weight: 600;
      }

      .later {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(216px, 1fr));
        gap: 8px;
      }

      .later-item {
        display: grid;
        grid-template-columns: 48px minmax(0, 1fr);
        align-items: center;
        gap: 10px;
        height: 64px;
        padding: 0 8px;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
      }

      .later-item .thumb {
        width: 48px;
        height: 48px;
      }

      .later-item .due {
        font-size: 0.8125rem;
      }
    `,
  ]

  declare hass: HomeAssistant | undefined
  declare state: StatePayload | null
  declare now: Date
  declare animations: boolean
  declare active: boolean
  declare layout: TodayLayout

  private readonly tracker: ActionTracker

  constructor() {
    super()
    this.state = null
    this.now = new Date()
    this.animations = true
    this.active = true
    this.layout = storedLayout()
    this.tracker = new ActionTracker(this, () => this.hass)
  }

  protected override shouldUpdate(): boolean {
    return this.active
  }

  private choose(layout: TodayLayout): void {
    this.layout = layout
    storeLayout(layout)
  }

  private renderViews(ctx: TaskContext): TemplateResult {
    const option = (layout: TodayLayout, name: 'tiles' | 'list', label: string): TemplateResult =>
      html`<button
        class="view"
        data-layout=${layout}
        aria-label=${label}
        aria-pressed=${this.layout === layout ? 'true' : 'false'}
        @click=${(): void => {
          this.choose(layout)
        }}
      >
        ${icon(name)}
      </button>`
    return html`<div class="views" role="group" aria-label=${ctx.i18n.t('config_layout')}>
      ${option('scenes', 'tiles', ctx.i18n.t('config_layout_scenes'))}
      ${option('list', 'list', ctx.i18n.t('config_layout_list'))}
    </div>`
  }

  private later(views: readonly TaskView[], shown: readonly TaskView[]): TaskView[] {
    const visible = new Set(shown.map((view) => view.task_id))
    return views
      .filter((view) => !visible.has(view.task_id) && view.status === 'upcoming')
      .toSorted((a, b) => compareKeys(orderKey(a), orderKey(b)))
      .slice(0, MAX_LATER)
  }

  private renderLater(views: TaskView[], ctx: TaskContext): TemplateResult | typeof nothing {
    if (views.length === 0) return nothing
    return html`<h3>${ctx.i18n.t('today_later')}</h3>
      <div class="later">
        ${repeat(
          views,
          (view) => view.task_id,
          (view) =>
            html`<div class="later-item" data-later=${view.task_id}>
              <div class="thumb">
                ${renderScene(view.scene, { animations: false, day: ctx.day })}
              </div>
              <div class="text">
                <div class="title">${view.title}</div>
                <div class="due">${ctx.i18n.dueText(view, ctx.now)}</div>
              </div>
            </div>`,
        )}
      </div>`
  }

  private renderClear(ctx: TaskContext): TemplateResult {
    return html`<div class="clear" data-part="clear">
      <div class="art">
        ${renderScene(
          { name: 'generic', state: 'clean', fill: 0, stink: 0, progress: 1 },
          { animations: ctx.animations },
        )}
      </div>
      <h2>${ctx.i18n.t('today_clear_title')}</h2>
      <p>${ctx.i18n.t('card_empty')}</p>
    </div>`
  }

  override render(): TemplateResult | typeof nothing {
    const { hass, state } = this
    if (!hass) return nothing
    if (!state) {
      return this.layout === 'list'
        ? html`<div class="list" aria-busy="true">${renderSkeleton(4, 'row')}</div>`
        : html`<div class="tiles" aria-busy="true">${renderSkeleton(4, 'tile')}</div>`
    }
    const i18n = localeOf(hass)
    const ctx: TaskContext = {
      i18n,
      tracker: this.tracker,
      now: this.now,
      animations: this.animations,
      day: weekdayIndex(this.now, zoneOf(hass)),
      offline: isOffline(hass),
    }
    const shown = selectViews(state.views, { show: 'today', tracker: this.tracker })
    const attention = shown.filter((view) => needsAttention(view)).length
    return html`<div class="summary">
        <span class="count">${attention > 0 ? i18n.plural('tasks_due', attention) : nothing}</span>
        <span class="side">
          <span class="date">${i18n.date(this.now)}</span>
          ${this.renderViews(ctx)}
        </span>
      </div>
      ${
        shown.length === 0
          ? this.renderClear(ctx)
          : html`<div class=${this.layout === 'list' ? 'list' : 'tiles'}>
              ${repeat(
                shown,
                (view) => view.task_id,
                (view) =>
                  this.layout === 'list'
                    ? renderRow(view, ctx, { skip: true })
                    : renderTile(view, ctx, { skip: true }),
              )}
            </div>`
      }
      ${this.renderLater(this.later(state.views, shown), ctx)}`
  }
}
