import type { TemplateResult } from 'lit'

import type { SceneName, SceneView } from '../types.ts'
import { bathroom } from './bathroom.ts'
import { bed } from './bed.ts'
import type { SceneOptions, SceneRenderer } from './common.ts'
import { dishes } from './dishes.ts'
import { fridge } from './fridge.ts'
import { generic } from './generic.ts'
import { laundry } from './laundry.ts'
import { pet } from './pet.ts'
import { pills } from './pills.ts'
import { plant } from './plant.ts'
import { teeth } from './teeth.ts'
import { trash } from './trash.ts'
import { vacuum } from './vacuum.ts'
import { water } from './water.ts'
import { window } from './window.ts'

export type { SceneOptions, SceneRenderer } from './common.ts'
export {
  generic,
  laundry,
  pills,
  plant,
  teeth,
  bed,
  dishes,
  trash,
  vacuum,
  pet,
  bathroom,
  fridge,
  window,
  water,
}

const SCENES: Record<SceneName, SceneRenderer> = {
  generic,
  laundry,
  pills,
  plant,
  teeth,
  bed,
  dishes,
  trash,
  vacuum,
  pet,
  bathroom,
  fridge,
  window,
  water,
}

function isSceneName(name: string): name is SceneName {
  return Object.hasOwn(SCENES, name)
}

export function sceneFor(name: string): SceneRenderer {
  return isSceneName(name) ? SCENES[name] : generic
}

export function renderScene(scene: SceneView, options?: SceneOptions): TemplateResult {
  return sceneFor(scene.name)(scene, options)
}
