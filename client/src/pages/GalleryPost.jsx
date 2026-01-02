import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './GalleryPost.css'

function GalleryPost({ id }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null) // 모달에서 선택된 이미지
  const [isModalOpen, setIsModalOpen] = useState(false) // 모달 열림 상태
  
  // URL에서 id 추출
  useEffect(() => {
    const pathMatch = window.location.pathname.match(/^\/gallery\/(.+)$/)
    if (pathMatch && !id) {
      fetchPost(pathMatch[1])
    } else if (id) {
      fetchPost(id)
    }
  }, [id])

  const fetchPost = async (postId) => {
    try {
      const response = await fetch(`/api/gallery-posts/${postId}`)
      if (!response.ok) {
        console.error('갤러리 포스트 로드 실패:', response.status, response.statusText)
        setPost(null)
        return
      }
      const data = await response.json()
      setPost(data)
    } catch (error) {
      console.error('갤러리 포스트를 불러오는 중 오류:', error)
      setPost(null)
    } finally {
      setLoading(false)
    }
  }

  const navigateToGallery = () => {
    if (window.navigate) {
      window.navigate('/gallery')
    } else {
      window.location.href = '/gallery'
    }
  }

  // 이미지 클릭 핸들러 (모달 열기)
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden' // 모달 열릴 때 body 스크롤 방지
  }

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
    document.body.style.overflow = 'unset' // 모달 닫힐 때 body 스크롤 복원
  }

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isModalOpen])

  if (loading) {
    return (
      <div className="gallery-post-page">
        <Header />
        <div className="gallery-post-container">
          <div className="loading">로딩 중...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="gallery-post-page">
        <Header />
        <div className="gallery-post-container">
          <div className="gallery-post-not-found">
            <p>포스트를 찾을 수 없습니다.</p>
            <button onClick={navigateToGallery} className="back-button">
              목록으로 돌아가기
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="gallery-post-page">
      <Header />
      <div className="gallery-post-container">
        <button onClick={navigateToGallery} className="back-button">
          ← 목록으로
        </button>
        
        <article className="gallery-post-article">
          <header className="gallery-post-header">
            <h1 className="gallery-post-title">{post.title}</h1>
            {post.date && (
              <p className="gallery-post-date">
                {new Date(post.date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </header>


          <div className="gallery-post-content">
            {post.sections && post.sections.length > 0 ? (
              post.sections.map((section, index) => (
                <div key={index} className="gallery-post-section">
                  {section.type === 'text' ? (
                    <div className="gallery-post-text-section">
                      <p className="gallery-post-text">{section.content}</p>
                    </div>
                  ) : (
                    <div 
                      className={`gallery-post-image-grid ${section.gridType || '4-grid'}`}
                      style={{ 
                        display: 'grid',
                        gridTemplateColumns: section.gridType === '6-grid' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                        gap: '1rem',
                        maxWidth: '600px',
                        margin: '0 auto',
                        width: '100%'
                      }}
                    >
                      {section.images && section.images.length > 0 ? (
                        section.images.map((imageUrl, imgIndex) => (
                          <div 
                            key={imgIndex} 
                            className="gallery-post-image-item"
                            onClick={() => handleImageClick(imageUrl)}
                          >
                            <img 
                              src={imageUrl} 
                              alt={`${post.title} - 이미지 ${imgIndex + 1}`}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
                              }}
                            />
                          </div>
                        ))
                      ) : (
                        <p className="gallery-post-empty-images">이미지가 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="gallery-post-empty">콘텐츠가 없습니다.</p>
            )}
          </div>
        </article>
      </div>
      <Footer />

      {/* 이미지 확대 모달 */}
      {isModalOpen && selectedImage && (
        <div className="gallery-image-modal-overlay" onClick={closeModal}>
          <div className="gallery-image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="gallery-image-modal-close" 
              onClick={closeModal}
              aria-label="닫기"
            >
              ×
            </button>
            <img 
              src={selectedImage} 
              alt="확대된 이미지"
              className="gallery-image-modal-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600?text=No+Image'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryPost

