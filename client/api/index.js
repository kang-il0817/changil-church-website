import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const app = require('../backend-app.cjs')

export default function handler(req, res) {
  // rewrite 로 /api -> /api/index 로 들어와도 원본 /api/... 경로를 유지
  const candidates = [
    req.headers['x-forwarded-uri'],
    req.headers['x-vercel-forwarded-uri'],
    req.headers['x-invoke-path'],
    req.headers['x-matched-path'],
  ].filter((value) => typeof value === 'string' && value.length > 0)

  const current = req.url || ''
  const looksRewritten =
    current === '/api' ||
    current === '/api/' ||
    current === '/api/index' ||
    current.startsWith('/api?') ||
    current.startsWith('/api/index?')

  if (looksRewritten) {
    const original = candidates.find((value) => value.startsWith('/api/') && value !== '/api/index')
    if (original) {
      req.url = original
    }
  }

  return app(req, res)
}
