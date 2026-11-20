import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const app = require('../backend-app.cjs')

export default app
