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
    return textSection.content.replace(/\s+/g, ' ').trim().slice(0, 150)
  }

  return '창일교회 갤러리 — 은혜와 기쁨의 순간들을 공유합니다.'
}

function absoluteUrl(url, origin) {
  if (!url) return `${origin}/pastor-photo.jpg`
  if (/^https?:\/\//i.test(url)) return url
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`
}

function buildMetaTags({ title, description, image, pageUrl }) {
  return `
    <meta name="description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="창일교회" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="canonical" href="${pageUrl}" />
  `
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
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'changilchurch.com'
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const origin = `${proto}://${host}`
  const pageUrl = id ? `${origin}/gallery/${id}` : `${origin}/gallery`

  let title = '창일 갤러리'
  let description = '창일교회 갤러리 — 은혜와 기쁨의 순간들을 공유합니다.'
  let image = `${origin}/pastor-photo.jpg`

  if (id) {
    try {
      const response = await fetch(`${API_BASE}/api/gallery-posts/${id}`)
      if (response.ok) {
        const post = await response.json()
        title = post.title || title
        description = getDescription(post)
        image = absoluteUrl(post.thumbnail, origin)
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
    pageUrl: safeUrl,
  })

  try {
    let html = await loadIndexHtml(origin)

    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle} | 창일교회</title>`)

    // 기본 og/twitter/description 메타를 제거한 뒤 포스트 전용 태그로 교체
    html = html.replace(
      /<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi,
      ''
    )
    html = html.replace(/<\/head>/i, `${metaTags}</head>`)

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
    res.statusCode = 200
    return res.end(html)
  } catch (error) {
    console.error('gallery-og html render failed:', error)

    // SPA 로드 실패 시에도 공유 미리보기용 최소 HTML은 반환
    const fallbackHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>${safeTitle} | 창일교회</title>
  ${metaTags}
</head>
<body>
  <p>${safeTitle}</p>
  <script>location.replace(${JSON.stringify(pageUrl)});</script>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.statusCode = 200
    return res.end(fallbackHtml)
  }
}
