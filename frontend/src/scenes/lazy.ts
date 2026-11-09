import { html, nothing } from 'lit'
import type { ChildPart, TemplateResult } from 'lit'
import { AsyncDirective, directive } from 'lit/async-directive.js'

import type { SceneName, SceneView } from '../types.ts'
import { frame } from './common.ts'
import type { SceneOptions, SceneRenderer } from './common.ts'

export type SceneLoader = (attempt: number) => Promise<SceneRenderer>
export type SceneLoaders = Readonly<Partial<Record<SceneName, SceneLoader>>>
export type WhenVisible = (target: Node | null | undefined, show: () => void) => () => void

export interface SceneRegistrySettings {
  retryMs?: number
  whenVisible?: WhenVisible
}

export interface SceneRegistry {
  renderScene: (scene: SceneView, options?: SceneOptions) => TemplateResult
  preloadScene: (name: string) => Promise<void>
  preloadAllScenes: () => Promise<void>
}

interface SceneSource {
  get: (name: string) => SceneRenderer | undefined
  subscribe: (name: string, listener: () => void) => () => void
  request: (name: string) => void
  whenVisible: WhenVisible
}

const RETRY_MS = 30_000
const VISIBLE_MARGIN = '200px'
const SCROLLING = new Set(['auto', 'scroll', 'overlay'])
const noop = (): void => undefined

function flatParent(node: Element): Element | null {
  if (node.assignedSlot) return node.assignedSlot
  const parent = node.parentNode
  if (parent instanceof ShadowRoot) return parent.host
  return parent instanceof Element ? parent : null
}

export function scrollRoot(target: Element): Element | null {
  for (let node = flatParent(target); node; node = flatParent(node)) {
    if (node === document.body || node === document.documentElement) return null
    if (SCROLLING.has(getComputedStyle(node).overflowY)) return node
  }
  return null
}

export const onceVisible: WhenVisible = (target, show) => {
  if (
    !(target instanceof Element) ||
    !target.isConnected ||
    typeof IntersectionObserver === 'undefined'
  ) {
    show()
    return noop
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer.disconnect()
      show()
    },
    { root: scrollRoot(target), rootMargin: VISIBLE_MARGIN },
  )
  observer.observe(target)
  return () => {
    observer.disconnect()
  }
}

class LazyScene extends AsyncDirective {
  private source: SceneSource | undefined
  private scene: SceneView | undefined
  private sceneOptions: SceneOptions | undefined
  private part: ChildPart | undefined
  private watched: string | undefined
  private stop = noop

  override update(
    part: ChildPart,
    args: [SceneSource, SceneView, SceneOptions | undefined],
  ): TemplateResult {
    this.part = part
    return this.render(...args)
  }

  render(source: SceneSource, scene: SceneView, options?: SceneOptions): TemplateResult {
    this.source = source
    this.scene = scene
    this.sceneOptions = options
    const renderer = source.get(scene.name)
    if (renderer) {
      this.unwatch()
      return renderer(scene, options)
    }
    if (this.isConnected) this.watch(source, scene.name)
    return frame(scene.name, scene, options, nothing)
  }

  private watch(source: SceneSource, name: string): void {
    if (this.watched === name) return
    this.unwatch()
    this.watched = name
    const unsubscribe = source.subscribe(name, () => {
      this.unwatch()
      this.draw()
    })
    let cancelled = false
    let unobserve = noop
    queueMicrotask(() => {
      if (cancelled) return
      unobserve = source.whenVisible(this.part?.parentNode, () => {
        source.request(name)
      })
    })
    this.stop = () => {
      cancelled = true
      unsubscribe()
      unobserve()
    }
  }

  private unwatch(): void {
    this.stop()
    this.stop = noop
    this.watched = undefined
  }

  private draw(): void {
    const { source, scene, sceneOptions } = this
    const renderer = scene && source?.get(scene.name)
    if (renderer) this.setValue(renderer(scene, sceneOptions))
  }

  protected override disconnected(): void {
    this.unwatch()
  }

  protected override reconnected(): void {
    const { source, scene } = this
    if (!source || !scene) return
    if (source.get(scene.name)) this.draw()
    else this.watch(source, scene.name)
  }
}

const lazyScene = directive(LazyScene)

const slot = (value: unknown): TemplateResult => html`${value}`

export function createSceneRegistry(
  fallback: SceneRenderer,
  loaders: SceneLoaders,
  settings: SceneRegistrySettings = {},
): SceneRegistry {
  const retryMs = settings.retryMs ?? RETRY_MS
  const table = new Map<string, SceneLoader>(Object.entries(loaders))
  const loaded = new Map<string, SceneRenderer>()
  const running = new Map<string, Promise<void>>()
  const listeners = new Map<string, Set<() => void>>()
  const cooling = new Set<string>()
  const attempts = new Map<string, number>()

  const fetchScene = async (name: string, loader: SceneLoader): Promise<void> => {
    const attempt = attempts.get(name) ?? 0
    attempts.set(name, attempt + 1)
    try {
      loaded.set(name, await loader(attempt))
    } catch (error) {
      scheduleRetry(name)
      throw error
    }
    for (const listener of listeners.get(name) ?? []) listener()
  }

  const load = (name: string): Promise<void> => {
    const current = running.get(name)
    if (current) return current
    const loader = table.get(name)
    if (!loader || loaded.has(name)) return Promise.resolve()
    const fetching = fetchScene(name, loader).finally(() => {
      running.delete(name)
    })
    running.set(name, fetching)
    return fetching
  }

  const request = (name: string): void => {
    if (!cooling.has(name)) load(name).catch(noop)
  }

  function scheduleRetry(name: string): void {
    if (cooling.has(name)) return
    cooling.add(name)
    setTimeout(() => {
      cooling.delete(name)
      if (listeners.get(name)?.size) request(name)
    }, retryMs)
  }

  const source: SceneSource = {
    get: (name) => loaded.get(name),
    subscribe: (name, listener) => {
      const group = listeners.get(name) ?? new Set()
      listeners.set(name, group)
      group.add(listener)
      return () => {
        group.delete(listener)
      }
    },
    request,
    whenVisible: settings.whenVisible ?? onceVisible,
  }

  return {
    renderScene: (scene, options) => {
      if (!table.has(scene.name)) return slot(fallback(scene, options))
      const renderer = loaded.get(scene.name)
      return slot(renderer ? renderer(scene, options) : lazyScene(source, scene, options))
    },
    preloadScene: load,
    preloadAllScenes: async () => {
      await Promise.all([...table.keys()].map(load))
    },
  }
}
