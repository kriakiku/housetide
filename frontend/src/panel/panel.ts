import { css, html, LitElement, nothing } from 'lit'
import type { PropertyDeclarations, PropertyValues, TemplateResult } from 'lit'

import { controls, tokens } from '../styles.ts'
import type { HomeAssistant } from '../types.ts'
import { isOffline, localeOf, pageHidden, StateController } from './live.ts'
import { icon, iconStyles } from './tile.ts'

export type PanelTab = 'today' | 'tasks' | 'history'

const TABS: PanelTab[] = ['today', 'tasks', 'history']

export function tabFromPath(path: string | undefined): PanelTab {
  const segment = (path ?? '').replace(/^\//, '').split('/')[0]
  return TABS.find((tab) => tab === segment) ?? 'today'
}

interface PanelRoute {
  prefix?: string
  path?: string
}

export class HousetidePanel extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false },
    narrow: { type: Boolean },
    route: { attribute: false },
    panel: { attribute: false },
    tab: { state: true },
  }

  static override styles = [
    tokens,
    controls,
    iconStyles,
    css`
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100vh;
        height: 100dvh;
        box-sizing: border-box;
        background: var(--primary-background-color, #111);
      }

      header {
        display: flex;
        flex: none;
        align-items: center;
        gap: 8px;
        height: 56px;
        padding: 0 12px;
        background: var(--app-header-background-color, var(--ht-surface));
        color: var(--app-header-text-color, var(--ht-fg));
      }

      h1 {
        margin: 0 8px 0 0;
        font-size: 1.25rem;
        font-weight: 500;
      }

      .menu {
        width: 44px;
        padding: 0;
        border: 0;
        color: inherit;
      }

      .tabs {
        display: flex;
        flex: 1;
        justify-content: flex-end;
        gap: 4px;
      }

      .tab {
        appearance: none;
        min-width: 44px;
        height: 44px;
        padding: 0 16px;
        border: 0;
        border-radius: 999px;
        corner-shape: var(--ht-corner);
        background: transparent;
        color: inherit;
        font: inherit;
        font-weight: 500;
        opacity: 0.75;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      .tab[aria-selected='true'] {
        background: var(--ht-accent);
        color: var(--ht-on-accent);
        opacity: 1;
      }

      .tab:focus-visible {
        outline: 2px solid var(--ht-fg);
        outline-offset: -2px;
      }

      main {
        flex: 1;
        min-height: 0;
        padding: 12px;
        overflow-y: auto;
        overscroll-behavior-y: contain;
      }

      .message {
        display: grid;
        justify-items: center;
        gap: 12px;
        padding: 48px 16px;
        text-align: center;
      }

      .message p {
        margin: 0;
        color: var(--ht-muted);
      }

      .offline {
        position: absolute;
        z-index: 3;
        bottom: 72px;
        left: 50%;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 999px;
        corner-shape: var(--ht-corner);
        background: var(--ht-surface-alt);
        color: var(--ht-warning);
        font-size: 0.875rem;
        white-space: nowrap;
        transform: translateX(-50%);
      }

      @media (max-width: 480px) {
        h1 {
          display: none;
        }

        .tab {
          padding: 0 10px;
        }
      }
    `,
  ]

  declare hass: HomeAssistant | undefined
  declare narrow: boolean
  declare route: PanelRoute | undefined
  declare panel: unknown
  declare tab: PanelTab

  private readonly live: StateController
  private tasksMounted = false
  private todayMounted = false

  constructor() {
    super()
    this.narrow = false
    this.tab = 'today'
    this.live = new StateController(this, () => this.hass)
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('hass')) this.live.sync()
    if (changed.has('route')) this.tab = tabFromPath(this.route?.path)
  }

  private select(tab: PanelTab): void {
    this.tab = tab
    const prefix = this.route?.prefix ?? '/housetide'
    history.replaceState(history.state, '', `${prefix}/${tab}`)
  }

  private readonly toggleMenu = (): void => {
    this.dispatchEvent(new CustomEvent('hass-toggle-menu', { bubbles: true, composed: true }))
  }

  private renderToday(hass: HomeAssistant): TemplateResult | typeof nothing {
    if (this.tab === 'today') this.todayMounted = true
    if (!this.todayMounted) return nothing
    const { state, now } = this.live
    return html`<housetide-today
      .hass=${hass}
      .state=${state}
      .now=${now}
      .animations=${!pageHidden()}
      .active=${this.tab === 'today'}
      ?hidden=${this.tab !== 'today'}
    ></housetide-today>`
  }

  private renderHistory(hass: HomeAssistant): TemplateResult | typeof nothing {
    if (this.tab !== 'history') return nothing
    return html`<housetide-history .hass=${hass} .state=${this.live.state}></housetide-history>`
  }

  private renderTasks(hass: HomeAssistant): TemplateResult | typeof nothing {
    if (this.tab === 'tasks') this.tasksMounted = true
    if (!this.tasksMounted) return nothing
    const { state, now } = this.live
    return html`<housetide-tasks
      .hass=${hass}
      .state=${state}
      .now=${now}
      ?hidden=${this.tab !== 'tasks'}
    ></housetide-tasks>`
  }

  override render(): TemplateResult | typeof nothing {
    const { hass } = this
    if (!hass) return nothing
    const i18n = localeOf(hass)
    const showMenu = this.narrow || hass.dockedSidebar === 'always_hidden'
    const failed = this.live.failed && !this.live.state
    return html`<header>
        ${
          showMenu
            ? html`<button
                class="ht-btn menu"
                aria-label=${i18n.t('action_menu')}
                data-action="menu"
                @click=${this.toggleMenu}
              >
                ${icon('menu')}
              </button>`
            : nothing
        }
        <h1>${i18n.t('app_title')}</h1>
        <div class="tabs" role="tablist">
          ${TABS.map(
            (tab) =>
              html`<button
                class="tab"
                role="tab"
                data-tab=${tab}
                aria-selected=${this.tab === tab ? 'true' : 'false'}
                @click=${(): void => {
                  this.select(tab)
                }}
              >
                ${i18n.t(`tab_${tab}`)}
              </button>`,
          )}
        </div>
      </header>
      <main>
        ${
          failed
            ? html`<div class="message" role="alert" data-part="error">
                <strong>${i18n.t('card_error')}</strong>
                <p>${i18n.t('card_error_hint')}</p>
                <button
                  class="ht-btn"
                  data-action="retry"
                  @click=${(): void => {
                    this.live.retry()
                  }}
                >
                  ${i18n.t('action_retry')}
                </button>
              </div>`
            : html`${this.renderToday(hass)} ${this.renderHistory(hass)} ${this.renderTasks(hass)}`
        }
      </main>
      ${
        isOffline(hass)
          ? html`<div class="offline" role="status" data-part="offline">
              ${icon('alert')}${i18n.t('disconnected')}
            </div>`
          : nothing
      }`
  }
}
