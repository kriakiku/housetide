import { readdirSync, rmSync } from 'node:fs'
import { basename, join } from 'node:path'

const ROOT = join(import.meta.dir, '..')
const OUT = join(ROOT, 'custom_components', 'housetide', 'frontend')

const result = await Bun.build({
  entrypoints: [join(ROOT, 'frontend', 'src', 'housetide.ts')],
  outdir: OUT,
  format: 'esm',
  target: 'browser',
  minify: true,
  splitting: true,
  naming: { entry: '[name].[ext]', chunk: '[name]-[hash].[ext]' },
})

const PLACEHOLDER = /\{\s*__HOUSETIDE_SCENE_CHUNKS__\s*:\s*(?:""|''|``)\s*\}/
const entry = result.outputs.find((output) => output.kind === 'entry-point')
if (!entry) throw new Error('the build has no entry')
const chunks = Object.fromEntries(
  result.outputs
    .filter((output) => output.kind === 'chunk')
    .map((output) => basename(output.path))
    .map((file) => [file.replace(/-[^-]+\.js$/, ''), file]),
)
const source = await Bun.file(entry.path).text()
if (!PLACEHOLDER.test(source)) throw new Error('the entry has no scene chunk table')
await Bun.write(
  entry.path,
  source.replace(PLACEHOLDER, () => JSON.stringify(chunks)),
)

const current = new Set(result.outputs.map((output) => basename(output.path)))
for (const file of readdirSync(OUT)) {
  if (!current.has(file)) rmSync(join(OUT, file), { recursive: true })
}
