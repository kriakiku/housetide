import type { SceneRenderer } from './common.ts'
import type { SceneLoader } from './lazy.ts'

type ChunkModule = Record<string, SceneRenderer | undefined>

export interface StaleBuildProbe {
  fetchEntry: () => Promise<Response>
  reload: () => void
}

const STALE_KEY = 'housetide.stale-build'
const SCENE_CHUNKS: Record<string, string | undefined> = { __HOUSETIDE_SCENE_CHUNKS__: '' }

const browserProbe: StaleBuildProbe = {
  fetchEntry: () => fetch(new URL('housetide.js', import.meta.url), { cache: 'no-store' }),
  reload: () => {
    location.reload()
  },
}

function digest(text: string): string {
  let hash = 5381
  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(hash, 33) + text.charCodeAt(index)
  }
  return String(hash)
}

export async function reloadIfStale(
  chunk: string,
  { fetchEntry, reload }: StaleBuildProbe = browserProbe,
): Promise<void> {
  try {
    const response = await fetchEntry()
    if (!response.ok || !response.headers.get('content-type')?.includes('javascript')) return
    const entry = await response.text()
    if (entry.includes(chunk)) return
    const build = digest(entry)
    if (sessionStorage.getItem(STALE_KEY) === build) return
    sessionStorage.setItem(STALE_KEY, build)
    reload()
  } catch {
    return
  }
}

export function chunkRetryUrl(chunk: string, attempt: number): string {
  return new URL(`${chunk}?retry=${attempt}`, import.meta.url).href
}

function isChunk(module: unknown): module is ChunkModule {
  return typeof module === 'object' && module !== null
}

async function importChunk(name: string, url: string): Promise<SceneRenderer> {
  const module: unknown = await import(url)
  const renderer = isChunk(module) ? module[name] : undefined
  if (!renderer) throw new Error(`${url} has no scene ${name}`)
  return renderer
}

export function recovering(
  name: string,
  first: () => Promise<SceneRenderer>,
  chunk = SCENE_CHUNKS[name],
  retry: typeof importChunk = importChunk,
  afterFailure: (chunk: string) => Promise<void> = reloadIfStale,
): SceneLoader {
  return async (attempt) => {
    try {
      if (attempt > 0 && chunk) return await retry(name, chunkRetryUrl(chunk, attempt))
      return await first()
    } catch (error) {
      if (chunk) void afterFailure(chunk)
      throw error
    }
  }
}
