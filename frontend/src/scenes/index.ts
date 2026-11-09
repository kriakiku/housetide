import type { SceneName } from '../types.ts'
import { recovering } from './chunks.ts'
import type { SceneRenderer } from './common.ts'
import { generic } from './generic.ts'
import { createSceneRegistry } from './lazy.ts'
import type { SceneLoaders } from './lazy.ts'

export type { SceneOptions, SceneRenderer } from './common.ts'
export { generic }

const SCENE_IMPORTS = {
  laundry: () => import('./laundry.ts').then((module) => module.laundry),
  pills: () => import('./pills.ts').then((module) => module.pills),
  plant: () => import('./plant.ts').then((module) => module.plant),
  teeth: () => import('./teeth.ts').then((module) => module.teeth),
  bed: () => import('./bed.ts').then((module) => module.bed),
  dishes: () => import('./dishes.ts').then((module) => module.dishes),
  trash: () => import('./trash.ts').then((module) => module.trash),
  vacuum: () => import('./vacuum.ts').then((module) => module.vacuum),
  pet: () => import('./pet.ts').then((module) => module.pet),
  bathroom: () => import('./bathroom.ts').then((module) => module.bathroom),
  fridge: () => import('./fridge.ts').then((module) => module.fridge),
  window: () => import('./window.ts').then((module) => module.window),
  water: () => import('./water.ts').then((module) => module.water),
  cooler: () => import('./cooler.ts').then((module) => module.cooler),
  gym: () => import('./gym.ts').then((module) => module.gym),
  pool: () => import('./pool.ts').then((module) => module.pool),
  ev: () => import('./ev.ts').then((module) => module.ev),
  fuel: () => import('./fuel.ts').then((module) => module.fuel),
  study: () => import('./study.ts').then((module) => module.study),
  language: () => import('./language.ts').then((module) => module.language),
  coding: () => import('./coding.ts').then((module) => module.coding),
  slides: () => import('./slides.ts').then((module) => module.slides),
  book: () => import('./book.ts').then((module) => module.book),
  filter: () => import('./filter.ts').then((module) => module.filter),
  bills: () => import('./bills.ts').then((module) => module.bills),
  yoga: () => import('./yoga.ts').then((module) => module.yoga),
  run: () => import('./run.ts').then((module) => module.run),
  groceries: () => import('./groceries.ts').then((module) => module.groceries),
  cooking: () => import('./cooking.ts').then((module) => module.cooking),
  call: () => import('./call.ts').then((module) => module.call),
  journal: () => import('./journal.ts').then((module) => module.journal),
  lawn: () => import('./lawn.ts').then((module) => module.lawn),
  music: () => import('./music.ts').then((module) => module.music),
  backup: () => import('./backup.ts').then((module) => module.backup),
  carwash: () => import('./carwash.ts').then((module) => module.carwash),
  owl: () => import('./owl.ts').then((module) => module.owl),
  mop: () => import('./mop.ts').then((module) => module.mop),
  dust: () => import('./dust.ts').then((module) => module.dust),
  iron: () => import('./iron.ts').then((module) => module.iron),
  wardrobe: () => import('./wardrobe.ts').then((module) => module.wardrobe),
  smoke: () => import('./smoke.ts').then((module) => module.smoke),
  aircon: () => import('./aircon.ts').then((module) => module.aircon),
  mail: () => import('./mail.ts').then((module) => module.mail),
  recycle: () => import('./recycle.ts').then((module) => module.recycle),
  dogwalk: () => import('./dogwalk.ts').then((module) => module.dogwalk),
  litter: () => import('./litter.ts').then((module) => module.litter),
  aquarium: () => import('./aquarium.ts').then((module) => module.aquarium),
  garden: () => import('./garden.ts').then((module) => module.garden),
  pressure: () => import('./pressure.ts').then((module) => module.pressure),
  doctor: () => import('./doctor.ts').then((module) => module.doctor),
  sleep: () => import('./sleep.ts').then((module) => module.sleep),
  skincare: () => import('./skincare.ts').then((module) => module.skincare),
  haircut: () => import('./haircut.ts').then((module) => module.haircut),
  eyes: () => import('./eyes.ts').then((module) => module.eyes),
  tyres: () => import('./tyres.ts').then((module) => module.tyres),
  service: () => import('./service.ts').then((module) => module.service),
  inbox: () => import('./inbox.ts').then((module) => module.inbox),
  taxes: () => import('./taxes.ts').then((module) => module.taxes),
  gift: () => import('./gift.ts').then((module) => module.gift),
  suitcase: () => import('./suitcase.ts').then((module) => module.suitcase),
  tomato: () => import('./tomato.ts').then((module) => module.tomato),
} satisfies Record<Exclude<SceneName, 'generic'>, () => Promise<SceneRenderer>>

export const SCENE_LOADERS: SceneLoaders = Object.fromEntries(
  Object.entries(SCENE_IMPORTS).map(([name, first]) => [name, recovering(name, first)]),
)

export const { renderScene, preloadScene, preloadAllScenes } = createSceneRegistry(
  generic,
  SCENE_LOADERS,
)
