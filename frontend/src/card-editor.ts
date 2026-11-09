import { css, html, LitElement, nothing } from 'lit'
import type { PropertyDeclarations, PropertyValues, TemplateResult } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { styleMap } from 'lit/directives/style-map.js'

import { assertCardConfig, COLUMN_COUNTS, GRID_LAYOUTS } from './card.ts'
import type { CardConfig } from './card.ts'
import type { I18n } from './i18n.ts'
import { defaultGesture, GESTURE_ACTIONS, GESTURE_NAMES } from './panel/gestures.ts'
import type { GestureAction, GestureMap, GestureName } from './panel/gestures.ts'
import { hassChanged, localeOf, StateController } from './panel/live.ts'
import { effectiveHide, HIDE_KEYS, impliedHide } from './panel/tile.ts'
import type { HideKey } from './panel/tile.ts'
import { sceneSurface } from './scenes/common.ts'
import { renderScene } from './scenes/index.ts'
import { controls, sceneStyles, tokens } from './styles.ts'
import type { HomeAssistant, SceneView, StatePayload, Task } from './types.ts'

type Layout = NonNullable<CardConfig['layout']>
type Show = NonNullable<CardConfig['show']>

const DEFAULTS = { show: 'today', layout: 'list', animations: true } as const

const LAYOUTS: Array<{ value: Layout; label: `config_layout_${Layout}` }> = [
  { value: 'scenes', label: 'config_layout_scenes' },
  { value: 'list', label: 'config_layout_list' },
  { value: 'picture', label: 'config_layout_picture' },
  { value: 'compact', label: 'config_layout_compact' },
  { value: 'bubbles', label: 'config_layout_bubbles' },
]

const SHOWS: Array<{ value: Show; label: 'config_show_today' | 'config_show_all' }> = [
  { value: 'today', label: 'config_show_today' },
  { value: 'all', label: 'config_show_all' },
]

const PREVIEW_SCENES: SceneView[] = [
  { name: 'laundry', state: 'due', fill: 0.7, stink: 0, progress: 0 },
  { name: 'plant', state: 'resting', fill: 0.6, stink: 0, progress: 0 },
]

const UNKNOWN_SCENE: SceneView = {
  name: 'generic',
  state: 'resting',
  fill: 0,
  stink: 0,
  progress: 0,
}

function surface(scene: SceneView): Record<string, string> {
  const { wall, floor } = sceneSurface(scene)
  return { '--ht-wall': wall, '--ht-floor': floor }
}

function thumbnail(scene: SceneView): TemplateResult {
  return renderScene(scene, { animations: false, bleed: true })
}

const EXTRA_PREVIEW: SceneView = { name: 'generic', state: 'clean', fill: 0, stink: 0, progress: 1 }

function previewText(layout: Layout): TemplateResult | typeof nothing {
  if (layout === 'picture' || layout === 'bubbles') return nothing
  if (layout === 'compact')
    return html`<div class="mini-text"><i></i></div>
      <b></b>`
  return html`<div class="mini-text"><i></i><i></i></div>`
}

function layoutPreview(layout: Layout): TemplateResult {
  const scenes =
    layout === 'picture' || layout === 'bubbles'
      ? [...PREVIEW_SCENES, EXTRA_PREVIEW]
      : PREVIEW_SCENES
  return html`<div class="preview preview-${layout}" aria-hidden="true">
    ${scenes.map(
      (scene) =>
        html`<div class="mini" style=${styleMap(surface(scene))}>
          <div class="mini-art">${thumbnail(scene)}</div>
          ${previewText(layout)}
        </div>`,
    )}
  </div>`
}

function tidied(config: CardConfig): CardConfig {
  const layout = config.layout ?? DEFAULTS.layout
  const { hide, gestures, ...rest } = config
  const tidy: CardConfig = { ...rest }
  const implied = impliedHide(layout)
  const kept = hide?.filter((key) => !implied.includes(key)) ?? []
  if (kept.length > 0) tidy.hide = kept
  const overrides: GestureMap = {}
  for (const gesture of GESTURE_NAMES) {
    const action = gestures?.[gesture]
    if (action !== undefined && action !== defaultGesture(layout, gesture)) {
      overrides[gesture] = action
    }
  }
  if (Object.keys(overrides).length > 0) tidy.gestures = overrides
  return tidy
}

