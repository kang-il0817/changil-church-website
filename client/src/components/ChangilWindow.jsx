import { useState, useEffect, useRef } from 'react'
import './ChangilWindow.css'

function ChangilWindow() {
  const [posts, setPosts] = useState([]) // 갤러리 포스트들
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0) // 모바일 페이지네이션용
  const sectionRef = useRef(null)

  useEffect(() => {
    fetchLatestPosts()
  }, [])

  useEffect(() => {
    // 초기 상태 확인 - 이미 화면에 보이면 즉시 표시
    const checkInitialVisibility = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        const isInViewport = rect.top < window.innerHeight * 0.8 && rect.bottom > 0
        if (isInViewport) {
          setIsVisible(true)
          return true
        }
      }
      return false
    }

    // 약간의 지연 후 초기 상태 확인 (렌더링 완료 후)
    const timeoutId = setTimeout(() => {
      if (!checkInitialVisibility()) {
        // 화면에 보이지 않으면 Intersection Observer 설정
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setIsVisible(true)
                // 한 번만 실행되도록 unobserve
                observer.unobserve(entry.target)
              }
            })
          },
          { threshold: 0.1, rootMargin: '50px' }
        )

        if (sectionRef.current) {
          observer.observe(sectionRef.current)
        }

        return () => {
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current)
          }
        }
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
    }
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

  // 모바일 페이지네이션 핸들러
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === posts.length - 1 ? 0 : prev + 1))
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
      <section className="changil-window" ref={sectionRef}>
        <div className="changil-window-container">
          <div className={`section-header ${isVisible ? 'fade-in-up' : ''}`}>
            <h2 className="section-title">
              <span className="title-bold">창일</span>
              <span className="title-light"> 갤러리</span>
            </h2>
            <p className="section-description">
              은혜와 기쁨의 순간들을 공유합니다.
            </p>
          </div>
          <div className="window-images">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <div 
                  key={post._id || index} 
                  className={`window-image-item ${index === currentIndex ? 'window-image-active' : ''}`}
                  onClick={() => handlePostClick(post._id)}
                  style={{
                    pointerEvents: window.innerWidth <= 768 && index !== currentIndex ? 'none' : 'auto',
                    zIndex: window.innerWidth <= 768 && index === currentIndex ? 10 : index === 0 ? 1 : 0
                  }}
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
          {posts.length > 1 && (
            <div className="window-navigation">
              <button 
                className="window-nav-button window-nav-prev"
                onClick={handlePrevious}
                aria-label="이전 이미지"
              >
                ‹
              </button>
              <span className="window-nav-indicator">
                {currentIndex + 1} / {posts.length}
              </span>
              <button 
                className="window-nav-button window-nav-next"
                onClick={handleNext}
                aria-label="다음 이미지"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default ChangilWindow
