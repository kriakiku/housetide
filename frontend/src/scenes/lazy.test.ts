import { afterEach, describe, expect, test } from 'bun:test'

import { html, render } from 'lit'
import type { TemplateResult } from 'lit'
import { guard } from 'lit/directives/guard.js'

import { PICKER_GROUPS } from '../panel/model.ts'
import type { SceneView } from '../types.ts'
import { tileFor } from './common.ts'
import { generic, SCENE_LOADERS } from './index.ts'
import { laundry } from './laundry.ts'
import { createSceneRegistry, onceVisible, scrollRoot } from './lazy.ts'
import type { SceneLoader, SceneRegistry, SceneRegistrySettings } from './lazy.ts'
import { pills } from './pills.ts'

const VIEW: SceneView = {
  name: 'laundry',
  state: 'due',
  fill: 0.8,
  stink: 0.5,
  progress: 0,
}

interface Deferred {
  loader: SceneLoader
  resolve: (renderer: typeof laundry) => void
  reject: (error: Error) => void
  calls: () => number
}

function deferred(): Deferred {
  let calls = 0
  let resolve: Deferred['resolve'] = () => undefined
  let reject: Deferred['reject'] = () => undefined
  const loader: SceneLoader = () => {
    calls += 1
    return new Promise((yes, no) => {
      resolve = yes
      reject = no
    })
  }
  return {
    loader,
    resolve: (renderer) => {
      resolve(renderer)
    },
    reject: (error) => {
      reject(error)
    },
    calls: () => calls,
  }
}

const immediately = (_target: unknown, show: () => void) => {
  show()
  return () => undefined
}

function registry(
  loaders: Parameters<typeof createSceneRegistry>[1],
  settings: SceneRegistrySettings = {},
): SceneRegistry {
  return createSceneRegistry(generic, loaders, { whenVisible: immediately, ...settings })
}

async function settle(ms = 0): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function mount(value: TemplateResult): HTMLElement {
  const host = document.createElement('div')
  render(value, host)
  return host
}

function svgOf(host: Element): Element {
  const root = host.querySelector('svg')
  if (!root) throw new Error('no scene drawn')
  return root
}

function partsOf(host: Element): string[] {
  return [...host.querySelectorAll('[data-part]')].map(
    (node) => node.getAttribute('data-part') ?? '',
  )
}

describe('placeholder', () => {
  test('is the frame of the scene and nothing more', async () => {
    const load = deferred()
    const { renderScene } = registry({ laundry: load.loader })
    const host = mount(renderScene(VIEW, { animations: false, label: 'Washing' }))
    await settle()
    const root = svgOf(host)
    expect(root.getAttribute('data-scene')).toBe('laundry')
    expect(root.getAttribute('data-state')).toBe('due')
    expect(root.getAttribute('aria-label')).toBe('Washing')
    expect(root.getAttribute('viewBox')).toBe('0 0 200 200')
    expect(partsOf(host)).toEqual(['tile', 'floor'])
    const tile = tileFor('due', 0.5)
    expect(host.querySelector('[data-part="tile"]')?.getAttribute('fill')).toBe(tile.wall)
    expect(host.querySelector('[data-part="floor"]')?.getAttribute('fill')).toBe(tile.floor)
  })

  test('keeps the size of the real scene in a bleed layout', async () => {
    const load = deferred()
    const { renderScene } = registry({ laundry: load.loader })
    const options = { animations: false, bleed: true }
    const host = mount(renderScene(VIEW, options))
    const before = svgOf(host).getAttribute('viewBox')
    await settle()
    load.resolve(laundry)
    await settle()
    expect(partsOf(host).length).toBeGreaterThan(2)
    expect(svgOf(host).getAttribute('viewBox')).toBe(before)
  })
})

