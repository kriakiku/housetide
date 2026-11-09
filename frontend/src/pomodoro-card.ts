import { css, html, LitElement, nothing } from 'lit'
import type { PropertyDeclarations, PropertyValues, TemplateResult } from 'lit'

import { hassChanged, localeOf, pageHidden, StateController } from './panel/live.ts'
import { tokens } from './styles.ts'
import type { HomeAssistant } from './types.ts'

export interface PomodoroCardConfig {
  type?: string
  title?: string
}

export function assertPomodoroConfig(config: PomodoroCardConfig): void {
  if (config.title !== undefined && typeof config.title !== 'string') {
    throw new TypeError('title must be text')
  }
}

export class HousetidePomodoroCard extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false, hasChanged: hassChanged },
    config: { state: true },
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }

      ha-card {
        display: block;
        overflow: hidden;
        height: 100%;
        border: none;
        border-radius: calc(var(--ht-radius) * 1.3);
        corner-shape: var(--ht-corner);
        background: none;
      }

      .message {
        display: grid;
        gap: 4px;
        padding: 16px;
        background: var(--ht-surface);
      }

      .message span {
        color: var(--ht-muted);
        font-size: 0.875rem;
      }

      .skeleton {
        height: 208px;
        background: var(--ht-surface-alt);
        opacity: 0.5;
      }
    `,
  ]

  static getStubConfig(): PomodoroCardConfig {
    return {}
  }

  declare hass: HomeAssistant | undefined
  declare config: PomodoroCardConfig

  private readonly live: StateController

  constructor() {
    super()
    this.config = {}
    this.live = new StateController(this, () => this.hass)
  }

  setConfig(config: PomodoroCardConfig): void {
    assertPomodoroConfig(config)
    this.config = { ...config }
  }

  getCardSize(): number {
    return 4
  }

  getGridOptions(): { columns: number; rows: 'auto'; min_columns: number; min_rows: number } {
    return { columns: 6, rows: 'auto', min_columns: 6, min_rows: 4 }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('hass')) this.live.sync()
  }

  private body(hass: HomeAssistant): TemplateResult {
    const { state, failed, clockOffset } = this.live
    if (failed && !state) {
      const i18n = localeOf(hass)
      return html`<div class="message" role="alert">
        <strong>${i18n.t('card_error')}</strong>
        <span>${i18n.t('card_error_hint')}</span>
      </div>`
    }
    if (!state) return html`<div class="skeleton" aria-busy="true"></div>`
    return html`<housetide-pomodoro
      .hass=${hass}
      .pomodoro=${state.pomodoro}
      .settings=${state.settings}
      .clockOffset=${clockOffset}
      .animations=${!pageHidden()}
      .heading=${this.config.title}
    ></housetide-pomodoro>`
  }

  override render(): TemplateResult | typeof nothing {
    const { hass } = this
    if (!hass) return nothing
    return html`<ha-card>${this.body(hass)}</ha-card>`
  }
}
