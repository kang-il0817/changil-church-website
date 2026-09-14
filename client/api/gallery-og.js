const API_BASE =
  process.env.API_BASE_URL ||
  'https://changil-church-website-backend-f3cef88b0d96.herokuapp.com'

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function getDescription(post) {
  const textSection = (post.sections || []).find(
    (section) => section.type === 'text' && section.content
  )

  if (textSection?.content) {
    return textSection.content
      .replace(/["“”']/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120)
  }

  return '창일교회 갤러리 — 은혜와 기쁨의 순간들을 공유합니다.'
}

function buildMetaTags({ title, description, image }) {
  return `
    <meta name="description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="창일교회" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
  `
}

function buildFallbackHtml({ title, description, image, pageUrl, metaTags }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | 창일교회</title>
  ${metaTags}
  <meta http-equiv="refresh" content="0;url=${pageUrl}" />
</head>
<body>
  <p><a href="${pageUrl}">${title}</a></p>
  <img src="${image}" alt="${title}" width="1" height="1" style="display:none" />
  <p>${description}</p>
</body>
</html>`
}

async function loadIndexHtml(origin) {
  try {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    return readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf8')
  } catch {
    try {
      const { readFileSync } = await import('node:fs')
      const { join } = await import('node:path')
      return readFileSync(join(process.cwd(), 'index.html'), 'utf8')
    } catch {
      const response = await fetch(`${origin}/index.html`)
      if (!response.ok) {
        throw new Error(`Failed to load index.html (${response.status})`)
      }
      return response.text()
    }
  }
}

export default async function handler(req, res) {
  const id = typeof req.query.id === 'string' ? req.query.id : req.query.id?.[0]
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.changil.net'
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const origin = `${proto}://${host}`
  const pageUrl = id ? `${origin}/gallery/${id}` : `${origin}/gallery`

  let title = '창일 갤러리'
  let description = '창일교회 갤러리 — 은혜와 기쁨의 순간들을 공유합니다.'
  let image = id
    ? `${origin}/og-thumb/${encodeURIComponent(id)}`
    : `${origin}/pastor-photo.jpg`

  if (id) {
    try {
      const response = await fetch(`${API_BASE}/api/gallery-posts/${id}`)
      if (response.ok) {
        const post = await response.json()
        title = post.title || title
        description = getDescription(post)
        if (!post.thumbnail) {
          image = `${origin}/pastor-photo.jpg`
        }
      }
    } catch (error) {
      console.error('gallery-og fetch failed:', error)
    }
  }

  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)
  const safeImage = escapeHtml(image)
  const safeUrl = escapeHtml(pageUrl)
  const metaTags = buildMetaTags({
    title: safeTitle,
    description: safeDescription,
    image: safeImage,
  })

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, must-revalidate')

  try {
    let html = await loadIndexHtml(origin)

    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle} | 창일교회</title>`)
    html = html.replace(
      /<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi,
      ''
    )
    // 모든 방문/크롤러에게 SPA + OG 메타를 함께 제공
    // (카카오톡 인앱 브라우저도 KakaoTalk UA라 봇 전용 HTML을 쓰면 안 됨)
    html = html.replace(/<head([^>]*)>/i, `<head$1>${metaTags}`)

    res.statusCode = 200
    return res.end(html)
  } catch (error) {
    console.error('gallery-og html render failed:', error)
    res.statusCode = 200
    return res.end(
      buildFallbackHtml({
        title: safeTitle,
        description: safeDescription,
        image: safeImage,
        pageUrl: safeUrl,
        metaTags,
      })
    )
  }
}