describe('loading', () => {
  test('swaps the placeholder for the scene without a host render', async () => {
    const load = deferred()
    const { renderScene } = registry({ laundry: load.loader })
    const host = mount(renderScene(VIEW, { animations: false }))
    await settle()
    expect(partsOf(host)).toEqual(['tile', 'floor'])
    load.resolve(laundry)
    await settle()
    expect(partsOf(host).length).toBeGreaterThan(2)
  })

  test('fetches a scene once however often it is drawn', async () => {
    const load = deferred()
    const { renderScene } = registry({ laundry: load.loader })
    const first = document.createElement('div')
    const second = document.createElement('div')
    render(renderScene(VIEW), first)
    render(renderScene(VIEW), second)
    render(renderScene({ ...VIEW, state: 'clean' }), first)
    await settle()
    expect(load.calls()).toBe(1)
    load.resolve(laundry)
    await settle()
    render(renderScene(VIEW), first)
    await settle()
    expect(load.calls()).toBe(1)
    expect(partsOf(first).length).toBeGreaterThan(2)
    expect(partsOf(second).length).toBeGreaterThan(2)
  })

  test('draws the latest view when the chunk arrives', async () => {
    const load = deferred()
    const { renderScene } = registry({ laundry: load.loader })
    const host = document.createElement('div')
    render(renderScene(VIEW, { animations: false }), host)
    await settle()
    render(renderScene({ ...VIEW, state: 'clean', stink: 0 }, { animations: false }), host)
    expect(svgOf(host).getAttribute('data-state')).toBe('clean')
    load.resolve(laundry)
    await settle()
    expect(svgOf(host).getAttribute('data-state')).toBe('clean')
  })

  test('reaches a thumbnail behind guard', async () => {
    const load = deferred()
    const { renderScene } = registry({ laundry: load.loader })
    const draw = (): TemplateResult => html`${guard(['laundry'], () => renderScene(VIEW))}`
    const host = document.createElement('div')
    render(draw(), host)
    await settle()
    render(draw(), host)
    load.resolve(laundry)
    await settle()
    expect(partsOf(host).length).toBeGreaterThan(2)
  })

  test('keeps the same elements on the next host render', async () => {
    const load = deferred()
    const { renderScene } = registry({ laundry: load.loader })
    const host = document.createElement('div')
    render(renderScene(VIEW), host)
    await settle()
    load.resolve(laundry)
    await settle()
    const drawn = svgOf(host)
    render(renderScene(VIEW), host)
    expect(svgOf(host)).toBe(drawn)
  })

  test('does not draw a scene the host has moved on from', async () => {
    const laundryLoad = deferred()
    const pillsLoad = deferred()
    const { renderScene } = registry({ laundry: laundryLoad.loader, pills: pillsLoad.loader })
    const host = document.createElement('div')
    render(renderScene(VIEW), host)
    await settle()
    render(renderScene({ ...VIEW, name: 'pills' }), host)
    await settle()
    laundryLoad.resolve(laundry)
    await settle()
    expect(svgOf(host).getAttribute('data-scene')).toBe('pills')
    pillsLoad.resolve(pills)
    await settle()
    expect(svgOf(host).getAttribute('data-scene')).toBe('pills')
    expect(partsOf(host).length).toBeGreaterThan(2)
  })
})

describe('a failed load', () => {
  test('keeps the placeholder and does not refetch on every render', async () => {
    const load = deferred()
    const { renderScene } = registry({ laundry: load.loader }, { retryMs: 60_000 })
    const host = document.createElement('div')
    render(renderScene(VIEW), host)
    await settle()
    load.reject(new Error('offline'))
    await settle()
    expect(partsOf(host)).toEqual(['tile', 'floor'])
    expect(() => {
      render(renderScene(VIEW), host)
    }).not.toThrow()
    await settle()
    expect(load.calls()).toBe(1)
  })

  test('is retried while the scene is on screen', async () => {
    let calls = 0
    const loader: SceneLoader = () => {
      calls += 1
      return calls === 1 ? Promise.reject(new Error('offline')) : Promise.resolve(laundry)
    }
    const { renderScene } = registry({ laundry: loader }, { retryMs: 5 })
    const host = mount(html`${guard([1], () => renderScene(VIEW))}`)
    await settle()
    expect(partsOf(host)).toEqual(['tile', 'floor'])
    await settle(30)
    expect(calls).toBe(2)
    expect(partsOf(host).length).toBeGreaterThan(2)
  })

  test('counts its attempts so a retry can use a new url', async () => {
    const seen: number[] = []
    const loader: SceneLoader = (attempt) => {
      seen.push(attempt)
      return attempt < 2 ? Promise.reject(new Error('offline')) : Promise.resolve(laundry)
    }
    const { renderScene } = registry({ laundry: loader }, { retryMs: 5 })
    const host = mount(html`${guard([1], () => renderScene(VIEW))}`)
    await settle(60)
    expect(seen).toEqual([0, 1, 2])
    expect(partsOf(host).length).toBeGreaterThan(2)
  })

  test('survives a loader that throws', async () => {
    const loader: SceneLoader = () => {
      throw new Error('broken')
    }
    const { renderScene } = registry({ laundry: loader }, { retryMs: 60_000 })
    const host = mount(renderScene(VIEW))
    await settle()
    expect(partsOf(host)).toEqual(['tile', 'floor'])
  })

  test('is not retried once nothing shows the scene', async () => {
    let calls = 0
    const loader: SceneLoader = () => {
      calls += 1
      return Promise.reject(new Error('offline'))
    }
    const { renderScene } = registry({ laundry: loader }, { retryMs: 5 })
    const host = document.createElement('div')
    render(renderScene(VIEW), host)
    await settle()
    render(html`<p></p>`, host)
    await settle(30)
    expect(calls).toBe(1)
  })

  test('rejects an explicit preload', async () => {
    const loader: SceneLoader = () => Promise.reject(new Error('offline'))
    const { preloadScene } = registry({ laundry: loader }, { retryMs: 60_000 })
    const error = await preloadScene('laundry').catch((reason: unknown) => reason)
    expect(error).toBeInstanceOf(Error)
  })
})