function taskScene(task: Task, state: StatePayload): SceneView {
  const view = state.views.find((item) => item.task_id === task.id)
  return view?.scene ?? { ...UNKNOWN_SCENE, name: task.scene }
}

export class HousetideCardEditor extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false, hasChanged: hassChanged },
    config: { state: true },
  }

  static override styles = [
    tokens,
    controls,
    sceneStyles,
    css`
      :host {
        display: grid;
        gap: 20px;
      }

      section {
        display: grid;
        gap: 8px;
      }

      h3 {
        margin: 0;
        color: var(--ht-muted);
        font-size: 0.875rem;
        font-weight: 400;
      }

      h3:focus-visible {
        outline: 2px solid var(--ht-accent);
        outline-offset: 1px;
      }

      .status-text {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }

      .hint {
        margin: 0;
        color: var(--ht-muted);
        font-size: 0.8125rem;
      }

      .layouts {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--ht-gap);
      }

      .layout {
        appearance: none;
        display: grid;
        gap: 8px;
        align-content: start;
        min-height: 44px;
        padding: 8px;
        border: 2px solid var(--ht-divider);
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface-alt);
        color: var(--ht-fg);
        font: inherit;
        font-weight: 500;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      .layout[aria-pressed='true'] {
        border-color: var(--ht-accent);
      }

      .layout:focus-visible {
        outline: 2px solid var(--ht-accent);
        outline-offset: 1px;
      }

      .preview {
        display: grid;
        align-content: center;
        gap: 6px;
        min-height: 104px;
      }

      .preview-scenes {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .mini {
        overflow: hidden;
        border-radius: calc(var(--ht-radius) * 0.6);
        corner-shape: var(--ht-corner);
        background: var(--ht-floor);
      }

      .mini-text {
        display: grid;
        gap: 3px;
        padding: 5px 6px;
      }

      .mini-text i {
        display: block;
        width: 70%;
        height: 4px;
        border-radius: 2px;
        corner-shape: var(--ht-corner);
        background: #fff;
        opacity: 0.85;
      }

      .mini-text i + i {
        width: 45%;
        opacity: 0.5;
      }

      .preview-scenes .mini-art {
        aspect-ratio: 200 / 192;
      }

      .preview-list .mini {
        display: grid;
        grid-template-columns: 42px minmax(0, 1fr);
        align-items: center;
        height: 40px;
        background: var(--ht-wall);
      }

      .preview-list .mini-art {
        height: 40px;
      }

      .preview-picture {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .preview-picture .mini-art {
        aspect-ratio: 1;
      }

      .preview-compact .mini {
        display: grid;
        grid-template-columns: 26px minmax(0, 1fr) 12px;
        align-items: center;
        gap: 2px;
        height: 26px;
        padding-right: 6px;
        background: var(--ht-wall);
      }

      .preview-compact .mini-art {
        height: 26px;
      }

      .preview-compact b {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #fff;
        opacity: 0.85;
      }

      .preview-bubbles {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .preview-bubbles .mini {
        border-radius: 50%;
        corner-shape: round;
      }

      .preview-bubbles .mini-art {
        aspect-ratio: 1;
      }

      .checks {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 4px 12px;
      }

      .check {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
        cursor: pointer;
      }

      .check input {
        flex: none;
        width: 24px;
        height: 24px;
        margin: 0;
        accent-color: var(--ht-accent);
      }

      .check[data-off] {
        color: var(--ht-muted);
        cursor: default;
      }

      .gestures {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 8px 12px;
      }

      .segments {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .segment {
        flex: 1 1 auto;
        min-width: 44px;
      }

      .segment[aria-pressed='true'] {
        border-color: transparent;
        background: var(--ht-accent);
        color: var(--ht-on-accent);
      }

      .tasks {
        display: grid;
        gap: 6px;
      }

      .task {
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr) 24px;
        align-items: center;
        gap: 12px;
        min-height: 56px;
        padding: 6px 12px 6px 6px;
        box-sizing: border-box;
        border-radius: calc(var(--ht-radius) / 1.5);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface-alt);
        cursor: pointer;
        touch-action: manipulation;
      }

      .task:focus-within {
        outline: 2px solid var(--ht-accent);
        outline-offset: 1px;
      }

      .task input {
        width: 24px;
        height: 24px;
        margin: 0;
        accent-color: var(--ht-accent);
      }

      .task-thumb {
        overflow: hidden;
        width: 44px;
        height: 44px;
        border-radius: calc(var(--ht-radius) / 1.5);
        corner-shape: var(--ht-corner);
      }

      .task-name {
        display: grid;
        min-width: 0;
      }

      .task-name span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .task-name .task-id {
        color: var(--ht-muted);
        font-size: 0.8125rem;
      }

      .skeleton {
        min-height: 56px;
        border-radius: calc(var(--ht-radius) / 1.5);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface-alt);
        opacity: 0.6;
      }

      .message {
        display: grid;
        justify-items: start;
        gap: 8px;
      }

      .message p {
        margin: 0;
      }

      .message strong {
        color: var(--ht-danger);
      }

      .toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 44px;
        cursor: pointer;
      }

      .switch {
        appearance: none;
        position: relative;
        flex: none;
        width: 52px;
        height: 44px;
        margin: 0;
        background: none;
        cursor: pointer;
        touch-action: manipulation;
      }

      .switch::before {
        content: '';
        position: absolute;
        inset: 9px 0;
        box-sizing: border-box;
        border: 1px solid var(--ht-muted);
        border-radius: 999px;
        corner-shape: var(--ht-corner);
        background: var(--ht-surface-alt);
      }

      .switch::after {
        content: '';
        position: absolute;
        top: 13px;
        left: 4px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--ht-muted);
      }

      .switch:checked::before {
        border-color: transparent;
        background: var(--ht-accent);
      }

      .switch:checked::after {
        left: 30px;
        background: var(--ht-on-accent);
      }

      .switch:focus-visible {
        outline: 2px solid var(--ht-accent);
        outline-offset: 1px;
      }
    `,
  ]

  declare hass: HomeAssistant | undefined
  declare config: CardConfig

  private readonly live: StateController

  constructor() {
    super()
    this.config = {}
    this.live = new StateController(this, () => this.hass)
  }

  setConfig(config: CardConfig): void {
    assertCardConfig(config)
    this.config = { ...config }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('hass')) this.live.sync()
  }

  protected override updated(): void {
    const layout = this.config.layout ?? DEFAULTS.layout
    for (const gesture of GESTURE_NAMES) {
      const select = this.renderRoot.querySelector<HTMLSelectElement>(
        `select[data-gesture="${gesture}"]`,
      )
      if (select) select.value = this.config.gestures?.[gesture] ?? defaultGesture(layout, gesture)
    }
  }

  private commit(config: CardConfig): void {
    this.config = config
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private chooseColumns(columns: number | undefined): void {
    const { config } = this
    const current = typeof config.columns === 'number' ? config.columns : undefined
    if (current === columns) return
    const { columns: _previous, ...rest } = config
    this.commit(columns === undefined ? rest : { ...config, columns })
  }

  private columnsSection(i18n: I18n): TemplateResult | typeof nothing {
    if (!GRID_LAYOUTS.includes(this.config.layout ?? DEFAULTS.layout)) return nothing
    const current = typeof this.config.columns === 'number' ? this.config.columns : undefined
    const option = (value: number | undefined, label: string): TemplateResult =>
      html`<button
        type="button"
        class="ht-btn segment"
        data-columns=${value ?? 'auto'}
        aria-pressed=${current === value ? 'true' : 'false'}
        @click=${(): void => {
          this.chooseColumns(value)
        }}
      >
        ${label}
      </button>`
    return html`<section>
      <h3>${i18n.t('config_columns')}</h3>
      <div class="segments" role="group" aria-label=${i18n.t('config_columns')}>
        ${option(undefined, i18n.t('config_columns_auto'))}
        ${COLUMN_COUNTS.map((count) => option(count, String(count)))}
      </div>
    </section>`
  }

  private toggleHide(key: HideKey, on: boolean): void {
    const { hide = [] } = this.config
    const wanted = new Set(hide)
    if (on) wanted.add(key)
    else wanted.delete(key)
    this.commit(tidied({ ...this.config, hide: HIDE_KEYS.filter((item) => wanted.has(item)) }))
  }

  private hideSection(i18n: I18n, layout: Layout): TemplateResult {
    const implied = impliedHide(layout)
    const hidden = effectiveHide(layout, this.config.hide)
    const hint =
      implied.length === 0
        ? undefined
        : i18n.t(layout === 'compact' ? 'config_hide_compact_hint' : 'config_hide_bare_hint')
    return html`<section>
      <h3>${i18n.t('config_hide')}</h3>
      <div class="checks" role="group" aria-label=${i18n.t('config_hide')}>
        ${HIDE_KEYS.map((key) => {
          const off = implied.includes(key)
          return html`<label class="check" ?data-off=${off}>
            <input
              type="checkbox"
              data-hide=${key}
              .checked=${hidden.has(key)}
              ?disabled=${off}
              aria-describedby=${off ? 'hide-hint' : nothing}
              @change=${(event: Event): void => {
                if (event.target instanceof HTMLInputElement) {
                  this.toggleHide(key, event.target.checked)
                }
              }}
            />
            <span>${i18n.t(`config_hide_${key}`)}</span>
          </label>`
        })}
      </div>
      ${hint ? html`<p class="hint" id="hide-hint" data-part="hide-hint">${hint}</p>` : nothing}
    </section>`
  }

  private chooseGesture(gesture: GestureName, action: GestureAction): void {
    this.commit(
      tidied({ ...this.config, gestures: { ...this.config.gestures, [gesture]: action } }),
    )
  }

  private gestureSection(i18n: I18n, layout: Layout): TemplateResult {
    return html`<section>
      <h3>${i18n.t('config_gestures')}</h3>
      <p class="hint">${i18n.t('config_gestures_hint')}</p>
      <div class="gestures">
        ${GESTURE_NAMES.map((gesture) => {
          const fallback = defaultGesture(layout, gesture)
          return html`<label class="ht-label">
            ${i18n.t(`config_gesture_${gesture}`)}
            <select
              class="ht-input"
              data-gesture=${gesture}
              @change=${(event: Event): void => {
                const { target } = event
                if (!(target instanceof HTMLSelectElement)) return
                const action = GESTURE_ACTIONS.find((item) => item === target.value)
                if (action) this.chooseGesture(gesture, action)
              }}
            >
              ${GESTURE_ACTIONS.map((action) => {
                const name = i18n.t(`config_gesture_${action}`)
                return html`<option value=${action}>
                  ${action === fallback ? i18n.t('config_gesture_default', { action: name }) : name}
                </option>`
              })}
            </select>
          </label>`
        })}
      </div>
    </section>`
  }

  private choose<K extends keyof typeof DEFAULTS>(key: K, value: NonNullable<CardConfig[K]>): void {
    const { config } = this
    if (Object.hasOwn(config, key) ? config[key] === value : value === DEFAULTS[key]) return
    this.commit({ ...config, [key]: value })
  }

  private chooseLayout(layout: Layout): void {
    const { config } = this
    if (Object.hasOwn(config, 'layout') ? config.layout === layout : layout === DEFAULTS.layout) {
      return
    }
    this.commit(tidied({ ...config, layout }))
  }

  private readonly onTitle = (event: Event): void => {
    if (!(event.target instanceof HTMLInputElement)) return
    const { value } = event.target
    const { title, ...rest } = this.config
    if (value.trim() !== '') {
      if (value !== title) this.commit({ ...this.config, title: value })
    } else if (Object.hasOwn(this.config, 'title')) {
      this.commit(rest)
    }
  }

  private readonly onAnimations = (event: Event): void => {
    if (event.target instanceof HTMLInputElement) this.choose('animations', event.target.checked)
  }

  private toggleTask(id: string, on: boolean): void {
    const { tasks: current = [], ...rest } = this.config
    const others = current.filter((item) => item !== id)
    const tasks = on ? [...others, id] : others
    this.commit(tasks.length > 0 ? { ...this.config, tasks } : rest)
  }

  private async focusTasksHeading(): Promise<void> {
    await this.updateComplete
    this.renderRoot.querySelector<HTMLElement>('[data-part="tasks-heading"]')?.focus()
  }

  private taskRow(
    id: string,
    scene: SceneView,
    name: TemplateResult,
    unknown: boolean,
  ): TemplateResult {
    return html`<label class="task" data-task=${id} ?data-unknown=${unknown}>
      <div class="task-thumb" aria-hidden="true">${thumbnail(scene)}</div>
      <div class="task-name">${name}</div>
      <input
        type="checkbox"
        .checked=${this.config.tasks?.includes(id) ?? false}
        @change=${(event: Event): void => {
          if (!(event.target instanceof HTMLInputElement)) return
          const { checked } = event.target
          this.toggleTask(id, checked)
          if (unknown && !checked) void this.focusTasksHeading()
        }}
      />
    </label>`
  }

  private taskList(state: StatePayload, i18n: I18n): TemplateResult {
    const known = new Set(state.tasks.map((task) => task.id))
    const unknown = [...new Set(this.config.tasks ?? [])].filter((id) => !known.has(id))
    if (state.tasks.length === 0 && unknown.length === 0) {
      return html`<p class="hint" data-part="empty">${i18n.t('tasks_empty')}</p>`
    }
    return html`<div class="tasks">
      ${repeat(
        state.tasks,
        (task) => task.id,
        (task) =>
          this.taskRow(task.id, taskScene(task, state), html`<span>${task.title}</span>`, false),
      )}
      ${repeat(
        unknown,
        (id) => id,
        (id) =>
          this.taskRow(
            id,
            UNKNOWN_SCENE,
            html`<span>${i18n.t('config_tasks_unknown')}</span><span class="task-id">${id}</span>`,
            true,
          ),
      )}
    </div>`
  }

  private taskBody(i18n: I18n): TemplateResult {
    const { state, failed } = this.live
    if (state) return this.taskList(state, i18n)
    if (failed) {
      return html`<div class="message" role="alert">
        <p><strong>${i18n.t('card_error')}</strong></p>
        <p class="hint">${i18n.t('config_tasks_kept')}</p>
        <button
          type="button"
          class="ht-btn"
          data-action="retry"
          @click=${(): void => {
            this.live.retry()
            void this.focusTasksHeading()
          }}
        >
          ${i18n.t('action_retry')}
        </button>
      </div>`
    }
    return html`<div class="tasks" role="status">
      <span class="status-text">${i18n.t('card_loading')}</span>
      <div class="skeleton"></div>
      <div class="skeleton"></div>
    </div>`
  }

  override render(): TemplateResult | typeof nothing {
    const { hass, config } = this
    if (!hass) return nothing
    const i18n = localeOf(hass)
    const layout = config.layout ?? DEFAULTS.layout
    const show = config.show ?? DEFAULTS.show
    return html`<label class="ht-label">
        ${i18n.t('config_title')}
        <input
          class="ht-input"
          data-field="title"
          type="text"
          placeholder=${i18n.t('card_title')}
          .value=${config.title ?? ''}
          @input=${this.onTitle}
        />
      </label>
      <section>
        <h3>${i18n.t('config_layout')}</h3>
        <div class="layouts" role="group" aria-label=${i18n.t('config_layout')}>
          ${LAYOUTS.map(
            (item) =>
              html`<button
                type="button"
                class="layout"
                data-layout=${item.value}
                aria-pressed=${layout === item.value ? 'true' : 'false'}
                @click=${(): void => {
                  this.chooseLayout(item.value)
                }}
              >
                ${layoutPreview(item.value)}
                <span>${i18n.t(item.label)}</span>
              </button>`,
          )}
        </div>
      </section>
      ${this.columnsSection(i18n)} ${this.hideSection(i18n, layout)}
      ${this.gestureSection(i18n, layout)}
      <section>
        <h3>${i18n.t('config_show')}</h3>
        <div class="segments" role="group" aria-label=${i18n.t('config_show')}>
          ${SHOWS.map(
            (item) =>
              html`<button
                type="button"
                class="ht-btn segment"
                data-show=${item.value}
                aria-pressed=${show === item.value ? 'true' : 'false'}
                @click=${(): void => {
                  this.choose('show', item.value)
                }}
              >
                ${i18n.t(item.label)}
              </button>`,
          )}
        </div>
      </section>
      <section>
        <h3 data-part="tasks-heading" tabindex="-1">${i18n.t('config_tasks')}</h3>
        <p class="hint" data-part="tasks-hint">${i18n.t('config_tasks_hint')}</p>
        ${this.taskBody(i18n)}
      </section>
      <label class="toggle">
        <span>${i18n.t('config_animations')}</span>
        <input
          class="switch"
          data-field="animations"
          type="checkbox"
          role="switch"
          .checked=${config.animations !== false}
          @change=${this.onAnimations}
        />
      </label>`
  }
}
