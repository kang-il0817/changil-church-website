const API_BASE =
  process.env.API_BASE_URL ||
  'https://changil-church-website-backend-f3cef88b0d96.herokuapp.com'

const BOT_UA =
  /facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|kakaotalk|kakaotalk-scrap|googlebot|bingbot|applebot|baiduspider|yeti|naverbot|daumoa|embedly|pinterest|redditbot|iframely|meta-externalagent|slack-imgproxy|linespider|scrapy|bot|crawler|spider/i

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
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="창일교회" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:url" content="${pageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="canonical" href="${pageUrl}" />
  `
}

function buildBotHtml({ title, description, image, pageUrl, metaTags }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | 창일교회</title>
  ${metaTags}
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <img src="${image}" alt="${title}" />
  <p><a href="${pageUrl}">${pageUrl}</a></p>
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
  const userAgent = req.headers['user-agent'] || ''
  const isBot = BOT_UA.test(userAgent)

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

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600')

  // 카카오/페북 등 크롤러에는 가벼운 OG 전용 HTML을 반환
  if (isBot) {
    res.statusCode = 200
    return res.end(
      buildBotHtml({
        title: safeTitle,
        description: safeDescription,
        image: safeImage,
        pageUrl: safeUrl,
        metaTags,
      })
    )
  }

  try {
    let html = await loadIndexHtml(origin)

    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle} | 창일교회</title>`)
    html = html.replace(
      /<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi,
      ''
    )
    // 스크립트보다 앞쪽(head 시작)에 OG 메타를 넣어 스크래퍼 호환성 향상
    html = html.replace(/<head([^>]*)>/i, `<head$1>${metaTags}`)

    res.statusCode = 200
    return res.end(html)
  } catch (error) {
    console.error('gallery-og html render failed:', error)
    res.statusCode = 200
    return res.end(
      buildBotHtml({
        title: safeTitle,
        description: safeDescription,
        image: safeImage,
        pageUrl: safeUrl,
        metaTags,
      })
    )
  }
}
