import { css, html, LitElement, nothing } from 'lit'
import type { PropertyDeclarations, PropertyValues, TemplateResult } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { styleMap } from 'lit/directives/style-map.js'

import { assertCardConfig } from './card.ts'
import type { CardConfig } from './card.ts'
import type { I18n } from './i18n.ts'
import { hassChanged, localeOf, StateController } from './panel/live.ts'
import { sceneSurface } from './scenes/common.ts'
import { renderScene } from './scenes/index.ts'
import { controls, sceneStyles, tokens } from './styles.ts'
import type { HomeAssistant, SceneView, StatePayload, Task } from './types.ts'

type Layout = NonNullable<CardConfig['layout']>
type Show = NonNullable<CardConfig['show']>

const DEFAULTS = { show: 'today', layout: 'list', animations: true } as const

const LAYOUTS: Array<{ value: Layout; label: 'config_layout_scenes' | 'config_layout_list' }> = [
  { value: 'scenes', label: 'config_layout_scenes' },
  { value: 'list', label: 'config_layout_list' },
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

function layoutPreview(layout: Layout): TemplateResult {
  return html`<div class="preview preview-${layout}" aria-hidden="true">
    ${PREVIEW_SCENES.map(
      (scene) =>
        html`<div class="mini" style=${styleMap(surface(scene))}>
          <div class="mini-art">${thumbnail(scene)}</div>
          <div class="mini-text"><i></i><i></i></div>
        </div>`,
    )}
  </div>`
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

  private choose<K extends keyof typeof DEFAULTS>(key: K, value: NonNullable<CardConfig[K]>): void {
    const { config } = this
    if (Object.hasOwn(config, key) ? config[key] === value : value === DEFAULTS[key]) return
    this.commit({ ...config, [key]: value })
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
                  this.choose('layout', item.value)
                }}
              >
                ${layoutPreview(item.value)}
                <span>${i18n.t(item.label)}</span>
              </button>`,
          )}
        </div>
      </section>
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