describe('visibility', () => {
  const attached: Element[] = []
  const realObserver = globalThis.IntersectionObserver

  afterEach(() => {
    for (const node of attached.splice(0)) node.remove()
    globalThis.IntersectionObserver = realObserver
  })

  function attach(node: HTMLElement): HTMLElement {
    document.body.append(node)
    attached.push(node)
    return node
  }

  function scroller(): HTMLElement {
    const node = document.createElement('main')
    node.style.overflowY = 'auto'
    return node
  }

  test('finds the scroller around a target', () => {
    const main = attach(scroller())
    const clip = document.createElement('div')
    clip.style.overflow = 'hidden'
    const target = document.createElement('div')
    clip.append(target)
    main.append(clip)
    expect(scrollRoot(target)).toBe(main)
  })

  test('finds the scroller across a shadow root', () => {
    const main = attach(scroller())
    const host = document.createElement('div')
    main.append(host)
    const target = document.createElement('div')
    host.attachShadow({ mode: 'open' }).append(target)
    expect(scrollRoot(target)).toBe(main)
  })

  test('uses the viewport when nothing scrolls', () => {
    const target = attach(document.createElement('div'))
    expect(scrollRoot(target)).toBeNull()
  })

  test('applies its margin to the scroller', () => {
    const main = attach(scroller())
    const target = document.createElement('div')
    main.append(target)
    let seen: IntersectionObserverInit | undefined
    globalThis.IntersectionObserver = class {
      constructor(_callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        seen = options
      }
      observe(): void {
        return undefined
      }
      disconnect(): void {
        return undefined
      }
    } as unknown as typeof IntersectionObserver
    onceVisible(target, () => undefined)()
    expect(seen?.root).toBe(main)
    expect(seen?.rootMargin).toBe('200px')
  })

  test('waits until the scene is on screen', async () => {
    const load = deferred()
    let show = (): void => undefined
    const { renderScene } = registry(
      { laundry: load.loader },
      {
        whenVisible: (_target, callback) => {
          show = callback
          return () => undefined
        },
      },
    )
    const host = mount(renderScene(VIEW))
    await settle()
    expect(load.calls()).toBe(0)
    show()
    await settle()
    expect(load.calls()).toBe(1)
    expect(partsOf(host)).toEqual(['tile', 'floor'])
  })

  test('never fetches a scene removed before it was seen', async () => {
    const load = deferred()
    let stopped = 0
    let show = (): void => undefined
    const { renderScene } = registry(
      { laundry: load.loader },
      {
        whenVisible: (_target, callback) => {
          show = callback
          return () => {
            stopped += 1
          }
        },
      },
    )
    const host = document.createElement('div')
    render(renderScene(VIEW), host)
    await settle()
    render(html`<p></p>`, host)
    expect(stopped).toBe(1)
    expect(load.calls()).toBe(0)
    expect(show).toBeFunction()
  })

  test('does not wait for a node outside the document', () => {
    let shown = 0
    onceVisible(document.createElement('div'), () => {
      shown += 1
    })
    expect(shown).toBe(1)
  })
})

describe('names and preloading', () => {
  test('draws generic at once and fetches nothing for unknown names', () => {
    const load = deferred()
    const { renderScene } = registry({ laundry: load.loader })
    for (const name of ['nope', 'toString', '__proto__', 'generic']) {
      const host = mount(renderScene({ ...VIEW, name } as unknown as SceneView))
      expect(svgOf(host).getAttribute('data-scene')).toBe('generic')
      expect(partsOf(host).length).toBeGreaterThan(2)
    }
    expect(load.calls()).toBe(0)
  })

  test('renders synchronously after a preload', async () => {
    const { renderScene, preloadScene } = registry(SCENE_LOADERS)
    await preloadScene('laundry')
    expect(partsOf(mount(renderScene(VIEW))).length).toBeGreaterThan(2)
  })

  test('ignores an unknown name in a preload', async () => {
    const load = deferred()
    const { preloadScene } = registry({ laundry: load.loader })
    await preloadScene('nope')
    expect(load.calls()).toBe(0)
  })

  test('has a real loader for every scene in the picker', async () => {
    const { renderScene, preloadAllScenes } = registry(SCENE_LOADERS)
    await preloadAllScenes()
    for (const name of PICKER_GROUPS.flatMap((group) => group.scenes)) {
      const host = mount(renderScene({ ...VIEW, name }))
      expect(svgOf(host).getAttribute('data-scene')).toBe(name)
      if (name !== 'generic') expect(partsOf(host).length).toBeGreaterThanOrEqual(2)
    }
  })
})
