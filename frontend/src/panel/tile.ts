import { css, html, nothing, svg } from 'lit'
import type { TemplateResult } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { styleMap } from 'lit/directives/style-map.js'

import type { I18n } from '../i18n.ts'
import { sceneSurface } from '../scenes/common.ts'
import { renderScene } from '../scenes/index.ts'
import type { TaskView } from '../types.ts'
import { taskGestures } from './gestures.ts'
import type { ActiveGestures, CardLayout, GestureOptions, TaskAction } from './gestures.ts'
import { compareKeys, isEarly, orderKey } from './live.ts'
import type { ActionTracker } from './live.ts'

export const ICONS = {
  check: 'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z',
  undo: 'M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z',
  skip: 'M16,18H18V6H16M6,18L14.5,12L6,6V18Z',
  bolt: 'M7,2V13H10V22L17,10H13L17,2H7Z',
  menu: 'M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z',
  plus: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
  up: 'M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z',
  down: 'M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z',
  trash: 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z',
  alert: 'M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z',
  chevron: 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z',
  list: 'M3,4H21V8H3V4M3,10H21V14H3V10M3,16H21V20H3V16Z',
  tiles: 'M3,3H11V11H3V3M13,3H21V11H13V3M3,13H11V21H3V13M13,13H21V21H13V13Z',
  play: 'M8,5.14V19.14L19,12.14L8,5.14Z',
  pause: 'M14,19H18V5H14M6,19H10V5H6V19Z',
  stop: 'M18,18H6V6H18V18Z',
  reset:
    'M12,5V1L7,6L12,11V7A6,6 0 0,1 18,13A6,6 0 0,1 12,19A6,6 0 0,1 6,13H4A8,8 0 0,0 12,21A8,8 0 0,0 20,13A8,8 0 0,0 12,5Z',
} as const

export function icon(name: keyof typeof ICONS): TemplateResult {
  return html`<svg class="ht-icon" viewBox="0 0 24 24" aria-hidden="true">
    ${svg`<path d=${ICONS[name]} fill="currentColor"></path>`}
  </svg>`
}

export interface TaskContext {
  i18n: I18n
  tracker: ActionTracker
  now: Date
  animations: boolean
  day: number
  offline: boolean
}

export interface ViewFilter {
  show: 'today' | 'all'
  ids?: readonly string[] | undefined
  tracker?: ActionTracker | undefined
}

export function selectViews(views: readonly TaskView[], filter: ViewFilter): TaskView[] {
  const { tracker } = filter
  const ids = filter.ids?.length ? filter.ids : undefined
  const wanted = views.filter((view) => {
    if (ids && !ids.includes(view.task_id)) return false
    if (filter.show === 'all') return true
    return view.is_today || view.status === 'clean' || (tracker?.isRecent(view.task_id) ?? false)
  })
  if (ids) return wanted.toSorted((a, b) => ids.indexOf(a.task_id) - ids.indexOf(b.task_id))
  const keyed = wanted.map((view) => ({
    view,
    key: tracker?.frozenKey(view.task_id) ?? orderKey(view),
  }))
  return keyed.toSorted((a, b) => compareKeys(a.key, b.key)).map(({ view }) => view)
}

export function needsAttention(view: TaskView): boolean {
  return view.status === 'due' || view.status === 'overdue' || view.status === 'in_progress'
}

function readableOn(color: string): string | undefined {
  const match = /^#([0-9a-f]{6})$/i.exec(color)
  if (!match?.[1]) return undefined
  const value = Number.parseInt(match[1], 16)
  const channel = (shift: number): number => (value >> shift) & 255
  const luminance = 0.299 * channel(16) + 0.587 * channel(8) + 0.114 * channel(0)
  return luminance > 150 ? '#14182a' : '#ffffff'
}

function surface(view: TaskView): Record<string, string> {
  const { wall, floor } = sceneSurface(view.scene)
  const base = { '--ht-wall': wall, '--ht-floor': floor }
  if (!view.color) return base
  const on = readableOn(view.color)
  return { ...base, '--ht-task': view.color, ...(on ? { '--ht-on-task': on } : {}) }
}

function advanceLabel(view: TaskView, i18n: I18n): string {
  if (view.action) return view.action
  if (view.stage_index === 0 && view.stage_count > 1) return i18n.t('action_start')
  return i18n.t('action_advance')
}

