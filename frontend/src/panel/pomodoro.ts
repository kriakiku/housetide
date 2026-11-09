import { css, html, LitElement, nothing } from 'lit'
import type { PropertyDeclarations, PropertyValues, TemplateResult } from 'lit'
import { guard } from 'lit/directives/guard.js'
import { styleMap } from 'lit/directives/style-map.js'

import { pomodoroCommand } from '../api.ts'
import type { I18n } from '../i18n.ts'
import { clamp01, sceneSurface } from '../scenes/common.ts'
import { renderScene } from '../scenes/index.ts'
import { sceneStyles, tokens } from '../styles.ts'
import type {
  HomeAssistant,
  PomodoroAction,
  PomodoroNext,
  PomodoroState,
  SceneState,
  SceneView,
  Settings,
} from '../types.ts'
import { ERROR_MS, errorMessage, hassChanged, isOffline, localeOf, pageHidden } from './live.ts'
import { icon, iconStyles } from './tile.ts'
import type { ICONS } from './tile.ts'

export const POMODORO_TICK_MS = 1000

const DIAL_STEPS = 12

export function isRunning(state: PomodoroState): boolean {
  return state.phase !== 'idle' && state.ends_at !== null
}

export function isPaused(state: PomodoroState): boolean {
  return state.phase !== 'idle' && state.paused_remaining_seconds !== null
}

export function phaseSeconds(phase: PomodoroNext, settings: Settings): number {
  const minutes: Record<PomodoroNext, number> = {
    focus: settings.focus_minutes,
    short_break: settings.short_break_minutes,
    long_break: settings.long_break_minutes,
  }
  return minutes[phase] * 60
}

