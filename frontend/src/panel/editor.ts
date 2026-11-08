import { css, html, LitElement, nothing } from 'lit'
import type { PropertyDeclarations, PropertyValues, TemplateResult } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { repeat } from 'lit/directives/repeat.js'

import { createTask, deleteTask, updateTask } from '../api.ts'
import type { I18n, MessageKey } from '../i18n.ts'
import { renderScene } from '../scenes/index.ts'
import { controls, sceneStyles, tokens } from '../styles.ts'
import type {
  HassEntityState,
  HomeAssistant,
  IntervalAnchor,
  OnMissed,
  SceneName,
  StageRole,
  TaskDraft,
} from '../types.ts'
import { errorMessage, isHass, localeOf, zoneOf } from './live.ts'
import {
  addStage,
  entityOf,
  formatEntityValue,
  formFromDraft,
  liveMatch,
  moveStage,
  removeStage,
  suggestEntities,
  taskFromForm,
  triggerSentence,
  validateForm,
} from './model.ts'
import type { Condition, FormErrors, ScheduleType, StageForm, TaskForm } from './model.ts'
import { icon, iconStyles } from './tile.ts'

const SCENES: SceneName[] = ['generic', 'pills', 'laundry', 'plant']
const SCHEDULES: ScheduleType[] = ['once', 'daily', 'weekly', 'interval']
const WEEK = [0, 1, 2, 3, 4, 5, 6]

interface Choice<T extends string> {
  value: T
  label: string
}

function eventValue(event: Event): string {
  const { target } = event
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  ) {
    return target.value
  }
  return ''
}

function eventChecked(event: Event): boolean {
  const { target } = event
  return target instanceof HTMLInputElement && target.checked
}