function scene(view: TaskView, ctx: TaskContext): TemplateResult {
  return renderScene(view.scene, {
    animations: ctx.animations,
    bleed: true,
    day: ctx.day,
    label: `${view.title}: ${ctx.i18n.t(`status_${view.status}`)}`,
  })
}

function iconBadge(view: TaskView): TemplateResult | typeof nothing {
  if (!view.icon || view.scene.name !== 'generic') return nothing
  return html`<span class="badge" aria-hidden="true"><ha-icon .icon=${view.icon}></ha-icon></span>`
}

function goButton(view: TaskView, ctx: TaskContext, iconOnly = false): TemplateResult {
  const { i18n, tracker } = ctx
  const id = view.task_id
  const finished = tracker.justCompleted(id)
  const unavailable = !view.can_advance
  const early = !finished && !unavailable && isEarly(view)
  const armed = early && tracker.isArmed(id)
  let label = advanceLabel(view, i18n)
  if (finished) label = i18n.t('status_done')
  else if (unavailable) label = i18n.t(`status_${view.status}`)
  else if (early) label = i18n.t(armed ? 'action_early_confirm' : 'action_early')
  const quiet = !armed && (!needsAttention(view) || view.automated)
  const more = view.stage_index + 1 < view.stage_count
  return html`<button
    class="go ${quiet ? 'quiet' : 'loud'} ${finished ? 'finished' : ''} ${iconOnly ? 'icon-only' : ''}"
    data-action="advance"
    aria-label="${label}: ${view.title}"
    ?disabled=${unavailable || finished || ctx.offline}
    ?data-pending=${tracker.isPending(id)}
    @click=${(): void => {
      void tracker.press(view)
    }}
  >
    ${
      iconOnly
        ? icon(more && !finished ? 'chevron' : 'check')
        : html`${finished ? icon('check') : nothing}<span>${label}</span>`
    }
  </button>`
}

function undoVisible(view: TaskView, ctx: TaskContext): boolean {
  return view.can_undo && ctx.tracker.isRecent(view.task_id)
}

function undoButton(view: TaskView, ctx: TaskContext): TemplateResult | typeof nothing {
  const { i18n, tracker } = ctx
  if (!undoVisible(view, ctx)) return nothing
  return html`<button
    class="undo ${ctx.animations ? 'enter' : ''}"
    data-action="undo"
    aria-label="${i18n.t('action_undo')}: ${view.title}"
    ?disabled=${ctx.offline || tracker.isPending(view.task_id)}
    @click=${(): void => {
      void tracker.undo(view)
    }}
  >
    ${icon('undo')}
  </button>`
}

function burst(view: TaskView, ctx: TaskContext): TemplateResult | typeof nothing {
  if (!ctx.animations || ctx.tracker.celebration(view.task_id) !== 'done') return nothing
  return html`<span class="burst" aria-hidden="true">
    <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
  </span>`
}

function dots(view: TaskView, ctx: TaskContext): TemplateResult | typeof nothing {
  if (view.stage_count < 2 || view.stage_count > 8) return nothing
  const label = ctx.i18n.t('stage_progress', {
    current: view.stage_index + 1,
    total: view.stage_count,
  })
  return html`<span class="dots" role="img" aria-label=${label}>
    ${Array.from(
      { length: view.stage_count },
      (_, index) =>
        html`<i
          class=${index < view.stage_index ? 'past' : index === view.stage_index ? 'now' : ''}
        ></i>`,
    )}
  </span>`
}

function stageLine(view: TaskView, ctx: TaskContext): TemplateResult {
  return html`<div class="stage">
    ${dots(view, ctx)}<span class="stage-name">${view.stage_title}</span>
    ${
      view.automated
        ? html`<span class="auto" data-part="automated"
            >${icon('bolt')}${ctx.i18n.t('automated')}</span
          >`
        : nothing
    }
  </div>`
}

function dueLine(view: TaskView, ctx: TaskContext): TemplateResult {
  const error = ctx.tracker.error(view.task_id)
  return error
    ? html`<div class="due failed" role="alert">
        ${ctx.i18n.t('error_generic', { message: error })}
      </div>`
    : html`<div class="due">${ctx.i18n.dueText(view, ctx.now)}</div>`
}

