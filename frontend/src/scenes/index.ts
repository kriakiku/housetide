import type { TemplateResult } from 'lit'

import type { SceneName, SceneView } from '../types.ts'
import { backup } from './backup.ts'
import { bathroom } from './bathroom.ts'
import { bed } from './bed.ts'
import { bills } from './bills.ts'
import { book } from './book.ts'
import { call } from './call.ts'
import { carwash } from './carwash.ts'
import { coding } from './coding.ts'
import type { SceneOptions, SceneRenderer } from './common.ts'
import { cooking } from './cooking.ts'
import { cooler } from './cooler.ts'
import { dishes } from './dishes.ts'
import { ev } from './ev.ts'
import { filter } from './filter.ts'
import { fridge } from './fridge.ts'
import { fuel } from './fuel.ts'
import { generic } from './generic.ts'
import { groceries } from './groceries.ts'
import { gym } from './gym.ts'
import { journal } from './journal.ts'
import { language } from './language.ts'
import { laundry } from './laundry.ts'
import { lawn } from './lawn.ts'
import { music } from './music.ts'
import { owl } from './owl.ts'
import { pet } from './pet.ts'
import { pills } from './pills.ts'
import { plant } from './plant.ts'
import { pool } from './pool.ts'
import { run } from './run.ts'
import { slides } from './slides.ts'
import { study } from './study.ts'
import { teeth } from './teeth.ts'
import { trash } from './trash.ts'
import { vacuum } from './vacuum.ts'
import { water } from './water.ts'
import { window } from './window.ts'
import { yoga } from './yoga.ts'

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
  cooler,
  gym,
  pool,
  ev,
  fuel,
  study,
  language,
  coding,
  slides,
  book,
  filter,
  bills,
  yoga,
  run,
  groceries,
  cooking,
  call,
  journal,
  lawn,
  music,
  backup,
  carwash,
  owl,
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
  cooler,
  gym,
  pool,
  ev,
  fuel,
  study,
  language,
  coding,
  slides,
  book,
  filter,
  bills,
  yoga,
  run,
  groceries,
  cooking,
  call,
  journal,
  lawn,
  music,
  backup,
  carwash,
  owl,
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
