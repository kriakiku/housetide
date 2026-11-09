import { noChange } from 'lit'
import type { ElementPart } from 'lit'
import { AsyncDirective, directive, PartType } from 'lit/async-directive.js'
import type { DirectiveParameters, PartInfo } from 'lit/async-directive.js'

export const CARD_LAYOUTS = ['list', 'scenes', 'picture', 'compact', 'bubbles'] as const
export type CardLayout = (typeof CARD_LAYOUTS)[number]

export const GESTURE_NAMES = [
  'tap',
  'double_tap',
  'long_press',
  'swipe_left',
  'swipe_right',
  'swipe_up',
  'swipe_down',
] as const
export type GestureName = (typeof GESTURE_NAMES)[number]

export const GESTURE_ACTIONS = ['advance', 'skip', 'undo', 'none'] as const
export type GestureAction = (typeof GESTURE_ACTIONS)[number]
export type TaskAction = Exclude<GestureAction, 'none'>

export type GestureMap = Partial<Record<GestureName, GestureAction>>
export type ActiveGestures = Partial<Record<GestureName, TaskAction>>

const TOUCH_DEFAULTS: GestureMap = {
  swipe_right: 'advance',
  swipe_left: 'skip',
  long_press: 'undo',
}

export function defaultGesture(layout: CardLayout, gesture: GestureName): GestureAction {
  if (layout === 'list' || layout === 'scenes') return 'none'
  return TOUCH_DEFAULTS[gesture] ?? 'none'
}

export function activeGestures(layout: CardLayout, config: GestureMap = {}): ActiveGestures {
  const active: ActiveGestures = {}
  for (const gesture of GESTURE_NAMES) {
    const action = config[gesture] ?? defaultGesture(layout, gesture)
    if (action !== 'none') active[gesture] = action
  }
  return active
}

export const MAX_THRESHOLD_PX = 72
export const THRESHOLD_SHARE = 0.35
export const SLOP_PX = 10
export const LONG_PRESS_MS = 500
export const DOUBLE_TAP_MS = 280
export const SPRING_MS = 240
export const FLASH_MS = 220

const DOUBLE_TAP_REACH_PX = 40
const PRESSED_OPACITY = '0.25'
const CONTROLS = 'button, a[href], input, select, textarea, [role="button"]'

export function commitThreshold(width: number): number {
  return width > 0 ? Math.min(MAX_THRESHOLD_PX, width * THRESHOLD_SHARE) : MAX_THRESHOLD_PX
}

export function resisted(distance: number, threshold: number): number {
  if (distance <= threshold) return distance * 0.9
  return threshold * 0.9 + (distance - threshold) * 0.35
}

type Haptic = 'selection' | 'medium' | 'failure'

const VIBRATION: Record<Haptic, number | number[]> = {
  selection: 8,
  medium: 18,
  failure: [12, 40, 12],
}

function quietly(action: () => void): void {
  try {
    action()
  } catch {
    return
  }
}

export function haptic(kind: Haptic): void {
  quietly(() => {
    window.dispatchEvent(new CustomEvent('haptic', { detail: kind }))
  })
  quietly(() => {
    if ('vibrate' in navigator) navigator.vibrate(VIBRATION[kind])
  })
}

export interface GestureOptions {
  gestures: ActiveGestures
  available: (action: TaskAction) => boolean
  run: (action: TaskAction) => void
  animations: boolean
  fade?: boolean
  timing?: { longPress?: number; doubleTap?: number; flash?: number }
}

type Phase = 'idle' | 'pressed' | 'drag' | 'held' | 'ignored'
type Axis = 'x' | 'y'
type Timer = ReturnType<typeof setTimeout> | undefined

export class GestureController {
  readonly element: HTMLElement

  private options: GestureOptions
  private attached = false
  private phase: Phase = 'idle'
  private pointerId = -1
  private startX = 0
  private startY = 0
  private axis: Axis = 'x'
  private threshold = MAX_THRESHOLD_PX
  private wasArmed = false
  private painted = ''
  private firstTap: { x: number; y: number } | undefined
  private secondPress = false
  private heldLong = false
  private longTimer: Timer
  private tapTimer: Timer
  private settleTimer: Timer

  constructor(element: HTMLElement, options: GestureOptions) {
    this.element = element
    this.options = options
  }

  update(options: GestureOptions): void {
    this.options = options
    if (this.attached) this.applyHost()
  }