function classes(view: TaskView, ctx: TaskContext, base: string): string {
  const celebration = ctx.animations ? ctx.tracker.celebration(view.task_id) : undefined
  return `${base} is-${view.status}${celebration ? ` pop-${celebration}` : ''}`
}

function skipButton(
  view: TaskView,
  ctx: TaskContext,
  allowed: boolean,
): TemplateResult | typeof nothing {
  const { i18n, tracker } = ctx
  if (!allowed || !view.can_skip || !needsAttention(view)) return nothing
  return html`<button
    class="skip"
    data-action="skip"
    aria-label="${i18n.t('action_skip')}: ${view.title}"
    ?disabled=${ctx.offline || tracker.isPending(view.task_id)}
    @click=${(): void => {
      void tracker.skip(view)
    }}
  >
    ${icon('skip')}
  </button>`
}

function textBlock(
  view: TaskView,
  ctx: TaskContext,
  hide: ReadonlySet<HideKey>,
): TemplateResult | typeof nothing {
  const failed = ctx.tracker.error(view.task_id) !== undefined
  const title = !hide.has('title')
  const stage = !hide.has('stage') && !failed
  const due = !hide.has('due') || failed
  if (!title && !stage && !due) return nothing
  return html`<div class="text">
    ${title ? html`<div class="title">${view.title}</div>` : nothing}
    ${
      stage || due
        ? html`<div class="meta">
            ${stage ? stageLine(view, ctx) : nothing}
            ${due ? html`<div class="when">${dueLine(view, ctx)}</div>` : nothing}
          </div>`
        : nothing
    }
  </div>`
}

function actions(view: TaskView, ctx: TaskContext, skip: boolean): TemplateResult {
  return html`<div class="actions">
    <div class="go-wrap">${goButton(view, ctx)}${burst(view, ctx)}</div>
    ${skipButton(view, ctx, skip)}
  </div>`
}

export const HIDE_KEYS = ['title', 'stage', 'due', 'button', 'header'] as const
export type HideKey = (typeof HIDE_KEYS)[number]

const TEXT_KEYS: readonly HideKey[] = ['title', 'stage', 'due']
const BARE_KEYS: readonly HideKey[] = ['title', 'stage', 'due', 'button']
const NOTHING_HIDDEN: ReadonlySet<HideKey> = new Set()

export function impliedHide(layout: CardLayout): readonly HideKey[] {
  if (layout === 'picture' || layout === 'bubbles') return BARE_KEYS
  if (layout === 'compact') return ['stage', 'due']
  return []
}

export function effectiveHide(
  layout: CardLayout,
  hide: readonly HideKey[] = [],
): ReadonlySet<HideKey> {
  return new Set([...impliedHide(layout), ...hide])
}

export interface TaskOptions {
  skip?: boolean
  hide?: ReadonlySet<HideKey>
  gestures?: ActiveGestures
}

type TaskKind = 'row' | 'tile' | 'picture' | 'compact' | 'bubble'

function hideClasses(view: TaskView, ctx: TaskContext, hide: ReadonlySet<HideKey>): string {
  const names: string[] = []
  const bare = TEXT_KEYS.every((key) => hide.has(key))
  if (bare) names.push('no-text')
  if (hide.has('stage')) names.push('no-stage')
  if (hide.has('button')) names.push('no-button')
  if (bare && (view.status === 'due' || view.status === 'overdue')) {
    names.push('ring')
    if (ctx.animations) names.push('ring-pulse')
  }
  return names.join(' ')
}

function spokenLabel(
  view: TaskView,
  ctx: TaskContext,
  hide: ReadonlySet<HideKey>,
): string | undefined {
  if (!TEXT_KEYS.some((key) => hide.has(key))) return undefined
  const parts = [view.title]
  if (view.stage_title && view.stage_title !== view.title) parts.push(view.stage_title)
  parts.push(ctx.i18n.dueText(view, ctx.now))
  if (view.automated) parts.push(ctx.i18n.t('automated'))
  return parts.filter(Boolean).join(', ')
}

