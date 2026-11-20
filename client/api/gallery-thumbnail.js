import { createRequire } from 'module'

const require = createRequire(import.meta.url)

function getId(req) {
  if (typeof req.query.id === 'string' && req.query.id) return req.query.id
  if (Array.isArray(req.query.id) && req.query.id[0]) return req.query.id[0]

  const url = new URL(req.url, 'https://www.changil.net')
  const parts = url.pathname.split('/').filter(Boolean)
  const last = parts[parts.length - 1] || ''
  return last.replace(/\.(jpe?g|png|webp)$/i, '')
}

export default async function handler(req, res) {
  const id = getId(req)
  if (!id) {
    res.statusCode = 400
    return res.end('Missing id')
  }

  try {
    const connectDB = require('../_server/config/database')
    const GalleryPost = require('../_server/models/GalleryPost')
    await connectDB()

    const post = await GalleryPost.findById(id).lean()
    const imageUrl = post?.thumbnail
    if (!imageUrl) {
      res.statusCode = 404
      return res.end('No thumbnail')
    }

    const imageRes = await fetch(imageUrl)
    if (!imageRes.ok) {
      res.statusCode = 502
      return res.end('Failed to fetch image')
    }

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg'
    const buffer = Buffer.from(await imageRes.arrayBuffer())

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')
    res.setHeader('X-Robots-Tag', 'all')
    res.statusCode = 200
    return res.end(buffer)
  } catch (error) {
    console.error('gallery-thumbnail proxy failed:', error)
    res.statusCode = 500
    return res.end('Error')
  }
}
