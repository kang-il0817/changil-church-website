const API_BASE =
  process.env.API_BASE_URL ||
  'https://changil-church-website-backend-f3cef88b0d96.herokuapp.com'

export default async function handler(req, res) {
  const id = typeof req.query.id === 'string' ? req.query.id : req.query.id?.[0]
  if (!id) {
    res.statusCode = 400
    return res.end('Missing id')
  }

  try {
    const postRes = await fetch(`${API_BASE}/api/gallery-posts/${id}`)
    if (!postRes.ok) {
      res.statusCode = 404
      return res.end('Not found')
    }

    const post = await postRes.json()
    const imageUrl = post.thumbnail
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