function actionAvailable(view: TaskView, ctx: TaskContext, action: TaskAction): boolean {
  const { tracker } = ctx
  const id = view.task_id
  if (ctx.offline || tracker.isPending(id)) return false
  if (action === 'skip') return view.can_skip
  if (action === 'undo') return view.can_undo
  return view.can_advance && !tracker.justCompleted(id) && !tracker.isCooling(id)
}

function runAction(view: TaskView, ctx: TaskContext, action: TaskAction): void {
  const { tracker } = ctx
  if (action === 'advance') void tracker.advance(view)
  else if (action === 'skip') void tracker.skip(view)
  else void tracker.undo(view)
}

function gestureOptions(
  view: TaskView,
  ctx: TaskContext,
  gestures: ActiveGestures | undefined,
  kind: TaskKind,
): GestureOptions | null {
  if (!gestures || Object.keys(gestures).length === 0) return null
  return {
    gestures,
    animations: ctx.animations,
    fade: kind === 'picture' || kind === 'bubble',
    available: (action) => actionAvailable(view, ctx, action),
    run: (action) => {
      runAction(view, ctx, action)
    },
  }
}

const FACES = {
  advance: 'check',
  skip: 'skip',
  undo: 'undo',
} as const

function faceLabel(view: TaskView, ctx: TaskContext, action: TaskAction): string {
  return action === 'advance' ? advanceLabel(view, ctx.i18n) : ctx.i18n.t(`action_${action}`)
}

function hosted(
  kind: TaskKind,
  view: TaskView,
  ctx: TaskContext,
  gestures: ActiveGestures | undefined,
  task: TemplateResult,
): TemplateResult {
  if (!gestures || Object.keys(gestures).length === 0) return task
  const faces = [...new Set(Object.values(gestures))]
  return html`<div class="swipe swipe-${kind}">
    <div class="swipe-reveal" aria-hidden="true">
      ${faces.map(
        (action) =>
          html`<span class="face" data-face=${action}>
            ${icon(FACES[action])}<span>${faceLabel(view, ctx, action)}</span>
          </span>`,
      )}
    </div>
    ${task}
  </div>`
}

function errorBadge(view: TaskView, ctx: TaskContext): TemplateResult | typeof nothing {
  const error = ctx.tracker.error(view.task_id)
  if (error === undefined) return nothing
  const message = ctx.i18n.t('error_generic', { message: error })
  return html`<span class="alert-badge" role="alert" aria-label=${message} title=${message}>
    ${icon('alert')}
  </span>`
}

export function renderRow(
  view: TaskView,
  ctx: TaskContext,
  options: TaskOptions = {},
): TemplateResult {
  const hide = options.hide ?? NOTHING_HIDDEN
  const label = spokenLabel(view, ctx, hide)
  const task = html`<div
    class=${classes(view, ctx, `row ${hideClasses(view, ctx, hide)}`)}
    data-task=${view.task_id}
    data-status=${view.status}
    style=${styleMap(surface(view))}
    role=${ifDefined(label ? 'group' : undefined)}
    aria-label=${ifDefined(label)}
    ${taskGestures(gestureOptions(view, ctx, options.gestures, 'row'))}
  >
    <div class="thumb">${scene(view, ctx)} ${iconBadge(view)}</div>
    ${textBlock(view, ctx, hide)}
    ${
      hide.has('button')
        ? burst(view, ctx)
        : html`${undoButton(view, ctx)}
          ${actions(view, ctx, options.skip === true && !undoVisible(view, ctx))}`
    }
  </div>`
  return hosted('row', view, ctx, options.gestures, task)
}

export function renderTile(
  view: TaskView,
  ctx: TaskContext,
  options: TaskOptions = {},
): TemplateResult {
  const hide = options.hide ?? NOTHING_HIDDEN
  const label = spokenLabel(view, ctx, hide)
  const buttons = !hide.has('button')
  const task = html`<article
    class=${classes(view, ctx, `tile ${hideClasses(view, ctx, hide)}`)}
    data-task=${view.task_id}
    data-status=${view.status}
    style=${styleMap(surface(view))}
    role=${ifDefined(label ? 'group' : undefined)}
    aria-label=${ifDefined(label)}
    ${taskGestures(gestureOptions(view, ctx, options.gestures, 'tile'))}
  >
    <div class="art">
      ${scene(view, ctx)} ${iconBadge(view)} ${buttons ? undoButton(view, ctx) : nothing}
    </div>
    ${textBlock(view, ctx, hide)}
    ${buttons ? actions(view, ctx, options.skip === true) : burst(view, ctx)}
  </article>`
  return hosted('tile', view, ctx, options.gestures, task)
}

