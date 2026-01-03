import { useState, useEffect } from 'react'
import './SermonVideoSection.css'

function SermonVideoSection() {
  const [sundaySermon, setSundaySermon] = useState(null)
  const [dawnPrayerSermons, setDawnPrayerSermons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSermons()
  }, [])

  const fetchSermons = async () => {
    try {
      // 주일예배와 전체 설교를 동시에 가져오기
      const [sundayResponse, allResponse] = await Promise.all([
        fetch('/api/sermons/type/주일예배').then(res => res.json()).catch(() => null),
        fetch('/api/sermons').then(res => res.json()).catch(() => [])
      ])

      setSundaySermon(sundayResponse)
      
      // 새벽기도만 필터링하여 최대 3개
      const dawnPrayers = (allResponse || [])
        .filter(s => s.type === '새벽기도' || s.type === '새벽예배')
        .slice(0, 3)
      setDawnPrayerSermons(dawnPrayers)
    } catch (error) {
      console.error('설교 데이터를 불러오는 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateToSermon = (sermonId) => {
    if (window.navigate) {
      window.navigate(`/sermon/${sermonId}`)
    } else {
      window.location.href = `/sermon/${sermonId}`
    }
  }

  const handleCopyAccount = async (accountNumber) => {
    try {
      await navigator.clipboard.writeText(accountNumber)
      alert('계좌번호가 복사되었습니다.')
    } catch (error) {
      console.error('복사 실패:', error)
      alert('계좌번호 복사에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <section className="sermon-video-section">
        <div className="sermon-container">
          <div className="loading">로딩 중...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="sermon-video-section">
      <div className="sermon-container" data-aos="fade-down">
          {/* 왼쪽: 주일예배 큰 썸네일 */}
          <div className="sermon-main-wrapper">
            <div className="sermon-main-card">
              {sundaySermon ? (
                <div 
                  className="sermon-featured-thumbnail"
                  onClick={() => navigateToSermon(sundaySermon._id)}
                >
                  <img 
                    src={sundaySermon.customThumbnail || sundaySermon.thumbnailUrl} 
                    alt={sundaySermon.title}
                    onError={(e) => {
                      if (sundaySermon.customThumbnail && e.target.src !== sundaySermon.thumbnailUrl) {
                        e.target.src = sundaySermon.thumbnailUrl
                      } else {
                        e.target.src = 'https://via.placeholder.com/640x360?text=No+Thumbnail'
                      }
                    }}
                  />
                  <div className="sermon-type-tag sermon-type-tag-featured sermon-type-주일예배">
                    주일예배
                  </div>
                  <div className="play-overlay-featured">
                    <div className="play-icon-featured">▶</div>
                  </div>
                </div>
              ) : (
                <div className="sermon-empty-large">
                  <p>등록된 주일예배 설교가 없습니다</p>
                </div>
              )}
            </div>
            {sundaySermon && (
              <div className="sermon-offering-section">
                <span className="sermon-offering-label">온라인 헌금:</span>
                <span className="sermon-offering-account">국민은행 86640104083897 (창일교회)</span>
                <button 
                  className="sermon-offering-copy-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyAccount('86640104083897')
                  }}
                  title="계좌번호 복사"
                >
                  복사
                </button>
              </div>
            )}
          </div>

          {/* 오른쪽: 새벽기도 리스트 */}
          <div className="sermon-sidebar">
            <div className="sermon-list">
              {dawnPrayerSermons.map((sermon, index) => (
                <div 
                  key={sermon._id || index} 
                  className="sermon-list-item"
                  onClick={() => navigateToSermon(sermon._id)}
                >
                  <div className="sermon-list-content">
                    <div className="sermon-list-title-text">
                      {sermon.type || '새벽기도'}
                    </div>
                    <div className="sermon-list-description">
                      {sermon.title}
                    </div>
                    <div className="sermon-list-meta">
                      {sermon.description || '구현우 목사'}
                    </div>
                  </div>
                  <div className="sermon-list-play-icon">▶</div>
                </div>
              ))}
              {dawnPrayerSermons.length === 0 && (
                <div className="sermon-empty-small">
                  <p>등록된 설교가 없습니다</p>
                </div>
              )}
            </div>
            <a 
              href="https://www.youtube.com/@Changil_Church" 
              target="_blank" 
              rel="noopener noreferrer"
              className="sermon-youtube-button"
            >
              <div className="sermon-youtube-icon-wrapper">
                <img src="/youtube-icon.svg" alt="YouTube" className="sermon-youtube-icon-img" />
              </div>
              <div className="sermon-youtube-text">
                창일교회 유튜브 바로가기
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SermonVideoSection

