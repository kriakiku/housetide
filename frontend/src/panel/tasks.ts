import { css, html, LitElement, nothing } from 'lit'
import type { PropertyDeclarations, PropertyValues, TemplateResult } from 'lit'
import { guard } from 'lit/directives/guard.js'
import { repeat } from 'lit/directives/repeat.js'

import { fetchTemplates, updateSettings } from '../api.ts'
import type { I18n } from '../i18n.ts'
import { renderScene } from '../scenes/index.ts'
import { controls, sceneStyles, tokens } from '../styles.ts'
import type { HomeAssistant, StatePayload, Task, TaskDraft, TaskView } from '../types.ts'
import { errorMessage, hassChanged, isHass, localeOf } from './live.ts'
import {
  localizeTemplate,
  matchesFilter,
  PICKER_GROUPS,
  templateOf,
  templateTitle,
} from './model.ts'
import { icon, iconStyles } from './tile.ts'

type Templates = Record<string, TaskDraft>

const MAX_RETENTION_DAYS = 36_500

export class HousetideTasks extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false },
    state: { attribute: false },
    now: { attribute: false },
    editing: { state: true },
    templates: { state: true },
    templateError: { state: true },
    templateFilter: { state: true },
    retention: { state: true },
    settingsError: { state: true },
    settingsBusy: { state: true },
  }

  static override styles = [
    tokens,
    controls,
    iconStyles,
    sceneStyles,
    css`
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none;
      }

      h2 {
        margin: 0 0 8px;
        color: var(--ht-muted);
        font-size: 0.875rem;
        font-weight: 600;
      }

      section {
        margin-bottom: 18px;
      }

      .template-filter {
        margin-bottom: 8px;
      }

      h3 {
        margin: 12px 0 6px;
        color: var(--ht-muted);
        font-size: 0.8125rem;
        font-weight: 600;
      }

      .templates {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 8px;
      }

      .template {
        appearance: none;
        display: grid;
        grid-template-columns: 48px minmax(0, 1fr);
        align-items: center;
        gap: 10px;
        min-height: 64px;
        padding: 8px;
        border: 0;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
        color: var(--ht-fg);
        font: inherit;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        touch-action: manipulation;
      }

      .thumb {
        overflow: hidden;
        width: 48px;
        height: 48px;
        border-radius: calc(var(--ht-radius) * 0.7);
        corner-shape: var(--ht-corner);
      }

      .list {
        overflow: hidden;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
      }

      .task {
        appearance: none;
        display: grid;
        grid-template-columns: 48px minmax(0, 1fr) auto 20px;
        align-items: center;
        gap: 12px;
        width: 100%;
        height: 72px;
        padding: 0 12px;
        border: 0;
        border-top: 1px solid var(--ht-divider);
        background: transparent;
        color: var(--ht-fg);
        font: inherit;
        text-align: left;
        cursor: pointer;
        touch-action: manipulation;
      }

      .task:first-child {
        border-top: 0;
      }

      .task:focus-visible,
      .template:focus-visible {
        outline: 2px solid var(--ht-accent);
        outline-offset: -2px;
      }

      .text {
        display: grid;
        min-width: 0;
      }

      .title,
      .sub {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .title {
        font-weight: 600;
      }

      .sub {
        color: var(--ht-muted);
        font-size: 0.875rem;
      }

      .chip {
        padding: 2px 10px;
        border-radius: 999px;
        corner-shape: var(--ht-corner);
        background: var(--ht-surface-alt);
        color: var(--ht-muted);
        font-size: 0.8125rem;
      }

      .chip.is-due,
      .chip.is-in_progress {
        color: var(--ht-accent);
      }

      .chip.is-overdue {
        color: var(--ht-danger);
      }

      .chip.is-clean {
        color: var(--ht-success);
      }

      .note {
        margin: 0 0 12px;
        color: var(--ht-muted);
      }

      .empty {
        padding: 24px;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
        color: var(--ht-muted);
        text-align: center;
      }

      .err {
        color: var(--ht-danger);
        font-size: 0.875rem;
      }

      .settings {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 12px;
        padding: 12px;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
      }

      .settings label {
        flex: 1 1 200px;
      }

      .editor-title {
        display: flex;
        align-items: center;
        min-height: 44px;
        margin: 0 0 8px;
        color: var(--ht-fg);
        font-size: 1.25rem;
      }
    `,
  ]

  declare hass: HomeAssistant
  declare state: StatePayload | null
  declare now: Date
  declare editing: { source: TaskDraft; title: string } | null
  declare templates: Templates | null
  declare templateError: boolean
  declare templateFilter: string
  declare retention: string | null
  declare settingsError: string | null
  declare settingsBusy: boolean

  private opening = 0

  constructor() {
    super()
    this.state = null
    this.now = new Date()
    this.editing = null
    this.templates = null
    this.templateError = false
    this.templateFilter = ''
    this.retention = null
    this.settingsError = null
    this.settingsBusy = false
  }

  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (changed.size !== 1 || !changed.has('hass') || this.editing) return true
    const previous = changed.get('hass')
    return !isHass(previous) || hassChanged(this.hass, previous)
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('hass') && !this.templates && !this.templateError && this.isAdmin) {
      void this.loadTemplates()
    }
  }

  private get isAdmin(): boolean {
    return this.hass.user?.is_admin === true
  }

  private async loadTemplates(): Promise<void> {
    this.templateError = false
    try {
      this.templates = await fetchTemplates(this.hass)
    } catch {
      this.templateError = true
    }
  }

  private async openTemplate(name: string, cached: TaskDraft, i18n: I18n): Promise<void> {
    this.opening += 1
    const { opening } = this
    const fresh = await fetchTemplates(this.hass).catch(() => null)
    if (fresh) this.templates = fresh
    if (opening !== this.opening || this.editing) return
    this.start(name, fresh?.[name] ?? cached, i18n)
  }

  private start(name: string, draft: TaskDraft, i18n: I18n): void {
    const source = localizeTemplate(name, draft, i18n)
    this.editing = { source, title: i18n.t('action_new_task') }
  }

  private open(task: Task): void {
    this.editing = { source: task, title: task.title }
  }

  private async saveSettings(days: number): Promise<void> {
    this.settingsBusy = true
    this.settingsError = null
    try {
      await updateSettings(this.hass, { history_retention_days: days })
      this.retention = null
    } catch (error) {
      this.settingsError = errorMessage(error)
    } finally {
      this.settingsBusy = false
    }
  }

  private renderTemplates(i18n: I18n): TemplateResult | typeof nothing {
    if (!this.isAdmin) return nothing
    const templates = this.templates
    const groups = PICKER_GROUPS.map((group) => {
      const label = i18n.t(group.label)
      const entries = group.scenes.flatMap((scene) => {
        const name = templateOf(scene)
        const draft = templates && Object.hasOwn(templates, name) ? templates[name] : undefined
        if (!draft) return []
        const title = templateTitle(name, i18n) ?? draft.title
        return matchesFilter(this.templateFilter, title, draft.title, name, label)
          ? [{ name, draft, title }]
          : []
      })
      return { label, entries }
    }).filter((group) => group.entries.length > 0)
    return html`<section>
      <h2>${i18n.t('action_new_task')} · ${i18n.t('template_prompt')}</h2>
      ${
        this.templateError
          ? html`<p class="err" role="alert">${i18n.t('error_templates')}</p>
              <button
                class="ht-btn"
                data-action="retry-templates"
                @click=${(): void => {
                  void this.loadTemplates()
                }}
              >
                ${i18n.t('action_retry')}
              </button>`
          : nothing
      }
      ${
        templates
          ? html`<input
              class="ht-input template-filter"
              type="search"
              data-field="template-filter"
              placeholder=${i18n.t('picker_filter')}
              aria-label=${i18n.t('picker_filter')}
              .value=${this.templateFilter}
              @input=${(event: Event): void => {
                const { target } = event
                if (target instanceof HTMLInputElement) this.templateFilter = target.value
              }}
            />`
          : nothing
      }
      ${groups.map(
        (group) =>
          html`<h3>${group.label}</h3>
            <div class="templates">
              ${repeat(
                group.entries,
                (entry) => entry.name,
                ({ name, draft, title }) =>
                  html`<button
                    class="template"
                    data-template=${name}
                    @click=${(): void => {
                      void this.openTemplate(name, draft, i18n)
                    }}
                  >
                    <span class="thumb">
                      ${guard([draft.scene], () =>
                        renderScene(
                          {
                            name: draft.scene,
                            state: 'accumulating',
                            fill: 0.7,
                            stink: 0,
                            progress: 0,
                          },
                          { animations: false },
                        ),
                      )}
                    </span>
                    <span>${title}</span>
                  </button>`,
              )}
            </div>`,
      )}
      ${
        templates && groups.length === 0
          ? html`<p class="note" data-part="no-templates">${i18n.t('picker_empty')}</p>`
          : nothing
      }
    </section>`
  }

  private renderRow(task: Task, view: TaskView | undefined, i18n: I18n): TemplateResult {
    const status = view?.status ?? 'disabled'
    return html`<button
      class="task"
      data-task=${task.id}
      @click=${(): void => {
        this.open(task)
      }}
    >
      <span class="thumb">
        ${renderScene(
          view?.scene ?? {
            name: task.scene,
            state: 'resting',
            fill: 0,
            stink: 0,
            progress: 0,
            ...(task.look ? { look: task.look } : {}),
          },
          { animations: false },
        )}
      </span>
      <span class="text">
        <span class="title">${task.title}</span>
        <span class="sub">${i18n.scheduleText(task.schedule)}</span>
      </span>
      <span class="chip is-${status}">${i18n.t(`status_${status}`)}</span>
      ${icon('chevron')}
    </button>`
  }

  private renderList(state: StatePayload, i18n: I18n): TemplateResult {
    const views = new Map(state.views.map((view) => [view.task_id, view]))
    return html`<section>
      <h2>${i18n.t('tab_tasks')}</h2>
      ${
        state.tasks.length === 0
          ? html`<div class="empty" data-part="empty">${i18n.t('tasks_empty')}</div>`
          : html`<div class="list">
              ${repeat(
                state.tasks,
                (task) => task.id,
                (task) => this.renderRow(task, views.get(task.id), i18n),
              )}
            </div>`
      }
    </section>`
  }

  private renderSettings(state: StatePayload, i18n: I18n): TemplateResult {
    const value = this.retention ?? String(state.settings.history_retention_days)
    const parsed = /^\d+$/.test(value.trim()) ? Number(value.trim()) : Number.NaN
    const tooLarge = parsed > MAX_RETENTION_DAYS
    const invalid = !Number.isInteger(parsed) || parsed < 1 || tooLarge
    const dirty = this.retention !== null && parsed !== state.settings.history_retention_days
    return html`<section>
      <h2>${i18n.t('settings_title')}</h2>
      <div class="settings">
        <label class="ht-label">
          ${i18n.t('field_retention')}
          <input
            class="ht-input"
            data-field="retention"
            inputmode="numeric"
            .value=${value}
            ?disabled=${!this.isAdmin}
            aria-invalid=${invalid ? 'true' : 'false'}
            @input=${(event: Event): void => {
              const { target } = event
              if (target instanceof HTMLInputElement) this.retention = target.value
            }}
          />
          ${
            invalid
              ? html`<span class="err" role="alert"
                  >${
                    tooLarge
                      ? i18n.t('error_max', { max: MAX_RETENTION_DAYS })
                      : i18n.t('error_min', { min: 1 })
                  }</span
                >`
              : nothing
          }
        </label>
        ${
          this.isAdmin
            ? html`<button
                class="ht-btn ht-btn-primary"
                data-action="save-settings"
                ?disabled=${invalid || !dirty || this.settingsBusy}
                @click=${(): void => {
                  void this.saveSettings(parsed)
                }}
              >
                ${i18n.t('action_save')}
              </button>`
            : nothing
        }
        ${
          this.settingsError === null
            ? nothing
            : html`<span class="err" role="alert"
                >${i18n.t('error_generic', { message: this.settingsError })}</span
              >`
        }
      </div>
    </section>`
  }

  override render(): TemplateResult | typeof nothing {
    const { hass, state } = this
    const i18n = localeOf(hass)
    if (this.editing) {
      return html`<h2 class="editor-title">${this.editing.title}</h2>
        <housetide-editor
          .hass=${hass}
          .source=${this.editing.source}
          .now=${this.now}
          ?readonly=${!this.isAdmin}
          @ht-close=${(): void => {
            this.editing = null
          }}
        ></housetide-editor>`
    }
    if (!state) return html`<p class="note" aria-busy="true">${i18n.t('loading')}</p>`
    return html`${
      this.isAdmin
        ? nothing
        : html`<p class="note" data-part="read-only">${i18n.t('tasks_read_only')}</p>`
    }
    ${this.renderTemplates(i18n)} ${this.renderList(state, i18n)}
    ${this.renderSettings(state, i18n)}`
  }
}
