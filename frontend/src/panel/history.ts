import { css, html, LitElement, nothing } from 'lit'
import type { PropertyDeclarations, PropertyValues, TemplateResult } from 'lit'
import { repeat } from 'lit/directives/repeat.js'

import { fetchHistory, fetchStats } from '../api.ts'
import type { I18n } from '../i18n.ts'
import { controls, tokens } from '../styles.ts'
import type { HistoryEvent, HomeAssistant, StatePayload, Stats } from '../types.ts'
import { errorMessage, hassChanged, localeOf, zoneOf } from './live.ts'
import { dayGrid, middayOf } from './model.ts'
import type { GridDay } from './model.ts'

const PAGE = 40
const DAYS = 90

function fingerprint(state: StatePayload | null): string {
  if (!state) return ''
  return state.views
    .map(
      (view) =>
        `${view.task_id}:${view.stage_index}:${view.due_at}:${view.last_completed_at}:${view.can_undo}`,
    )
    .join('|')
}

function mergeEvents(current: HistoryEvent[], incoming: HistoryEvent[]): HistoryEvent[] {
  const seen = new Map(current.map((event) => [event.id, event]))
  for (const event of incoming) seen.set(event.id, event)
  return [...seen.values()].toSorted((a, b) => Date.parse(b.ts) - Date.parse(a.ts))
}