export function remainingMs(state: PomodoroState, settings: Settings, nowMs: number): number {
  if (state.paused_remaining_seconds !== null) return state.paused_remaining_seconds * 1000
  if (state.ends_at !== null) return Math.max(0, Date.parse(state.ends_at) - nowMs)
  return phaseSeconds(state.next_phase, settings) * 1000
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

function isFresh(state: PomodoroState): boolean {
  return state.next_phase === 'focus' && state.round === 1 && state.rounds_today === 0
}

function sceneState(state: PomodoroState): SceneState {
  if (state.phase === 'idle') return isFresh(state) ? 'resting' : 'due'
  if (isPaused(state)) return 'waiting'
  const running: Record<PomodoroNext, SceneState> = {
    focus: 'running',
    short_break: 'accumulating',
    long_break: 'clean',
  }
  return running[state.phase]
}

export function pomodoroScene(state: PomodoroState, settings: Settings, nowMs: number): SceneView {
  const name = 'tomato'
  const base = { name, stink: 0 } as const
  if (state.phase === 'idle') return { ...base, state: sceneState(state), fill: 0, progress: 0 }
  const total = (state.duration_seconds ?? phaseSeconds(state.phase, settings)) * 1000
  const elapsed = clamp01(1 - remainingMs(state, settings, nowMs) / total)
  const progress = Math.round(elapsed * DIAL_STEPS) / DIAL_STEPS
  return { ...base, state: sceneState(state), fill: progress, progress }
}

export function pomodoroStatus(state: PomodoroState, i18n: I18n): string {
  if (state.phase === 'idle') {
    return state.next_phase === 'focus'
      ? i18n.t('pomodoro_idle')
      : i18n.t(`pomodoro_idle_${state.next_phase}`)
  }
  const phase = i18n.t(`pomodoro_phase_${state.phase}`)
  return isPaused(state) ? i18n.t('pomodoro_paused', { phase }) : phase
}

export type RoundDot = 'done' | 'now' | 'open'

export function roundDots(state: PomodoroState, settings: Settings): RoundDot[] {
  const total = settings.rounds_until_long_break
  const round = Math.min(state.round, total)
  const finished = state.phase === 'idle' ? state.next_phase !== 'focus' : state.phase !== 'focus'
  const done = finished ? round : round - 1
  return Array.from({ length: total }, (_, index) => {
    if (index < done) return 'done'
    return index === done && state.phase === 'focus' ? 'now' : 'open'
  })
}

interface PomodoroButton {
  action: PomodoroAction
  icon: keyof typeof ICONS
  primary?: boolean
}

function buttons(state: PomodoroState): PomodoroButton[] {
  const skip: PomodoroButton = { action: 'skip', icon: 'skip' }
  const stop: PomodoroButton = { action: 'stop', icon: 'stop' }
  if (isRunning(state)) return [{ action: 'pause', icon: 'pause', primary: true }, skip, stop]
  if (isPaused(state)) return [{ action: 'resume', icon: 'play', primary: true }, skip, stop]
  const shown: PomodoroButton[] = [{ action: 'start', icon: 'play', primary: true }]
  if (state.next_phase !== 'focus') shown.push(skip)
  if (!isFresh(state)) shown.push({ action: 'reset', icon: 'reset' })
  return shown
}

export class HousetidePomodoro extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false, hasChanged: hassChanged },
    pomodoro: { attribute: false },
    settings: { attribute: false },
    clockOffset: { attribute: false },
    animations: { attribute: false },
    heading: { attribute: false },
    pending: { state: true },
    error: { state: true },
  }

  static override styles = [
    tokens,
    iconStyles,
    sceneStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
      }

      .pomo {
        --ht-fg: #f4f2fa;
        --ht-muted: rgba(255, 255, 255, 0.74);
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        overflow: hidden;
        border-radius: calc(var(--ht-radius) * 1.3);
        corner-shape: var(--ht-corner);
        background: var(--ht-floor);
        color: var(--ht-fg);
      }

      .art {
        aspect-ratio: 200 / 192;
      }

      .info {
        display: grid;
        align-content: center;
        gap: 6px;
        min-width: 0;
        padding: 4px 12px 12px;
      }

      .top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
        min-width: 0;
      }

      .heading,
      .status {
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .heading {
        font-size: 1.0625rem;
        font-weight: 600;
      }

      .status {
        color: var(--ht-muted);
        font-size: 0.9375rem;
      }

      .clock {
        font-size: 3rem;
        font-variant-numeric: tabular-nums;
        font-weight: 700;
        line-height: 1.1;
      }

      .rounds {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 4px 12px;
        min-height: 20px;
        color: var(--ht-muted);
        font-size: 0.8125rem;
      }

      .set {
        display: inline-flex;
        gap: 5px;
      }

      .set i {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.28);
      }

      .set .done {
        background: #ff7a6b;
      }

      .set .now {
        background: #ffc857;
      }

      .failed {
        min-height: 20px;
        color: #ffb4a8;
        font-size: 0.8125rem;
      }

      .buttons {
        display: flex;
        gap: 8px;
      }

      .btn {
        appearance: none;
        box-sizing: border-box;
        display: flex;
        flex: 1 1 0;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        min-width: 0;
        min-height: 60px;
        padding: 4px;
        border: none;
        border-radius: calc(var(--ht-radius) * 1.2);
        corner-shape: var(--ht-corner);
        background: rgba(255, 255, 255, 0.16);
        color: var(--ht-fg);
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        transition:
          transform 120ms ease,
          opacity 120ms ease;
      }

      .btn span {
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .btn.primary {
        flex-grow: 1.6;
        background: #ff7a6b;
        color: #1b1f33;
      }

      .btn:active:not(:disabled) {
        transform: scale(0.96);
      }

      .btn:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 2px;
      }

      .btn:disabled {
        opacity: 0.45;
        cursor: default;
      }

      @container (min-width: 480px) {
        .pomo {
          grid-template-columns: auto minmax(0, 1fr);
          height: 208px;
          background: linear-gradient(var(--ht-wall) 87.5%, var(--ht-floor) 87.5%);
        }

        .art {
          height: 208px;
        }

        .info {
          padding: 12px 16px 12px 8px;
        }
      }
    `,
  ]

  declare hass: HomeAssistant | undefined
  declare pomodoro: PomodoroState | undefined
  declare settings: Settings | undefined
  declare clockOffset: number
  declare animations: boolean
  declare heading: string | undefined
  declare pending: boolean
  declare error: string | null

  private timer: ReturnType<typeof setInterval> | undefined
  private observer: IntersectionObserver | undefined
  private onScreen = true
  private errorTimer: ReturnType<typeof setTimeout> | undefined

  constructor() {
    super()
    this.clockOffset = 0
    this.animations = true
    this.pending = false
    this.error = null
  }

  override connectedCallback(): void {
    super.connectedCallback()
    document.addEventListener('visibilitychange', this.refresh)
    if (typeof IntersectionObserver === 'undefined') return
    this.observer = new IntersectionObserver((entries) => {
      const last = entries.at(-1)
      if (!last) return
      this.onScreen = last.isIntersecting
      this.refresh()
    })
    this.observer.observe(this)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    document.removeEventListener('visibilitychange', this.refresh)
    this.observer?.disconnect()
    this.observer = undefined
    this.onScreen = true
    this.stopTicking()
    this.clearError()
  }

  protected override updated(_changed: PropertyValues): void {
    this.syncTicking()
  }

  private readonly refresh = (): void => {
    this.syncTicking()
    if (!pageHidden() && this.onScreen) this.requestUpdate()
  }

  private shouldTick(): boolean {
    return (
      this.isConnected &&
      this.onScreen &&
      !pageHidden() &&
      this.pomodoro !== undefined &&
      isRunning(this.pomodoro)
    )
  }

  private syncTicking(): void {
    if (!this.shouldTick()) {
      this.stopTicking()
      return
    }
    this.timer ??= setInterval(() => {
      this.requestUpdate()
    }, POMODORO_TICK_MS)
  }

  private stopTicking(): void {
    clearInterval(this.timer)
    this.timer = undefined
  }

  private clearError(): void {
    clearTimeout(this.errorTimer)
    this.errorTimer = undefined
    this.error = null
  }

  private showError(message: string): void {
    clearTimeout(this.errorTimer)
    this.error = message
    this.errorTimer = setTimeout(() => {
      this.clearError()
    }, ERROR_MS)
  }

  private async send(action: PomodoroAction): Promise<void> {
    if (!this.hass || this.pending) return
    this.pending = true
    this.clearError()
    try {
      await pomodoroCommand(this.hass, action)
      window.dispatchEvent(new CustomEvent('haptic', { detail: 'light' }))
    } catch (error) {
      if (this.isConnected) this.showError(errorMessage(error))
    } finally {
      this.pending = false
    }
  }

  private renderButton(button: PomodoroButton, i18n: I18n, disabled: boolean): TemplateResult {
    return html`<button
      class="btn ${button.primary === true ? 'primary' : ''}"
      data-action="pomodoro-${button.action}"
      ?disabled=${disabled}
      @click=${(): void => {
        void this.send(button.action)
      }}
    >
      ${icon(button.icon)}<span>${i18n.t(`pomodoro_${button.action}`)}</span>
    </button>`
  }

  private renderRounds(state: PomodoroState, settings: Settings, i18n: I18n): TemplateResult {
    const total = settings.rounds_until_long_break
    const current = Math.min(state.round, total)
    return html`<div class="rounds">
      <span
        class="set"
        data-part="rounds"
        role="img"
        aria-label=${i18n.t('pomodoro_round', { current, total })}
      >
        ${roundDots(state, settings).map((dot) => html`<i class=${dot}></i>`)}
      </span>
      <span data-part="today">${i18n.plural('pomodoro_today', state.rounds_today)}</span>
    </div>`
  }

  override render(): TemplateResult | typeof nothing {
    const { hass, pomodoro: state, settings } = this
    if (!hass || !state || !settings) return nothing
    const i18n = localeOf(hass)
    const nowMs = Date.now() + this.clockOffset
    const scene = pomodoroScene(state, settings, nowMs)
    const { wall, floor } = sceneSurface(scene)
    const status = pomodoroStatus(state, i18n)
    const label = `${i18n.t('pomodoro_title')}: ${status}`
    const animated = this.animations && !pageHidden()
    const offline = isOffline(hass)
    return html`<article
      class="pomo"
      data-phase=${state.phase}
      ?data-paused=${isPaused(state)}
      style=${styleMap({ '--ht-wall': wall, '--ht-floor': floor })}
    >
      <div class="art">
        ${guard([scene.state, scene.progress, animated, label], () =>
          renderScene(scene, { animations: animated, bleed: true, label }),
        )}
      </div>
      <div class="info">
        <div class="top">
          ${this.heading ? html`<span class="heading">${this.heading}</span>` : nothing}
          <span class="status" data-part="status">${status}</span>
        </div>
        <div class="clock" role="timer" data-part="clock">
          ${formatClock(remainingMs(state, settings, nowMs))}
        </div>
        ${
          this.error === null
            ? this.renderRounds(state, settings, i18n)
            : html`<div class="failed" role="alert">
                ${i18n.t('error_generic', { message: this.error })}
              </div>`
        }
        <div class="buttons">
          ${buttons(state).map((button) =>
            this.renderButton(button, i18n, offline || this.pending),
          )}
        </div>
      </div>
    </article>`
  }
}
