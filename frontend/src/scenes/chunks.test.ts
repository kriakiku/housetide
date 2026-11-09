import { beforeEach, describe, expect, test } from 'bun:test'

import { chunkRetryUrl, recovering, reloadIfStale } from './chunks.ts'
import { laundry } from './laundry.ts'

const CHUNK = 'laundry-old.js'

function entry(body: string, status = 200, type = 'text/javascript'): () => Promise<Response> {
  return () => Promise.resolve(new Response(body, { status, headers: { 'content-type': type } }))
}

function probe(fetchEntry: () => Promise<Response>): {
  reloads: () => number
  run: () => Promise<void>
} {
  let reloads = 0
  return {
    reloads: () => reloads,
    run: () =>
      reloadIfStale(CHUNK, {
        fetchEntry,
        reload: () => {
          reloads += 1
        },
      }),
  }
}

describe('a retry', () => {
  test('imports a new url on every attempt and only then', async () => {
    const urls: string[] = []
    let first = 0
    const loader = recovering(
      'laundry',
      () => {
        first += 1
        return Promise.resolve(laundry)
      },
      CHUNK,
      (_name, url) => {
        urls.push(url)
        return Promise.resolve(laundry)
      },
    )
    await loader(0)
    await loader(1)
    await loader(2)
    expect(first).toBe(1)
    expect(urls).toEqual([chunkRetryUrl(CHUNK, 1), chunkRetryUrl(CHUNK, 2)])
    expect(new Set(urls).size).toBe(2)
    expect(urls[0]).toEndWith(`/${CHUNK}?retry=1`)
  })

  test('falls back to the first import without a chunk name', async () => {
    let first = 0
    const loader = recovering(
      'laundry',
      () => {
        first += 1
        return Promise.resolve(laundry)
      },
      undefined,
    )
    expect(await loader(3)).toBe(laundry)
    expect(first).toBe(1)
  })

  test('checks for a stale build and still rejects', async () => {
    const checked: string[] = []
    const loader = recovering(
      'laundry',
      () => Promise.reject(new Error('404')),
      CHUNK,
      () => Promise.reject(new Error('404')),
      (chunk) => {
        checked.push(chunk)
        return Promise.resolve()
      },
    )
    expect(loader(0)).rejects.toThrow('404')
    expect(loader(1)).rejects.toThrow('404')
    await Promise.resolve()
    expect(checked).toEqual([CHUNK, CHUNK])
  })
})

describe('a stale build', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  test('reloads when the live entry no longer names the chunk', async () => {
    const page = probe(entry('import("./laundry-new.js")'))
    await page.run()
    expect(page.reloads()).toBe(1)
  })

  test('reloads once per build', async () => {
    const page = probe(entry('import("./laundry-new.js")'))
    await page.run()
    await page.run()
    expect(page.reloads()).toBe(1)
    const newer = probe(entry('import("./laundry-newer.js")'))
    await newer.run()
    expect(newer.reloads()).toBe(1)
  })

  test('does not reload while the entry still names the chunk', async () => {
    const page = probe(entry(`import("./${CHUNK}")`))
    await page.run()
    expect(page.reloads()).toBe(0)
  })

  for (const [label, fetchEntry] of [
    ['an error status', entry('bad gateway', 502)],
    ['a page that is not the entry', entry('<html></html>', 200, 'text/html')],
    ['no connection', () => Promise.reject(new Error('offline'))],
  ] as const) {
    test(`does not reload on ${label}`, async () => {
      const page = probe(fetchEntry)
      await page.run()
      expect(page.reloads()).toBe(0)
    })
  }
})
