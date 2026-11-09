import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register({ url: 'http://localhost:8123/' })

const { preloadAllScenes } = await import('./scenes/index.ts')
await preloadAllScenes()