  attach(): void {
    if (this.attached) return
    this.attached = true
    const { element } = this
    element.addEventListener('pointerdown', this.onDown)
    element.addEventListener('pointermove', this.onMove, { passive: true })
    element.addEventListener('pointerup', this.onUp)
    element.addEventListener('pointercancel', this.onCancel)
    element.addEventListener('lostpointercapture', this.onCancel)
    element.addEventListener('contextmenu', this.onContextMenu)
    element.addEventListener('keydown', this.onKey)
    this.applyHost()
  }

  detach(): void {
    if (!this.attached) return
    this.attached = false
    const { element } = this
    element.removeEventListener('pointerdown', this.onDown)
    element.removeEventListener('pointermove', this.onMove)
    element.removeEventListener('pointerup', this.onUp)
    element.removeEventListener('pointercancel', this.onCancel)
    element.removeEventListener('lostpointercapture', this.onCancel)
    element.removeEventListener('contextmenu', this.onContextMenu)
    element.removeEventListener('keydown', this.onKey)
    clearTimeout(this.longTimer)
    clearTimeout(this.tapTimer)
    this.firstTap = undefined
    this.secondPress = false
    this.heldLong = false
    this.phase = 'idle'
    this.pointerId = -1
    this.clearVisual()
    element.removeAttribute('tabindex')
    element.removeAttribute('aria-keyshortcuts')
    element.style.removeProperty('touch-action')
  }

  private get gestures(): ActiveGestures {
    return this.options.gestures
  }

  private applyHost(): void {
    const { element, gestures } = this
    element.style.touchAction = gestures.swipe_up || gestures.swipe_down ? 'none' : 'pan-y'
    element.tabIndex = 0
    const keys = [
      this.enterAction() ? 'Enter' : '',
      this.mapped('skip') ? 'Delete' : '',
      this.mapped('undo') ? 'Backspace' : '',
    ].filter(Boolean)
    if (keys.length > 0) element.setAttribute('aria-keyshortcuts', keys.join(' '))
    else element.removeAttribute('aria-keyshortcuts')
  }

  private mapped(action: TaskAction): boolean {
    return Object.values(this.gestures).includes(action)
  }

  private enterAction(): TaskAction | undefined {
    return this.gestures.tap ?? (this.mapped('advance') ? 'advance' : undefined)
  }

  private hasAxis(axis: Axis): boolean {
    const { gestures } = this
    return axis === 'x'
      ? Boolean(gestures.swipe_left ?? gestures.swipe_right)
      : Boolean(gestures.swipe_up ?? gestures.swipe_down)
  }

  private startsOnControl(event: Event): boolean {
    for (const node of event.composedPath()) {
      if (node === this.element) return false
      if (node instanceof Element && node.matches(CONTROLS)) return true
    }
    return false
  }

  private motion(): boolean {
    if (!this.options.animations) return false
    try {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      return true
    }
  }

  private reveal(): HTMLElement | undefined {
    const sibling = this.element.previousElementSibling
    return sibling instanceof HTMLElement && sibling.classList.contains('swipe-reveal')
      ? sibling
      : undefined
  }

  private readonly onDown = (event: PointerEvent): void => {
    this.heldLong = false
    if (!event.isPrimary || event.button !== 0 || this.startsOnControl(event)) return
    this.meetFirstTap(event.clientX, event.clientY)
    clearTimeout(this.longTimer)
    this.finishSettling()
    this.phase = 'pressed'
    this.pointerId = event.pointerId
    this.startX = event.clientX
    this.startY = event.clientY
    quietly(() => {
      this.element.setPointerCapture(event.pointerId)
    })
    if (this.gestures.long_press) {
      this.longTimer = setTimeout(this.onHold, this.options.timing?.longPress ?? LONG_PRESS_MS)
    }
  }