export function renderCompact(
  view: TaskView,
  ctx: TaskContext,
  options: TaskOptions = {},
): TemplateResult {
  const hide = options.hide ?? effectiveHide('compact')
  const failed = ctx.tracker.error(view.task_id) !== undefined
  const task = html`<div
    class=${classes(view, ctx, `compact ${hideClasses(view, ctx, hide)}`)}
    data-task=${view.task_id}
    data-status=${view.status}
    style=${styleMap(surface(view))}
    role="group"
    aria-label=${ifDefined(spokenLabel(view, ctx, hide))}
    ${taskGestures(gestureOptions(view, ctx, options.gestures, 'compact'))}
  >
    <div class="thumb">${scene(view, ctx)} ${iconBadge(view)}</div>
    ${
      failed
        ? html`<div class="text">${dueLine(view, ctx)}</div>`
        : hide.has('title')
          ? nothing
          : html`<div class="text"><div class="title">${view.title}</div></div>`
    }
    ${
      hide.has('button')
        ? burst(view, ctx)
        : html`<div class="actions">
            ${undoButton(view, ctx)}
            <div class="go-wrap">${goButton(view, ctx, true)}${burst(view, ctx)}</div>
          </div>`
    }
  </div>`
  return hosted('compact', view, ctx, options.gestures, task)
}

function renderBare(
  kind: 'picture' | 'bubble',
  view: TaskView,
  ctx: TaskContext,
  options: TaskOptions,
): TemplateResult {
  const hide = options.hide ?? effectiveHide(kind === 'picture' ? 'picture' : 'bubbles')
  const task = html`<div
    class=${classes(view, ctx, `${kind} ${hideClasses(view, ctx, hide)}`)}
    data-task=${view.task_id}
    data-status=${view.status}
    style=${styleMap(surface(view))}
    role="group"
    aria-label=${ifDefined(spokenLabel(view, ctx, hide))}
    ${taskGestures(gestureOptions(view, ctx, options.gestures, kind))}
  >
    <div class="art">${scene(view, ctx)} ${iconBadge(view)}</div>
    ${errorBadge(view, ctx)} ${burst(view, ctx)}
  </div>`
  return hosted(kind, view, ctx, options.gestures, task)
}

export function renderPicture(
  view: TaskView,
  ctx: TaskContext,
  options: TaskOptions = {},
): TemplateResult {
  return renderBare('picture', view, ctx, options)
}

export function renderBubble(
  view: TaskView,
  ctx: TaskContext,
  options: TaskOptions = {},
): TemplateResult {
  return renderBare('bubble', view, ctx, options)
}

export function renderSkeleton(count: number, kind: TaskKind): TemplateResult[] {
  return Array.from(
    { length: count },
    () => html`<div class="${kind} skeleton" aria-hidden="true"></div>`,
  )
}

export const iconStyles = css`
  .ht-icon {
    width: 20px;
    height: 20px;
    flex: none;
  }
`

