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
    return textSection.content
      .replace(/["“”']/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120)
  }

  return '창일교회 갤러리 — 은혜와 기쁨의 순간들을 공유합니다.'
}

function buildMetaTags({ title, description, image }) {
  // og:url은 카카오가 재스크랩하는 원인이 될 수 있어 넣지 않음
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
  <img src="${image}" alt="${title}" width="600" />
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
  // 카카오는 외부(Supabase) 이미지의 x-robots-tag:none 때문에 스크랩이 실패할 수 있어
  // 동일 도메인 프록시 URL을 og:image로 사용한다.
  let image = id
    ? `${origin}/og-thumb/${encodeURIComponent(id)}.jpg`
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
