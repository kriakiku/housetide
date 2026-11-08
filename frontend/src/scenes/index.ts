import type { TemplateResult } from 'lit'

import type { SceneName, SceneView } from '../types.ts'
import type { SceneOptions, SceneRenderer } from './common.ts'
import { generic } from './generic.ts'
import { laundry } from './laundry.ts'
import { pills } from './pills.ts'
import { plant } from './plant.ts'

export type { SceneOptions, SceneRenderer } from './common.ts'
export { generic, laundry, pills, plant }

const SCENES: Record<SceneName, SceneRenderer> = { generic, laundry, pills, plant }

function isSceneName(name: string): name is SceneName {
  return Object.hasOwn(SCENES, name)
}

export function sceneFor(name: string): SceneRenderer {
  return isSceneName(name) ? SCENES[name] : generic
}

export function renderScene(scene: SceneView, options?: SceneOptions): TemplateResult {
  return sceneFor(scene.name)(scene, options)
}