export class HousetideEditor extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false },
    source: { attribute: false },
    now: { attribute: false },
    readonly: { type: Boolean },
    form: { state: true },
    showErrors: { state: true },
    saving: { state: true },
    failure: { state: true },
    picker: { state: true },
    confirming: { state: true },
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

      .form {
        display: grid;
        gap: 14px;
        container-type: inline-size;
      }

      h2 {
        margin: 0;
        font-size: 1.25rem;
      }

      section {
        display: grid;
        align-content: start;
        gap: 12px;
        padding: 14px;
        border-radius: var(--ht-radius);
        background: var(--ht-surface);
      }

      h3 {
        margin: 0;
        font-size: 1rem;
      }

      .columns {
        display: grid;
        align-items: start;
        gap: 14px;
      }

      .stack {
        display: grid;
        gap: 14px;
      }

      .pair {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      @container (min-width: 720px) {
        .columns {
          grid-template-columns: 1fr 1fr;
        }
      }

      textarea.ht-input {
        min-height: 72px;
        resize: vertical;
      }

      select.ht-input {
        appearance: auto;
      }

      .ht-input[aria-invalid='true'] {
        border-color: var(--ht-danger);
      }

      .err {
        color: var(--ht-danger);
        font-size: 0.8125rem;
      }

      .hint {
        color: var(--ht-muted);
        font-size: 0.8125rem;
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

      .scenes {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
      }

      .scene {
        appearance: none;
        display: grid;
        gap: 4px;
        padding: 4px 4px 6px;
        border: 2px solid transparent;
        border-radius: var(--ht-radius);
        background: var(--ht-surface-alt);
        color: var(--ht-fg);
        font: inherit;
        font-size: 0.8125rem;
        cursor: pointer;
        touch-action: manipulation;
      }

      .scene[aria-pressed='true'] {
        border-color: var(--ht-accent);
      }

      .scene:disabled {
        cursor: default;
      }

      .scene-art {
        overflow: hidden;
        aspect-ratio: 1;
        border-radius: calc(var(--ht-radius) * 0.7);
      }

      .check {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
        color: var(--ht-fg);
      }

      .check input {
        width: 24px;
        height: 24px;
        accent-color: var(--ht-accent);
      }

      .inline {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .inline .ht-input {
        flex: 1;
        min-width: 0;
      }

      .swatch {
        flex: 1;
        padding: 4px;
      }

      .stage {
        padding: 12px;
        border-radius: var(--ht-radius);
        background: var(--ht-surface-alt);
        display: grid;
        gap: 10px;
      }

      .stage .ht-input {
        background: var(--ht-surface);
      }

      .stage-head {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .stage-head strong {
        flex: 1;
      }

      .icon-btn {
        width: 44px;
        padding: 0;
      }

      .rule {
        display: grid;
        gap: 10px;
        padding: 10px;
        border: 1px dashed var(--ht-divider);
        border-radius: var(--ht-radius);
      }

      .picker {
        display: grid;
        gap: 4px;
      }

      .suggestions {
        display: grid;
        overflow: hidden;
        border: 1px solid var(--ht-divider);
        border-radius: calc(var(--ht-radius) / 1.5);
      }

      .suggestion {
        appearance: none;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 2px 8px;
        min-height: 52px;
        padding: 6px 10px;
        border: 0;
        border-top: 1px solid var(--ht-divider);
        background: var(--ht-surface);
        color: var(--ht-fg);
        font: inherit;
        text-align: left;
        cursor: pointer;
        touch-action: manipulation;
      }

      .suggestion:first-child {
        border-top: 0;
      }

      .suggestion b,
      .suggestion small {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-weight: 500;
      }

      .suggestion small {
        grid-column: 1;
        color: var(--ht-muted);
      }

      .suggestion em {
        grid-row: 1 / span 2;
        grid-column: 2;
        align-self: center;
        color: var(--ht-muted);
        font-style: normal;
      }

      .no-match {
        padding: 12px;
        color: var(--ht-muted);
      }

      .live {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px 10px;
        min-height: 20px;
        font-size: 0.875rem;
      }

      .live-value {
        color: var(--ht-muted);
      }

      .met {
        color: var(--ht-success);
      }

      .unmet {
        color: var(--ht-muted);
      }

      .warn {
        color: var(--ht-warning);
      }

      .sentence {
        margin: 0;
        font-size: 0.9375rem;
      }

      footer {
        position: sticky;
        z-index: 2;
        bottom: -12px;
        margin-inline: -12px;
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 60px;
        padding: 8px 12px;
        box-sizing: border-box;
        border-top: 1px solid var(--ht-divider);
        background: var(--ht-surface);
      }

      footer .message {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        color: var(--ht-danger);
        font-size: 0.875rem;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      footer .spacer {
        flex: 1;
      }
    `,
  ]

  declare hass: HomeAssistant
  declare source: TaskDraft
  declare now: Date
  declare readonly: boolean
  declare form: TaskForm | null
  declare showErrors: boolean
  declare saving: boolean
  declare failure: string | null
  declare picker: number | null
  declare confirming: boolean

  constructor() {
    super()
    this.now = new Date()
    this.readonly = false
    this.form = null
    this.showErrors = false
    this.saving = false
    this.failure = null
    this.picker = null
    this.confirming = false
  }

  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (changed.size !== 1 || !changed.has('hass') || !this.form) return true
    const previous = changed.get('hass')
    if (!isHass(previous) || this.picker !== null) return true
    return this.form.stages.some(
      (stage) => previous.states[stage.entity] !== this.hass.states[stage.entity],
    )
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('source')) {
      this.form = formFromDraft(this.source, zoneOf(this.hass), this.now)
      this.showErrors = false
      this.failure = null
      this.confirming = false
    }
  }

  private patch(change: Partial<TaskForm>): void {
    if (this.form) this.form = { ...this.form, ...change }
  }

  private patchStage(index: number, change: Partial<StageForm>): void {
    if (!this.form) return
    this.patch({
      stages: this.form.stages.map((stage, i) => (i === index ? { ...stage, ...change } : stage)),
    })
  }

  private errors(form: TaskForm): FormErrors {
    return this.showErrors ? validateForm(form, zoneOf(this.hass)) : {}
  }

  private async save(): Promise<void> {
    const form = this.form
    if (!form || this.readonly || this.saving) return
    const zone = zoneOf(this.hass)
    if (Object.keys(validateForm(form, zone)).length > 0) {
      this.showErrors = true
      await this.updateComplete
      this.renderRoot.querySelector('[aria-invalid="true"]')?.scrollIntoView?.({ block: 'center' })
      return
    }
    this.saving = true
    this.failure = null
    try {
      const draft = taskFromForm(form, zone)
      if (draft.id === undefined) await createTask(this.hass, draft)
      else await updateTask(this.hass, { ...draft, id: draft.id })
      this.close()
    } catch (error) {
      this.failure = errorMessage(error)
    } finally {
      this.saving = false
    }
  }

  private async removeTask(): Promise<void> {
    const id = this.form?.id
    if (!id || this.readonly) return
    this.saving = true
    this.failure = null
    try {
      await deleteTask(this.hass, id)
      this.close()
    } catch (error) {
      this.failure = errorMessage(error)
    } finally {
      this.saving = false
    }
  }

  private readonly close = (): void => {
    this.dispatchEvent(new CustomEvent('ht-close', { bubbles: true, composed: true }))
  }

  private message(
    error: FormErrors[string] | undefined,
    i18n: I18n,
  ): TemplateResult | typeof nothing {
    if (!error) return nothing
    return html`<span class="err" role="alert">${i18n.t(error.key, error.vars)}</span>`
  }

  private input(options: {
    path: string
    label: string
    value: string
    errors: FormErrors
    i18n: I18n
    onInput: (value: string) => void
    type?: string
    inputmode?: 'numeric' | 'decimal'
    placeholder?: string
    hint?: string
  }): TemplateResult {
    const { path, label, value, errors, i18n, onInput } = options
    return html`<label class="ht-label">
      ${label}
      <input
        class="ht-input"
        data-field=${path}
        type=${options.type ?? 'text'}
        inputmode=${ifDefined(options.inputmode)}
        placeholder=${ifDefined(options.placeholder)}
        aria-invalid=${errors[path] ? 'true' : 'false'}
        .value=${value}
        ?disabled=${this.readonly}
        @input=${(event: Event): void => {
          onInput(eventValue(event))
        }}
      />
      ${options.hint ? html`<span class="hint">${options.hint}</span>` : nothing}
      ${this.message(errors[path], i18n)}
    </label>`
  }

  private select<T extends string>(options: {
    path: string
    label: string
    value: T
    choices: Array<Choice<T>>
    onChange: (value: T) => void
  }): TemplateResult {
    const { path, label, value, choices, onChange } = options
    return html`<label class="ht-label">
      ${label}
      <select
        class="ht-input"
        data-field=${path}
        ?disabled=${this.readonly}
        @change=${(event: Event): void => {
          const picked = choices.find((choice) => choice.value === eventValue(event))
          if (picked) onChange(picked.value)
        }}
      >
        ${choices.map(
          (choice) =>
            html`<option value=${choice.value} ?selected=${choice.value === value}>
              ${choice.label}
            </option>`,
        )}
      </select>
    </label>`
  }

  private renderDetails(form: TaskForm, errors: FormErrors, i18n: I18n): TemplateResult {
    return html`<section>
      <h3>${i18n.t('section_details')}</h3>
      ${this.input({
        path: 'title',
        label: i18n.t('field_title'),
        value: form.title,
        errors,
        i18n,
        onInput: (title) => {
          this.patch({ title })
        },
      })}
      <div class="ht-label">
        ${i18n.t('field_scene')}
        <div class="scenes">
          ${SCENES.map(
            (scene) =>
              html`<button
                type="button"
                class="scene"
                data-scene=${scene}
                aria-pressed=${form.scene === scene ? 'true' : 'false'}
                ?disabled=${this.readonly}
                @click=${(): void => {
                  this.patch({ scene })
                }}
              >
                <span class="scene-art">
                  ${renderScene(
                    { name: scene, state: 'accumulating', fill: 0.6, stink: 0, progress: 0 },
                    { animations: false },
                  )}
                </span>
                ${i18n.t(`scene_${scene}`)}
              </button>`,
          )}
        </div>
      </div>
      <div class="pair">
        ${this.input({
          path: 'icon',
          label: i18n.t('field_icon'),
          value: form.icon,
          errors,
          i18n,
          placeholder: 'mdi:…',
          hint: i18n.t('hint_icon'),
          onInput: (value) => {
            this.patch({ icon: value })
          },
        })}
        <div class="ht-label">
          ${i18n.t('field_color')}
          <div class="inline">
            <input
              class="ht-input swatch"
              type="color"
              data-field="color"
              .value=${form.color || '#5ab4ff'}
              ?disabled=${this.readonly}
              @input=${(event: Event): void => {
                this.patch({ color: eventValue(event) })
              }}
            />
            <button
              type="button"
              class="ht-btn"
              data-action="clear-color"
              ?disabled=${this.readonly || !form.color}
              @click=${(): void => {
                this.patch({ color: '' })
              }}
            >
              ${i18n.t('action_clear')}
            </button>
          </div>
        </div>
      </div>
      <label class="ht-label">
        ${i18n.t('field_notes')}
        <textarea
          class="ht-input"
          data-field="notes"
          .value=${form.notes}
          ?disabled=${this.readonly}
          @input=${(event: Event): void => {
            this.patch({ notes: eventValue(event) })
          }}
        ></textarea>
      </label>
      ${this.renderAssignee(form, errors, i18n)}
      <label class="check">
        <input
          type="checkbox"
          data-field="enabled"
          .checked=${form.enabled}
          ?disabled=${this.readonly}
          @change=${(event: Event): void => {
            this.patch({ enabled: eventChecked(event) })
          }}
        />
        ${i18n.t('field_enabled')}
      </label>
    </section>`
  }

  private renderAssignee(form: TaskForm, errors: FormErrors, i18n: I18n): TemplateResult {
    const people = Object.values(this.hass.states).filter((entity) =>
      entity.entity_id.startsWith('person.'),
    )
    return html`<label class="ht-label">
      ${i18n.t('field_assignee')}
      <input
        class="ht-input"
        data-field="assignee"
        list="ht-people"
        placeholder=${i18n.t('hint_assignee')}
        .value=${form.assignee}
        ?disabled=${this.readonly}
        aria-invalid=${errors.assignee ? 'true' : 'false'}
        @input=${(event: Event): void => {
          this.patch({ assignee: eventValue(event) })
        }}
      />
      <datalist id="ht-people">
        ${people.map((person) => html`<option value=${person.entity_id}></option>`)}
      </datalist>
    </label>`
  }

  private renderSchedule(form: TaskForm, errors: FormErrors, i18n: I18n): TemplateResult {
    const time = this.input({
      path: 'time',
      label: i18n.t('field_time'),
      value: form.time,
      type: 'time',
      errors,
      i18n,
      onInput: (value) => {
        this.patch({ time: value })
      },
    })
    let fields: TemplateResult
    switch (form.schedule) {
      case 'once':
        fields = this.input({
          path: 'due',
          label: i18n.t('field_due'),
          value: form.due,
          type: 'datetime-local',
          errors,
          i18n,
          onInput: (due) => {
            this.patch({ due })
          },
        })
        break
      case 'daily':
        fields = time
        break
      case 'weekly':
        fields = html`<div class="ht-label">
            ${i18n.t('field_weekdays')}
            <div class="segments">${WEEK.map((day) => this.weekdayButton(form, day, i18n))}</div>
            ${this.message(errors.weekdays, i18n)}
          </div>
          ${time}`
        break
      default:
        fields = html`<div class="pair">
            ${this.input({
              path: 'every_days',
              label: i18n.t('field_every_days'),
              value: form.every_days,
              inputmode: 'numeric',
              errors,
              i18n,
              onInput: (every_days) => {
                this.patch({ every_days })
              },
            })}
            ${time}
          </div>
          ${this.select<IntervalAnchor>({
            path: 'anchor',
            label: i18n.t('field_anchor'),
            value: form.anchor,
            choices: [
              { value: 'completion', label: i18n.t('anchor_completion') },
              { value: 'schedule', label: i18n.t('anchor_schedule') },
            ],
            onChange: (anchor) => {
              this.patch({ anchor })
            },
          })}`
        break
    }
    return html`<section>
      <h3>${i18n.t('field_schedule')}</h3>
      <div class="segments" role="group" aria-label=${i18n.t('field_schedule_type')}>
        ${SCHEDULES.map(
          (type) =>
            html`<button
              type="button"
              class="ht-btn segment"
              data-schedule=${type}
              aria-pressed=${form.schedule === type ? 'true' : 'false'}
              ?disabled=${this.readonly}
              @click=${(): void => {
                this.patch({ schedule: type })
              }}
            >
              ${i18n.t(`schedule_${type}`)}
            </button>`,
        )}
      </div>
      ${fields}
    </section>`
  }

  private weekdayButton(form: TaskForm, day: number, i18n: I18n): TemplateResult {
    const on = form.weekdays.includes(day)
    return html`<button
      type="button"
      class="ht-btn segment"
      data-weekday=${day}
      aria-label=${i18n.weekday(day, 'long')}
      aria-pressed=${on ? 'true' : 'false'}
      ?disabled=${this.readonly}
      @click=${(): void => {
        this.patch({
          weekdays: on ? form.weekdays.filter((item) => item !== day) : [...form.weekdays, day],
        })
      }}
    >
      ${i18n.weekday(day, 'short')}
    </button>`
  }

  private renderBehaviour(form: TaskForm, errors: FormErrors, i18n: I18n): TemplateResult {
    return html`<section>
      <h3>${i18n.t('section_behaviour')}</h3>
      ${this.select<OnMissed>({
        path: 'on_missed',
        label: i18n.t('field_on_missed'),
        value: form.on_missed,
        choices: [
          { value: 'carry', label: i18n.t('on_missed_carry') },
          { value: 'skip', label: i18n.t('on_missed_skip') },
        ],
        onChange: (on_missed) => {
          this.patch({ on_missed })
        },
      })}
      <div class="pair">
        ${this.input({
          path: 'clean_for',
          label: i18n.t('field_clean_for'),
          value: form.clean_for,
          inputmode: 'numeric',
          hint: i18n.t('hint_clean_for'),
          errors,
          i18n,
          onInput: (clean_for) => {
            this.patch({ clean_for })
          },
        })}
        ${this.input({
          path: 'grace',
          label: i18n.t('field_grace'),
          value: form.grace,
          inputmode: 'numeric',
          hint: i18n.t('hint_grace'),
          errors,
          i18n,
          onInput: (grace) => {
            this.patch({ grace })
          },
        })}
      </div>
    </section>`
  }

  private renderSuggestions(stage: StageForm, index: number, i18n: I18n): TemplateResult {
    const items = suggestEntities(this.hass.states, stage.entity, stage.condition)
    if (items.length === 0) {
      return html`<div class="suggestions">
        <div class="no-match">${i18n.t('entity_no_matches')}</div>
      </div>`
    }
    return html`<div
      class="suggestions"
      @mousedown=${(event: Event): void => {
        event.preventDefault()
      }}
    >
      ${items.map(
        (item) =>
          html`<button
            type="button"
            class="suggestion"
            data-entity=${item.entity_id}
            @click=${(): void => {
              this.patchStage(index, { entity: item.entity_id })
              this.picker = null
            }}
          >
            <b>${item.name}</b><small>${item.entity_id}</small><em>${item.state}</em>
          </button>`,
      )}
    </div>`
  }

  private renderLive(
    stage: StageForm,
    entity: HassEntityState | undefined,
    i18n: I18n,
  ): TemplateResult | typeof nothing {
    const match = liveMatch(stage, entity)
    if (!stage.entity.trim()) return nothing
    const labels: Partial<Record<typeof match, [MessageKey, string]>> = {
      met: ['trigger_met', 'met'],
      unmet: ['trigger_unmet', 'unmet'],
      unavailable: ['entity_unavailable', 'warn'],
      missing: ['entity_not_found', 'warn'],
    }
    const label = labels[match]
    return html`<div class="live" data-part="live" role="status">
      ${
        entity
          ? html`<span class="live-value"
              >${i18n.t('field_current_value', { value: formatEntityValue(entity) })}</span
            >`
          : nothing
      }
      ${label ? html`<span class=${label[1]} data-match=${match}>${i18n.t(label[0])}</span>` : nothing}
    </div>`
  }

  private renderTrigger(
    stage: StageForm,
    index: number,
    errors: FormErrors,
    i18n: I18n,
  ): TemplateResult {
    const path = `stages.${index}`
    const entity = entityOf(this.hass.states, stage.entity.trim())
    const conditions: Array<Choice<Condition>> = [
      { value: 'above', label: i18n.t('condition_above') },
      { value: 'below', label: i18n.t('condition_below') },
      { value: 'state', label: i18n.t('condition_state') },
    ]
    return html`<div class="rule">
      <label class="check">
        <input
          type="checkbox"
          data-field="${path}.auto"
          .checked=${stage.condition !== 'none'}
          ?disabled=${this.readonly}
          @change=${(event: Event): void => {
            this.patchStage(index, { condition: eventChecked(event) ? 'above' : 'none' })
          }}
        />
        ${i18n.t('field_trigger')}
      </label>
      ${
        stage.condition === 'none'
          ? nothing
          : html`<div class="picker">
                <label class="ht-label">
                  ${i18n.t('field_entity')}
                  <input
                    class="ht-input"
                    data-field="${path}.entity"
                    autocomplete="off"
                    spellcheck="false"
                    placeholder=${i18n.t('entity_placeholder')}
                    aria-invalid=${errors[`${path}.entity`] ? 'true' : 'false'}
                    .value=${stage.entity}
                    ?disabled=${this.readonly}
                    @focus=${(): void => {
                      this.picker = index
                    }}
                    @blur=${(): void => {
                      if (this.picker === index) this.picker = null
                    }}
                    @input=${(event: Event): void => {
                      this.patchStage(index, { entity: eventValue(event) })
                    }}
                  />
                </label>
                ${this.picker === index ? this.renderSuggestions(stage, index, i18n) : nothing}
                ${this.message(errors[`${path}.entity`], i18n)}
              </div>
              <div class="pair">
                ${this.select<Condition>({
                  path: `${path}.condition`,
                  label: i18n.t('field_condition'),
                  value: stage.condition,
                  choices: conditions,
                  onChange: (condition) => {
                    this.patchStage(index, { condition })
                  },
                })}
                ${this.input({
                  path: `${path}.value`,
                  label: i18n.t('field_value'),
                  value: stage.value,
                  ...(stage.condition === 'state' ? {} : { inputmode: 'decimal' as const }),
                  errors,
                  i18n,
                  onInput: (value) => {
                    this.patchStage(index, { value })
                  },
                })}
                ${this.input({
                  path: `${path}.hold`,
                  label: i18n.t('field_for_seconds'),
                  value: stage.hold,
                  inputmode: 'numeric',
                  errors,
                  i18n,
                  onInput: (hold) => {
                    this.patchStage(index, { hold })
                  },
                })}
              </div>
              ${this.renderLive(stage, entity, i18n)}`
      }
      <p class="sentence" data-part="sentence">${triggerSentence(stage, entity, i18n)}</p>
    </div>`
  }

  private renderStage(
    form: TaskForm,
    stage: StageForm,
    index: number,
    errors: FormErrors,
    i18n: I18n,
  ): TemplateResult {
    const path = `stages.${index}`
    const roles: Array<Choice<StageRole>> = [
      { value: 'todo', label: i18n.t('role_todo') },
      { value: 'running', label: i18n.t('role_running') },
      { value: 'waiting', label: i18n.t('role_waiting') },
    ]
    return html`<div class="stage" data-stage=${index}>
      <div class="stage-head">
        <strong>${i18n.t('field_stage_n', { n: index + 1 })}</strong>
        ${
          this.readonly
            ? nothing
            : html`<button
                  type="button"
                  class="ht-btn icon-btn"
                  aria-label=${i18n.t('action_move_up')}
                  ?disabled=${index === 0}
                  @click=${(): void => {
                    this.form = moveStage(form, index, -1)
                  }}
                >
                  ${icon('up')}
                </button>
                <button
                  type="button"
                  class="ht-btn icon-btn"
                  aria-label=${i18n.t('action_move_down')}
                  ?disabled=${index === form.stages.length - 1}
                  @click=${(): void => {
                    this.form = moveStage(form, index, 1)
                  }}
                >
                  ${icon('down')}
                </button>
                <button
                  type="button"
                  class="ht-btn icon-btn"
                  data-action="remove-stage"
                  aria-label=${i18n.t('action_remove')}
                  ?disabled=${form.stages.length === 1}
                  @click=${(): void => {
                    this.form = removeStage(form, index)
                  }}
                >
                  ${icon('trash')}
                </button>`
        }
      </div>
      <div class="pair">
        ${this.input({
          path: `${path}.title`,
          label: i18n.t('field_stage_title'),
          value: stage.title,
          errors,
          i18n,
          onInput: (title) => {
            this.patchStage(index, { title })
          },
        })}
        ${this.input({
          path: `${path}.action`,
          label: i18n.t('field_action'),
          value: stage.action,
          errors,
          i18n,
          onInput: (action) => {
            this.patchStage(index, { action })
          },
        })}
      </div>
      <div class="pair">
        ${this.select<StageRole>({
          path: `${path}.role`,
          label: i18n.t('field_role'),
          value: stage.role,
          choices: roles,
          onChange: (role) => {
            this.patchStage(index, { role })
          },
        })}
        ${this.input({
          path: `${path}.stale`,
          label: i18n.t('field_stale_after'),
          value: stage.stale,
          inputmode: 'numeric',
          hint: i18n.t('hint_stale_after'),
          errors,
          i18n,
          onInput: (stale) => {
            this.patchStage(index, { stale })
          },
        })}
      </div>
      ${this.renderTrigger(stage, index, errors, i18n)}
    </div>`
  }

  private renderFooter(form: TaskForm, errors: FormErrors, i18n: I18n): TemplateResult {
    if (this.readonly) {
      return html`<footer>
        <span class="spacer"></span>
        <button type="button" class="ht-btn" data-action="cancel" @click=${this.close}>
          ${i18n.t('action_close')}
        </button>
      </footer>`
    }
    if (this.confirming) {
      return html`<footer>
        <span class="message">${i18n.t('confirm_delete', { title: form.title })}</span>
        <button
          type="button"
          class="ht-btn"
          @click=${(): void => {
            this.confirming = false
          }}
        >
          ${i18n.t('action_cancel')}
        </button>
        <button
          type="button"
          class="ht-btn ht-btn-danger"
          data-action="confirm-delete"
          ?disabled=${this.saving}
          @click=${(): void => {
            void this.removeTask()
          }}
        >
          ${i18n.t('action_delete')}
        </button>
      </footer>`
    }
    const failure =
      this.failure === null ? null : i18n.t('error_generic', { message: this.failure })
    const problem = failure ?? (Object.keys(errors).length > 0 ? i18n.t('error_form') : null)
    return html`<footer>
      ${
        form.id === null
          ? nothing
          : html`<button
              type="button"
              class="ht-btn ht-btn-danger"
              data-action="delete"
              @click=${(): void => {
                this.confirming = true
              }}
            >
              ${i18n.t('action_delete')}
            </button>`
      }
      ${
        problem === null
          ? html`<span class="spacer"></span>`
          : html`<span class="message" role="alert">${problem}</span>`
      }
      <button type="button" class="ht-btn" data-action="cancel" @click=${this.close}>
        ${i18n.t('action_cancel')}
      </button>
      <button
        type="button"
        class="ht-btn ht-btn-primary"
        data-action="save"
        ?disabled=${this.saving}
        @click=${(): void => {
          void this.save()
        }}
      >
        ${i18n.t('action_save')}
      </button>
    </footer>`
  }

  override render(): TemplateResult | typeof nothing {
    const form = this.form
    if (!form) return nothing
    const i18n = localeOf(this.hass)
    const errors = this.errors(form)
    return html`<div class="form">
      <div class="columns">
        <div class="stack">${this.renderDetails(form, errors, i18n)}</div>
        <div class="stack">
          ${this.renderSchedule(form, errors, i18n)} ${this.renderBehaviour(form, errors, i18n)}
        </div>
      </div>
      <section>
        <h3>${i18n.t('field_stages')}</h3>
        ${repeat(
          form.stages,
          (stage) => stage.id,
          (stage, index) => this.renderStage(form, stage, index, errors, i18n),
        )}
        ${
          this.readonly
            ? nothing
            : html`<button
                type="button"
                class="ht-btn"
                data-action="add-stage"
                @click=${(): void => {
                  this.form = addStage(form)
                }}
              >
                ${icon('plus')}${i18n.t('action_add_stage')}
              </button>`
        }
      </section>
      ${this.renderFooter(form, errors, i18n)}
    </div>`
  }
}