export const taskStyles = css`
  .list {
    display: grid;
    gap: 8px;
  }

  .row,
  .tile,
  .picture,
  .compact,
  .bubble {
    --ht-fg: #f4f2fa;
    --ht-muted: rgba(255, 255, 255, 0.74);
    --ht-divider: rgba(255, 255, 255, 0.28);
    position: relative;
    box-sizing: border-box;
    border-radius: calc(var(--ht-radius) * 1.3);
    corner-shape: var(--ht-corner);
    color: var(--ht-fg);
  }

  .row {
    display: grid;
    grid-template-columns: 68px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    height: 68px;
    padding-right: 10px;
    background: linear-gradient(var(--ht-wall) 86%, var(--ht-floor) 86%);
  }

  .compact {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 52px;
    padding-right: 4px;
    background: linear-gradient(var(--ht-wall) 86%, var(--ht-floor) 86%);
  }

  .row.no-button {
    grid-template-columns: 68px minmax(0, 1fr);
  }

  .compact.no-button {
    padding-right: 10px;
  }

  .row.no-text .actions {
    grid-column: 3;
  }

  .picture {
    width: 100%;
    aspect-ratio: 1;
  }

  .bubble {
    width: 72px;
    max-width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    corner-shape: round;
  }

  .thumb,
  .art {
    position: relative;
    overflow: hidden;
    border-radius: calc(var(--ht-radius) * 0.9);
    corner-shape: var(--ht-corner);
    background: var(--ht-surface-alt);
  }

  .thumb {
    width: 72px;
    height: 72px;
  }

  .art {
    aspect-ratio: 1;
  }

  .row .thumb {
    width: 68px;
    height: 68px;
    border-radius: calc(var(--ht-radius) * 1.3) 0 0 calc(var(--ht-radius) * 1.3);
    corner-shape: var(--ht-corner);
    background: none;
  }

  .tile .art {
    aspect-ratio: 200 / 192;
    border-radius: calc(var(--ht-radius) * 1.3) calc(var(--ht-radius) * 1.3) 0 0;
    corner-shape: var(--ht-corner);
    background: none;
  }

  .compact .thumb {
    flex: none;
    width: 52px;
    height: 52px;
    border-radius: calc(var(--ht-radius) * 1.3) 0 0 calc(var(--ht-radius) * 1.3);
    corner-shape: var(--ht-corner);
    background: none;
  }

  .compact .text {
    flex: 1;
  }

  .compact .title {
    font-size: 1rem;
  }

  .compact .actions {
    flex: none;
    gap: 4px;
    margin-inline-start: auto;
  }

  .compact .go-wrap {
    flex: none;
    width: 44px;
  }

  .compact .undo {
    position: static;
  }

  .picture .art,
  .bubble .art {
    position: absolute;
    inset: 0;
    aspect-ratio: auto;
    container-type: inline-size;
    background: linear-gradient(var(--ht-wall) 86%, var(--ht-floor) 86%);
  }

  .picture .art {
    border-radius: calc(var(--ht-radius) * 1.3);
    corner-shape: var(--ht-corner);
  }

  .bubble .art {
    border-radius: 50%;
    corner-shape: round;
  }

  .tile.no-text {
    grid-template-rows: auto auto;
  }

  .tile.no-button .text {
    padding-bottom: 12px;
  }

  .tile.no-text.no-button .art {
    border-radius: calc(var(--ht-radius) * 1.3);
    corner-shape: var(--ht-corner);
  }

  .badge {
    position: absolute;
    right: 3px;
    bottom: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(16, 20, 38, 0.55);
    color: var(--ht-task, var(--ht-fg));
    --mdc-icon-size: 16px;
  }

  .art .badge {
    right: 8px;
    bottom: 8px;
    width: 40px;
    height: 40px;
    --mdc-icon-size: 26px;
  }

  .picture .badge {
    right: min(8px, 8cqi);
    bottom: min(8px, 8cqi);
    width: min(40px, 40cqi);
    height: min(40px, 40cqi);
    --mdc-icon-size: min(26px, 26cqi);
  }

  .bubble .badge {
    right: auto;
    bottom: min(6px, 8.5cqi);
    left: calc(50% - min(16px, 22.5cqi));
    width: min(32px, 45cqi);
    height: min(32px, 45cqi);
    --mdc-icon-size: min(20px, 28cqi);
  }

  .alert-badge {
    position: absolute;
    z-index: 2;
    top: 4px;
    right: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--ht-danger);
    color: #ffffff;
  }

  .text {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .title,
  .stage-name,
  .due {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .title {
    font-size: 1.0625rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 14px;
    min-width: 0;
    overflow: hidden;
    font-size: 0.8125rem;
  }

  .when {
    position: relative;
    min-width: 0;
    max-width: 100%;
  }

  .meta > .when:first-child::before {
    content: none;
  }

  .when::before {
    content: '·';
    position: absolute;
    left: -9px;
    color: var(--ht-muted);
    line-height: 20px;
  }

  .stage {
    display: flex;
    flex: 0 1 auto;
    align-items: center;
    gap: 6px;
    min-width: 0;
    max-width: 100%;
    height: 20px;
    overflow: hidden;
    color: var(--ht-muted);
  }

  .auto {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 2px;
    color: #bfe3ff;
    font-size: 0;
    font-weight: 600;
  }

  .auto .ht-icon {
    width: 14px;
    height: 14px;
  }

  .dots {
    display: inline-flex;
    flex: none;
    gap: 3px;
  }

  .dots i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--ht-divider);
  }

  .dots .past {
    background: var(--ht-success);
  }

  .dots .now {
    background: var(--ht-task, var(--ht-accent));
  }

  .due {
    height: 20px;
    color: var(--ht-muted);
    line-height: 20px;
  }

  .is-due .due,
  .is-in_progress .due {
    color: #ffd98a;
  }

  .is-overdue .due,
  .due.failed {
    color: #ffb4a8;
  }

  .is-clean .due {
    color: #a7f0c9;
  }

  .go-wrap {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  .row .go-wrap {
    flex: none;
    width: 92px;
  }

  .go {
    appearance: none;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    height: 48px;
    padding: 0 10px;
    border: 2px solid transparent;
    border-radius: calc(var(--ht-radius) * 1.2);
    corner-shape: var(--ht-corner);
    font: inherit;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition:
      transform 120ms ease,
      opacity 120ms ease;
  }

  .go span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .go.icon-only {
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: 50%;
    corner-shape: round;
  }

  .go.loud {
    background: var(--ht-task, var(--ht-accent));
    color: var(--ht-on-task, var(--ht-on-accent));
  }

  .go.quiet {
    border-color: var(--ht-task, transparent);
    background: rgba(255, 255, 255, 0.16);
    color: var(--ht-fg);
  }

  .go.finished {
    border-color: transparent;
    background: var(--ht-success);
    color: #ffffff;
    opacity: 1;
  }

  .go:active:not(:disabled) {
    transform: scale(0.95);
  }

  .go:focus-visible,
  .undo:focus-visible,
  .skip:focus-visible {
    outline: 2px solid var(--ht-accent);
    outline-offset: 2px;
  }

  .go:disabled:not(.finished) {
    opacity: 0.45;
    cursor: default;
  }

  .go[data-pending] {
    opacity: 0.7;
  }

  .undo,
  .skip {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(16, 20, 38, 0.55);
    color: var(--ht-fg);
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .undo:disabled,
  .skip:disabled {
    opacity: 0.45;
  }

  .undo {
    position: absolute;
    z-index: 1;
  }

  .row .undo {
    top: 12px;
    right: 110px;
  }

  .tile .undo {
    top: 8px;
    right: 8px;
  }

  .tile {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto 1fr auto;
    background: var(--ht-floor);
    box-shadow: var(--ha-card-box-shadow, none);
  }

  .tile .text {
    padding: 2px 12px 0;
  }

  .tile .actions {
    padding: 8px 12px 12px;
  }

  .tile .title {
    font-size: 1.0625rem;
  }

  .actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .row.skeleton,
  .tile.skeleton,
  .picture.skeleton,
  .compact.skeleton,
  .bubble.skeleton,
  .skeleton {
    background: var(--ht-surface-alt);
    opacity: 0.5;
  }

  .tile.skeleton {
    height: 280px;
  }

  .swipe {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .swipe[data-active] {
    overflow: hidden;
  }

  .swipe > [data-task] {
    z-index: 1;
    min-width: 0;
  }

  .swipe > [data-task]:focus-visible {
    outline: 2px solid var(--ht-accent);
    outline-offset: 2px;
  }

  .swipe-bubble {
    width: 72px;
    max-width: 100%;
  }

  .swipe-bubble > .bubble {
    width: 100%;
  }

  .swipe-reveal {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    padding: 0 16px;
    box-sizing: border-box;
    overflow: hidden;
    border-radius: calc(var(--ht-radius) * 1.3);
    corner-shape: var(--ht-corner);
    color: #ffffff;
    font-size: 0.875rem;
    font-weight: 700;
    opacity: 0;
    pointer-events: none;
  }

  .swipe-bubble > .swipe-reveal {
    border-radius: 50%;
    corner-shape: round;
  }

  .swipe-reveal[data-action='advance'] {
    background: #2e9e6b;
  }

  .swipe-reveal[data-action='skip'] {
    background: #f0a92e;
    color: #14182a;
  }

  .swipe-reveal[data-action='undo'] {
    background: #3a86e0;
  }

  .swipe-reveal[data-disabled] {
    background: #6b7080;
    color: rgba(255, 255, 255, 0.72);
  }

  .swipe-reveal[data-dir='right'] {
    justify-content: flex-start;
  }

  .swipe-reveal[data-dir='left'] {
    justify-content: flex-end;
  }

  .swipe-reveal[data-dir='down'] {
    align-items: flex-start;
    justify-content: center;
    padding: 12px 16px;
  }

  .swipe-reveal[data-dir='up'] {
    align-items: flex-end;
    justify-content: center;
    padding: 12px 16px;
  }

  .swipe-reveal[data-dir='press'],
  .swipe-picture > .swipe-reveal,
  .swipe-bubble > .swipe-reveal {
    align-items: center;
    justify-content: center;
    padding: 4px;
  }

  .face {
    display: none;
    align-items: center;
    gap: 6px;
    min-width: 0;
    white-space: nowrap;
  }

  .swipe-reveal[data-action='advance'] [data-face='advance'],
  .swipe-reveal[data-action='skip'] [data-face='skip'],
  .swipe-reveal[data-action='undo'] [data-face='undo'] {
    display: inline-flex;
  }

  .swipe-picture .face,
  .swipe-bubble .face {
    flex-direction: column;
    gap: 0;
    font-size: 0.6875rem;
  }

  .swipe-reveal[data-armed] .ht-icon {
    transform: scale(1.2);
  }

  .ring::after {
    content: '';
    position: absolute;
    z-index: 1;
    inset: 0;
    border-radius: calc(var(--ht-radius) * 1.3);
    corner-shape: var(--ht-corner);
    box-shadow: inset 0 0 0 3px #ffc857;
    opacity: 0.85;
    pointer-events: none;
  }

  .ring.is-overdue::after {
    box-shadow: inset 0 0 0 3px #ff7a6b;
  }

  .bubble.ring::after {
    border-radius: 50%;
    corner-shape: round;
  }

  .burst {
    position: absolute;
    top: 50%;
    left: 50%;
    pointer-events: none;
  }

  .burst i {
    position: absolute;
    width: 8px;
    height: 8px;
    margin: -4px;
    border-radius: 2px;
    corner-shape: var(--ht-corner);
    opacity: 0;
    background: #ffc857;
  }

  .burst i:nth-child(2) {
    --ht-a: 45deg;
    background: #5fd6a8;
  }

  .burst i:nth-child(3) {
    --ht-a: 90deg;
    background: #5ab4ff;
  }

  .burst i:nth-child(4) {
    --ht-a: 135deg;
    background: #ff8fc7;
  }

  .burst i:nth-child(5) {
    --ht-a: 180deg;
    background: #ffc857;
  }

  .burst i:nth-child(6) {
    --ht-a: 225deg;
    background: #5fd6a8;
  }

  .burst i:nth-child(7) {
    --ht-a: 270deg;
    background: #b79bff;
  }

  .burst i:nth-child(8) {
    --ht-a: 315deg;
    background: #ff7a6b;
  }

  @media (max-width: 480px) {
    .row .skip {
      display: none;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .burst i {
      animation: ht-burst 0.8s steps(16) forwards;
    }

    .undo.enter {
      animation: ht-appear 0.2s steps(5) both;
    }

    .ring-pulse::after {
      animation: ht-ring 2.4s steps(24) infinite;
    }

    .pop-done .thumb svg,
    .pop-done .art svg {
      animation: ht-pop 0.5s steps(10);
    }

    .pop-stage .dots .now,
    .pop-stage.no-stage .thumb svg,
    .pop-stage.no-stage .art svg {
      animation: ht-pop 0.5s steps(10);
    }
  }

  @keyframes ht-ring {
    0%,
    100% {
      opacity: 0.3;
      transform: scale(0.97);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes ht-burst {
    0% {
      opacity: 1;
      transform: rotate(var(--ht-a, 0deg)) translateY(-8px) scale(0.5);
    }
    70% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: rotate(var(--ht-a, 0deg)) translateY(-62px) scale(1);
    }
  }

  @keyframes ht-appear {
    from {
      opacity: 0;
      transform: scale(0.6);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes ht-pop {
    0%,
    100% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.08);
    }
  }
`
