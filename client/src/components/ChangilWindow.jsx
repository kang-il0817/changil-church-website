import { useState, useEffect } from 'react'
import './ChangilWindow.css'

function ChangilWindow() {
  const [posts, setPosts] = useState([]) // 갤러리 포스트들
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestPosts()
  }, [])

  // 최신 갤러리 포스트 가져오기 (메인 페이지용)
  const fetchLatestPosts = async () => {
    try {
      const response = await fetch('/api/gallery-posts/latest')
      const data = await response.json()
      setPosts(data || [])
    } catch (error) {
      console.error('갤러리 포스트를 불러오는 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  // 포스트 클릭 핸들러
  const handlePostClick = (postId) => {
    if (window.navigate) {
      window.navigate(`/gallery/${postId}`)
    } else {
      window.location.href = `/gallery/${postId}`
    }
  }

  // 갤러리 목록 페이지로 이동
  const handleViewAllClick = () => {
    if (window.navigate) {
      window.navigate('/gallery')
    } else {
      window.location.href = '/gallery'
    }
  }

  if (loading) {
    return (
      <section className="changil-window">
        <div className="changil-window-container">
          <div className="loading">로딩 중...</div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="changil-window" data-aos="fade-up">
        <div className="changil-window-container">
          <div className="section-header" data-aos="fade-up" data-aos-delay="100">
            <h2 className="section-title">
              <span className="title-bold">창일</span>
              <span className="title-light"> 갤러리</span>
            </h2>
            <p className="section-description">
              은혜와 기쁨의 순간들을 공유합니다.
            </p>
          </div>
          <div className="window-images" data-aos="fade-down" data-aos-delay="200">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <div 
                  key={post._id || index} 
                  className="window-image-item"
                  onClick={() => handlePostClick(post._id)}
                >
                  <img 
                    src={post.thumbnail} 
                    alt={post.title || `갤러리 포스트 ${index + 1}`}
                    className="window-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x225?text=No+Image'
                    }}
                  />
                  {post.title && (
                    <div className="window-image-title-overlay">
                      <span className="window-image-title-text">{post.title}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <>
                <div className="window-image-placeholder">사진 1</div>
                <div className="window-image-placeholder">사진 2</div>
                <div className="window-image-placeholder">사진 3</div>
              </>
            )}
          </div>
          {posts.length > 0 && (
            <div className="window-view-all">
              <button 
                className="window-view-all-button"
                onClick={handleViewAllClick}
              >
                목록보기
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default ChangilWindow