export class HousetideHistory extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false, hasChanged: hassChanged },
    state: { attribute: false },
    filter: { state: true },
    events: { state: true },
    stats: { state: true },
    loading: { state: true },
    more: { state: true },
    error: { state: true },
    day: { state: true },
  }

  static override styles = [
    tokens,
    controls,
    css`
      :host {
        display: block;
      }

      .top {
        display: flex;
        flex-wrap: wrap;
        align-items: stretch;
        gap: 8px;
        margin-bottom: 12px;
      }

      .filter {
        flex: 1 1 180px;
        align-self: center;
      }

      select.ht-input {
        appearance: auto;
      }

      .stat {
        display: grid;
        flex: 1 1 96px;
        align-content: center;
        padding: 8px 12px;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
      }

      .stat b {
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1.2;
      }

      .stat span {
        color: var(--ht-muted);
        font-size: 0.8125rem;
      }

      .columns {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 14px;
      }

      .columns > * {
        flex: 1 1 280px;
        min-width: 0;
        box-sizing: border-box;
      }

      .columns > .grid-panel {
        flex: 1 1 640px;
      }

      .panel {
        padding: 12px;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
      }

      h3 {
        margin: 0 0 8px;
        color: var(--ht-muted);
        font-size: 0.875rem;
        font-weight: 600;
      }

      .scroller {
        overflow-x: auto;
        overscroll-behavior-x: contain;
      }

      .grid {
        display: grid;
        grid-auto-columns: 44px;
        grid-template-rows: repeat(7, 44px);
        width: max-content;
      }

      .day {
        appearance: none;
        display: block;
        width: 44px;
        height: 44px;
        padding: 5px;
        border: 0;
        background: transparent;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      .day i {
        display: block;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        border-radius: 7px;
        corner-shape: var(--ht-corner);
        background: var(--ht-surface-alt);
      }

      .day.l1 i {
        background: color-mix(in srgb, var(--ht-success) 45%, var(--ht-surface-alt));
      }

      .day.l2 i {
        background: color-mix(in srgb, var(--ht-success) 72%, var(--ht-surface-alt));
      }

      .day.l3 i {
        background: var(--ht-success);
      }

      .day.trouble i {
        border: 3px solid var(--ht-warning);
      }

      .day.bad i {
        background: color-mix(in srgb, var(--ht-danger) 60%, var(--ht-surface-alt));
        border: 0;
      }

      .day[aria-pressed='true'] i {
        outline: 2px solid var(--ht-fg);
        outline-offset: 1px;
      }

      .caption {
        min-height: 20px;
        margin-top: 8px;
        color: var(--ht-muted);
        font-size: 0.875rem;
      }

      .group {
        position: sticky;
        top: 0;
        padding: 8px 0 4px;
        background: var(--ht-surface);
        color: var(--ht-muted);
        font-size: 0.8125rem;
        font-weight: 600;
      }

      .event {
        display: grid;
        grid-template-columns: 12px minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        height: 56px;
      }

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--ht-muted);
      }

      .t-completed .dot {
        background: var(--ht-success);
      }

      .t-skipped .dot {
        background: var(--ht-warning);
      }

      .t-missed .dot {
        background: var(--ht-danger);
      }

      .t-started .dot,
      .t-advanced .dot {
        background: var(--ht-accent);
      }

      .event-text {
        display: grid;
        min-width: 0;
      }

      .event-title,
      .event-sub {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .event-title {
        font-weight: 600;
      }

      .event-sub,
      .event-side {
        color: var(--ht-muted);
        font-size: 0.8125rem;
      }

      .event-side {
        display: grid;
        justify-items: end;
      }

      .on-time {
        color: var(--ht-success);
      }

      .late {
        color: var(--ht-warning);
      }

      .note {
        padding: 24px 8px;
        color: var(--ht-muted);
        text-align: center;
      }

      .err {
        color: var(--ht-danger);
      }

      .more {
        width: 100%;
        margin-top: 8px;
      }
    `,
  ]

  declare hass: HomeAssistant
  declare state: StatePayload | null
  declare filter: string
  declare events: HistoryEvent[]
  declare stats: Stats | null
  declare loading: boolean
  declare more: boolean
  declare error: string | null
  declare day: string | null

  private lastFingerprint = ''
  private request = 0
  private epoch = 0
  private refreshQueued = false
  private paging = false
  private scrolled = false

  constructor() {
    super()
    this.state = null
    this.filter = ''
    this.events = []
    this.stats = null
    this.loading = true
    this.more = false
    this.error = null
    this.day = null
  }

  protected override updated(changed: PropertyValues): void {
    const print = fingerprint(this.state)
    const first = changed.has('hass') && !changed.get('hass')
    if (first) {
      this.lastFingerprint = print
      void this.load(true)
    } else if (changed.has('filter')) {
      this.lastFingerprint = print
      void this.load(true)
    } else if (changed.has('state') && print !== this.lastFingerprint) {
      this.lastFingerprint = print
      void this.load(false)
    }
    if (this.stats && !this.scrolled) {
      const scroller = this.renderRoot.querySelector('.scroller')
      if (scroller) {
        scroller.scrollLeft = scroller.scrollWidth
        this.scrolled = true
      }
    }
  }

  private get taskFilter(): string | undefined {
    return this.filter === '' ? undefined : this.filter
  }

  private async load(reset: boolean): Promise<void> {
    if (reset) {
      this.epoch += 1
      this.loading = true
      this.refreshQueued = false
    } else if (this.loading) {
      this.refreshQueued = true
      return
    }
    this.request += 1
    const { request } = this
    this.error = null
    try {
      const [events, stats] = await Promise.all([
        fetchHistory(this.hass, { task_id: this.taskFilter, limit: PAGE }),
        fetchStats(this.hass, { task_id: this.taskFilter, days: DAYS }),
      ])
      if (request !== this.request) return
      this.events = reset ? events : mergeEvents(this.events, events)
      this.stats = stats
      if (reset) this.more = events.length >= PAGE
    } catch (error) {
      if (request === this.request) this.error = errorMessage(error)
    } finally {
      if (request === this.request) {
        this.loading = false
        if (this.refreshQueued) {
          this.refreshQueued = false
          void this.load(false)
        }
      }
    }
  }

  private async loadMore(): Promise<void> {
    const before = this.events.at(-1)?.ts
    if (!before || this.loading || this.paging) return
    const { epoch } = this
    this.paging = true
    try {
      const events = await fetchHistory(this.hass, {
        task_id: this.taskFilter,
        limit: PAGE,
        before,
      })
      if (epoch !== this.epoch) return
      this.events = mergeEvents(this.events, events)
      this.more = events.length >= PAGE
    } catch (error) {
      if (epoch === this.epoch) this.error = errorMessage(error)
    } finally {
      this.paging = false
    }
  }

  private renderStats(stats: Stats | null, i18n: I18n): TemplateResult {
    const none = i18n.t('stats_no_data')
    const onTime = stats?.on_time_rate
    const items: Array<[string, string, string]> = [
      ['current', stats ? i18n.number(stats.current_streak) : none, i18n.t('stats_current_streak')],
      ['best', stats ? i18n.number(stats.best_streak) : none, i18n.t('stats_best_streak')],
      [
        'on-time',
        onTime === null || onTime === undefined ? none : i18n.percent(onTime),
        i18n.t('stats_on_time'),
      ],
      ['completed', stats ? i18n.number(stats.completed) : none, i18n.t('stats_completed')],
      [
        'skipped',
        stats ? i18n.number(stats.skipped + stats.missed) : none,
        `${i18n.t('stats_skipped')} / ${i18n.t('stats_missed')}`,
      ],
    ]
    return html`${items.map(
      ([part, value, label]) =>
        html`<div class="stat" data-stat=${part}><b>${value}</b><span>${label}</span></div>`,
    )}`
  }

  private dayText(day: GridDay, i18n: I18n): string {
    const date = i18n.shortDate(middayOf(day.date, zoneOf(this.hass)))
    if (day.completed + day.skipped + day.missed === 0) {
      return i18n.t('history_day_empty', { date })
    }
    return i18n.t('history_day', {
      date,
      completed: day.completed,
      skipped: day.skipped,
      missed: day.missed,
    })
  }

  private dayClass(day: GridDay): string {
    const bad = day.completed === 0 && day.trouble
    return `day l${day.level} ${day.trouble ? 'trouble' : ''} ${bad ? 'bad' : ''}`
  }

  private renderGrid(stats: Stats | null, i18n: I18n): TemplateResult {
    const { days } = dayGrid(stats?.per_day ?? [])
    const selected = days.find((day) => day.date === this.day)
    return html`<div class="panel grid-panel">
      <h3>${i18n.t('history_window')}</h3>
      <div class="scroller">
        <div class="grid" data-part="grid">
          ${days.map((day) => {
            const label = this.dayText(day, i18n)
            return html`<button
              class=${this.dayClass(day)}
              style="grid-column:${day.column + 1};grid-row:${day.row + 1}"
              data-day=${day.date}
              aria-label=${label}
              aria-pressed=${day.date === this.day ? 'true' : 'false'}
              @click=${(): void => {
                this.day = day.date
              }}
            >
              <i></i>
            </button>`
          })}
        </div>
      </div>
      <div class="caption" data-part="caption" role="status">
        ${selected ? this.dayText(selected, i18n) : i18n.t('history_day_hint')}
      </div>
    </div>`
  }

  private renderEvent(event: HistoryEvent, i18n: I18n): TemplateResult {
    const label = i18n.t(`event_${event.type}`)
    return html`<div class="event t-${event.type}" data-event=${event.id}>
      <span class="dot"></span>
      <div class="event-text">
        <span class="event-title">${event.task_title}</span>
        <span class="event-sub">
          ${event.stage_title ? i18n.t('history_stage', { event: label, stage: event.stage_title }) : label}
          · ${i18n.t(`source_${event.source}`)}
        </span>
      </div>
      <div class="event-side">
        <span>${i18n.time(event.ts)}</span>
        ${
          event.on_time === null
            ? nothing
            : html`<span class=${event.on_time ? 'on-time' : 'late'}
                >${i18n.t(event.on_time ? 'on_time' : 'late')}</span
              >`
        }
      </div>
    </div>`
  }

  private renderTimeline(i18n: I18n): TemplateResult {
    if (this.loading && this.events.length === 0) {
      return html`<div class="panel">
        <div class="note" aria-busy="true">${i18n.t('loading')}</div>
      </div>`
    }
    if (this.events.length === 0) {
      return html`<div class="panel">
        ${
          this.error === null
            ? html`<div class="note" data-part="empty">${i18n.t('history_empty')}</div>`
            : nothing
        }
      </div>`
    }
    const groups = new Map<string, HistoryEvent[]>()
    for (const event of this.events) {
      const key = i18n.date(event.ts)
      groups.set(key, [...(groups.get(key) ?? []), event])
    }
    return html`<div class="panel" data-part="timeline">
      ${repeat(
        [...groups.entries()],
        ([key]) => key,
        ([key, events]) =>
          html`<div class="group">${key}</div>
            ${repeat(
              events,
              (event) => event.id,
              (event) => this.renderEvent(event, i18n),
            )}`,
      )}
      ${
        this.more
          ? html`<button
              class="ht-btn more"
              data-action="more"
              @click=${(): void => {
                void this.loadMore()
              }}
            >
              ${i18n.t('action_load_more')}
            </button>`
          : nothing
      }
    </div>`
  }

  override render(): TemplateResult | typeof nothing {
    const { hass, state } = this
    if (!hass) return nothing
    const i18n = localeOf(hass)
    return html`<div class="top">
        <label class="ht-label filter">
          ${i18n.t('field_filter_task')}
          <select
            class="ht-input"
            data-field="filter"
            @change=${(event: Event): void => {
              const { target } = event
              if (target instanceof HTMLSelectElement) this.filter = target.value
            }}
          >
            <option value="" ?selected=${this.filter === ''}>${i18n.t('history_all_tasks')}</option>
            ${(state?.tasks ?? []).map(
              (task) =>
                html`<option value=${task.id} ?selected=${this.filter === task.id}>
                  ${task.title}
                </option>`,
            )}
          </select>
        </label>
        ${this.renderStats(this.stats, i18n)}
      </div>
      ${
        this.error === null
          ? nothing
          : html`<p class="err" role="alert">
              ${i18n.t('error_generic', { message: this.error })}
            </p>`
      }
      <div class="columns">${this.renderGrid(this.stats, i18n)} ${this.renderTimeline(i18n)}</div>`
  }
}
