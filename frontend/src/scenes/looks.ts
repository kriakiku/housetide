import type { SceneName } from '../types.ts'
import { COLORS as C } from './common.ts'

export type VariantName = 'cat' | 'dog' | 'colored' | 'white' | 'black'
export type AccentName =
  | 'coral'
  | 'terracotta'
  | 'yellow'
  | 'caramel'
  | 'green'
  | 'mint'
  | 'aqua'
  | 'blue'
  | 'lilac'
  | 'pink'

export const VARIANTS: Partial<Record<SceneName, readonly VariantName[]>> = {
  pet: ['cat', 'dog'],
  laundry: ['colored', 'white', 'black'],
}

export const ACCENTS: ReadonlyArray<{ name: AccentName; color: string }> = [
  { name: 'coral', color: C.coral },
  { name: 'terracotta', color: C.terracotta },
  { name: 'yellow', color: C.sun },
  { name: 'caramel', color: C.wicker },
  { name: 'green', color: C.leaf },
  { name: 'mint', color: C.mint },
  { name: 'aqua', color: C.water },
  { name: 'blue', color: C.skyDark },
  { name: 'lilac', color: C.lilac },
  { name: 'pink', color: C.pink },
]

export function variantsFor(scene: SceneName): readonly VariantName[] {
  return VARIANTS[scene] ?? []
}
