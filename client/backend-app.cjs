/**
 * Vercel 서버리스용 Express 앱.
 * 빌드 시 ../server/src 가 ./_server 로 복사된다.
 */
const express = require('express')
const cors = require('cors')
const path = require('path')

const connectDB = require('./_server/config/database')
const routes = require('./_server/routes')

const app = express()

const corsOptions = {
  origin: [
    'http://localhost:3001',
    'https://www.changil.net',
    'https://changil.net',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    console.error('DB connect middleware failed:', error)
    res.status(500).json({ message: 'Database connection failed' })
  }
})

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Changilweb API', service: 'vercel-serverless' })
})

// 정상 경로: /api/sermons 등
app.use('/api', routes)

// rewrite 후 경로가 /sermons 처럼 들어오는 경우 대비
app.use((req, res, next) => {
  if (req.url === '/health' || req.url.startsWith('/health?')) {
    req.url = '/api/health' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '')
  }
  next()
})
app.use(routes)

app.use((err, req, res, next) => {
  console.error('API error:', err.stack)
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  })
})

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path })
})

module.exports = app
