import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './SermonDetail.css'

function SermonDetail({ id }) {
  const [sermon, setSermon] = useState(null)
  const [allSermons, setAllSermons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSermon()
    fetchAllSermons()
  }, [id])

  const fetchSermon = async () => {
    try {
      const response = await fetch(`/api/sermons`)
      const sermons = await response.json()
      const foundSermon = sermons.find(s => s._id === id)
      setSermon(foundSermon)
    } catch (error) {
      console.error('설교 데이터를 불러오는 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllSermons = async () => {
    try {
      const response = await fetch('/api/sermons')
      const data = await response.json()
      setAllSermons(data || [])
    } catch (error) {
      console.error('전체 설교 데이터를 불러오는 중 오류:', error)
    }
  }

  const getYouTubeEmbedUrl = (youtubeUrl) => {
    if (!youtubeUrl) return ''
    const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
  }

  const navigateToSermon = (sermonId) => {
    if (window.navigate) {
      window.navigate(`/sermon/${sermonId}`)
    } else {
      window.location.href = `/sermon/${sermonId}`
    }
  }

  const goHome = () => {
    if (window.navigate) {
      window.navigate('/')
    } else {
      window.location.href = '/'
    }
  }

  if (loading) {
    return (
      <div className="sermon-detail-page">
        <Header />
        <div className="loading">로딩 중...</div>
        <Footer />
      </div>
    )
  }

  if (!sermon) {
    return (
      <div className="sermon-detail-page">
        <Header />
        <div className="sermon-not-found">
          <h2>설교를 찾을 수 없습니다</h2>
          <button onClick={goHome} className="back-button">홈으로 돌아가기</button>
        </div>
        <Footer />
      </div>
    )
  }

  const embedUrl = getYouTubeEmbedUrl(sermon.youtubeUrl)

  return (
    <div className="sermon-detail-page">
      <Header />
      <main className="sermon-detail-main">
        <div className="sermon-detail-container">
          <div className="sermon-video-wrapper">
            {embedUrl ? (
              <div className="sermon-video-container">
                <iframe
                  src={embedUrl}
                  title={sermon.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="sermon-video-iframe"
                ></iframe>
                <div className="sermon-video-links">
                  <a 
                    href={sermon.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="youtube-link-button"
                  >
                    YouTube에서 보기
                  </a>
                </div>
              </div>
            ) : (
              <div className="sermon-video-error">
                <p>영상을 불러올 수 없습니다.</p>
                <a href={sermon.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  YouTube에서 보기
                </a>
              </div>
            )}
          </div>

          <div className="sermon-info-box">
            <div className="sermon-info-item">
              <span className="sermon-info-label">설교일</span>
              <span className="sermon-info-value">
                {sermon.date ? new Date(sermon.date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </span>
            </div>
            <div className="sermon-info-item">
              <span className="sermon-info-label">예배</span>
              <span className="sermon-info-value">{sermon.type || '-'}</span>
            </div>
            <div className="sermon-info-item">
              <span className="sermon-info-label">본문 및 제목</span>
              <span className="sermon-info-value">{sermon.title || '-'}</span>
            </div>
            <div className="sermon-info-item">
              <span className="sermon-info-label">설교자</span>
              <span className="sermon-info-value">{sermon.description || '설교자 정보 없음'}</span>
            </div>
          </div>

          <div className="sermon-list-section">
            <h2 className="sermon-list-title">설교 목록</h2>
            <div className="sermon-table-wrapper">
              <table className="sermon-table">
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>설교일</th>
                    <th>예배</th>
                    <th>본문 및 제목</th>
                    <th>설교자</th>
                  </tr>
                </thead>
                <tbody>
                  {allSermons.map((s, index) => (
                    <tr 
                      key={s._id}
                      className={s._id === id ? 'active' : ''}
                      onClick={() => navigateToSermon(s._id)}
                    >
                      <td>{allSermons.length - index}</td>
                      <td>
                        {s.date ? new Date(s.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }).replace(/\./g, '.').replace(/\s/g, '') : '-'}
                      </td>
                      <td>{s.type || '-'}</td>
                      <td className="sermon-table-title">{s.title || '-'}</td>
                      <td>{s.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default SermonDetail