  private readonly onMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return
    if (this.phase === 'drag') {
      this.paint(this.delta(event))
      return
    }
    if (this.phase !== 'pressed') return
    const dx = event.clientX - this.startX
    const dy = event.clientY - this.startY
    if (Math.hypot(dx, dy) < SLOP_PX) return
    clearTimeout(this.longTimer)
    if (this.secondPress) this.settleFirstTap()
    this.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
    if (!this.hasAxis(this.axis)) {
      this.phase = 'ignored'
      return
    }
    this.phase = 'drag'
    this.threshold = commitThreshold(this.element.getBoundingClientRect().width)
    this.wasArmed = false
    this.element.style.willChange = 'transform, opacity'
    this.element.parentElement?.setAttribute('data-active', '')
    this.paint(this.delta(event))
  }

  private readonly onUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return
    clearTimeout(this.longTimer)
    const { phase } = this
    this.phase = 'idle'
    this.pointerId = -1
    if (phase === 'pressed') this.tapped(event.clientX, event.clientY)
    else if (phase === 'drag') this.finishDrag(this.delta(event))
    else if (phase === 'held') this.springBack()
  }

  private readonly onCancel = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return
    clearTimeout(this.longTimer)
    const dragged = this.phase === 'drag' || this.phase === 'held'
    this.phase = 'idle'
    this.pointerId = -1
    if (this.secondPress) this.settleFirstTap()
    if (dragged) this.springBack()
  }

  private readonly onContextMenu = (event: Event): void => {
    if ((this.phase !== 'idle' || this.heldLong) && this.gestures.long_press) event.preventDefault()
  }

  private readonly onHold = (): void => {
    const action = this.gestures.long_press
    if (this.phase !== 'pressed' || !action) return
    this.phase = 'held'
    this.heldLong = true
    if (this.secondPress) this.settleFirstTap()
    const enabled = this.options.available(action)
    this.press(action, enabled)
    if (enabled) this.fire(action)
    else haptic('failure')
  }

  private readonly onKey = (event: KeyboardEvent): void => {
    if (event.composedPath()[0] !== this.element) return
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
    const action = this.keyAction(event.key)
    if (!action) return
    event.preventDefault()
    this.attempt(action)
  }

  private keyAction(key: string): TaskAction | undefined {
    if (key === 'Enter') return this.enterAction()
    if (key === 'Delete' && this.mapped('skip')) return 'skip'
    if (key === 'Backspace' && this.mapped('undo')) return 'undo'
    return undefined
  }

  private delta(event: PointerEvent): number {
    return this.axis === 'x' ? event.clientX - this.startX : event.clientY - this.startY
  }

  private swipe(delta: number): { name: GestureName; direction: string } {
    if (this.axis === 'x') {
      return delta > 0
        ? { name: 'swipe_right', direction: 'right' }
        : { name: 'swipe_left', direction: 'left' }
    }
    return delta > 0
      ? { name: 'swipe_down', direction: 'down' }
      : { name: 'swipe_up', direction: 'up' }
  }

  private paint(delta: number): void {
    const { element } = this
    const { name, direction } = this.swipe(delta)
    const action = this.gestures[name]
    if (!action || delta === 0) {
      element.style.transform = ''
      element.style.removeProperty('opacity')
      this.face(undefined)
      this.wasArmed = false
      return
    }
    const distance = Math.abs(delta)
    const enabled = this.options.available(action)
    const armed = distance >= this.threshold
    const progress = Math.min(1, distance / this.threshold)
    const offset = Math.sign(delta) * resisted(distance, this.threshold)
    element.style.transform =
      this.axis === 'x' ? `translate3d(${offset}px, 0, 0)` : `translate3d(0, ${offset}px, 0)`
    if (this.options.fade) element.style.opacity = String(1 - 0.75 * progress)
    this.face({ action, direction, enabled, armed }, 0.3 + 0.7 * progress)
    if (armed && enabled && !this.wasArmed) haptic('selection')
    this.wasArmed = armed
  }

  private face(
    state: { action: TaskAction; direction: string; enabled: boolean; armed: boolean } | undefined,
    opacity = 1,
  ): void {
    const reveal = this.reveal()
    if (!reveal) return
    reveal.style.opacity = state ? String(opacity) : '0'
    const key = state ? `${state.action}|${state.direction}|${state.enabled}|${state.armed}` : ''
    if (key === this.painted) return
    this.painted = key
    if (!state) {
      this.clearFace(reveal)
      return
    }
    reveal.dataset.action = state.action
    reveal.dataset.dir = state.direction
    reveal.toggleAttribute('data-disabled', !state.enabled)
    reveal.toggleAttribute('data-armed', state.armed)
  }

  private clearFace(reveal: HTMLElement): void {
    for (const name of ['data-action', 'data-dir', 'data-disabled', 'data-armed']) {
      reveal.removeAttribute(name)
    }
  }

  private press(action: TaskAction, enabled: boolean): void {
    this.element.style.transform = 'scale(0.96)'
    this.element.style.opacity = PRESSED_OPACITY
    this.face({ action, direction: 'press', enabled, armed: true })
  }

  private finishDrag(delta: number): void {
    const action = this.gestures[this.swipe(delta).name]
    if (action && Math.abs(delta) >= this.threshold) {
      if (this.options.available(action)) this.fire(action)
      else haptic('failure')
    }
    this.springBack()
  }

  private tapped(x: number, y: number): void {
    if (this.secondPress) {
      this.secondPress = false
      this.tap('double_tap')
      return
    }
    if (!this.gestures.double_tap) {
      this.tap('tap')
      return
    }
    this.firstTap = { x, y }
    this.tapTimer = setTimeout(() => {
      this.firstTap = undefined
      this.tap('tap')
    }, this.options.timing?.doubleTap ?? DOUBLE_TAP_MS)
  }

  private meetFirstTap(x: number, y: number): void {
    const first = this.firstTap
    if (!first) return
    if (Math.hypot(x - first.x, y - first.y) > DOUBLE_TAP_REACH_PX) {
      this.settleFirstTap()
      return
    }
    clearTimeout(this.tapTimer)
    this.firstTap = undefined
    this.secondPress = true
  }

  private settleFirstTap(): void {
    clearTimeout(this.tapTimer)
    this.firstTap = undefined
    this.secondPress = false
    const action = this.gestures.tap
    if (!action) return
    if (this.options.available(action)) this.fire(action)
    else haptic('failure')
  }

  private tap(name: 'tap' | 'double_tap'): void {
    const action = this.gestures[name]
    if (action) this.attempt(action)
  }

  private attempt(action: TaskAction): void {
    if (this.options.available(action)) {
      this.fire(action)
      return
    }
    haptic('failure')
    this.finishSettling()
    this.press(action, false)
    this.settleTimer = setTimeout(() => {
      this.springBack()
    }, this.options.timing?.flash ?? FLASH_MS)
  }

  private fire(action: TaskAction): void {
    haptic('medium')
    this.options.run(action)
  }

  private springBack(): void {
    if (!this.motion()) {
      this.finishSettling()
      return
    }
    const { element } = this
    const reveal = this.reveal()
    clearTimeout(this.settleTimer)
    element.style.transition = `transform ${SPRING_MS}ms cubic-bezier(0.2, 1.4, 0.4, 1), opacity ${SPRING_MS}ms ease-out`
    element.style.transform = ''
    element.style.removeProperty('opacity')
    if (reveal) {
      reveal.style.transition = `opacity ${SPRING_MS}ms ease-out`
      reveal.style.opacity = '0'
    }
    this.settleTimer = setTimeout(() => {
      this.clearVisual()
    }, SPRING_MS)
  }

  private finishSettling(): void {
    clearTimeout(this.settleTimer)
    this.clearVisual()
  }

  private clearVisual(): void {
    const { element } = this
    clearTimeout(this.settleTimer)
    for (const name of ['transform', 'transition', 'opacity', 'will-change']) {
      element.style.removeProperty(name)
    }
    element.parentElement?.removeAttribute('data-active')
    const reveal = this.reveal()
    if (reveal) {
      reveal.style.removeProperty('opacity')
      reveal.style.removeProperty('transition')
      this.clearFace(reveal)
    }
    this.painted = ''
    this.wasArmed = false
  }
}

class TaskGesturesDirective extends AsyncDirective {
  private controller: GestureController | undefined

  constructor(part: PartInfo) {
    super(part)
    if (part.type !== PartType.ELEMENT) throw new Error('taskGestures goes on an element')
  }

  render(_options: GestureOptions | null): typeof noChange {
    return noChange
  }

  override update(part: ElementPart, [options]: DirectiveParameters<this>): typeof noChange {
    if (!options) {
      this.controller?.detach()
      this.controller = undefined
      return noChange
    }
    if (this.controller?.element === part.element) {
      this.controller.update(options)
      return noChange
    }
    this.controller?.detach()
    if (!(part.element instanceof HTMLElement)) return noChange
    this.controller = new GestureController(part.element, options)
    this.controller.attach()
    return noChange
  }

  protected override disconnected(): void {
    this.controller?.detach()
  }

  protected override reconnected(): void {
    this.controller?.attach()
  }
}

export const taskGestures = directive(TaskGesturesDirective)
