import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './BulletinDetail.css'

function BulletinDetail({ id }) {
  const [bulletin, setBulletin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // URL에서 ID 추출
    const pathParts = window.location.pathname.split('/')
    const bulletinId = id || pathParts[pathParts.length - 1]
    
    if (bulletinId && bulletinId !== 'bulletin') {
      fetchBulletin(bulletinId)
    } else {
      setLoading(false)
    }
  }, [id])

  const fetchBulletin = async (bulletinId) => {
    try {
      const response = await fetch(`/api/bulletins/${bulletinId}`)
      if (response.ok) {
        const data = await response.json()
        setBulletin(data)
        // 조회수 증가
        await fetch(`/api/bulletins/${bulletinId}/view`, { method: 'POST' })
      }
    } catch (error) {
      console.error('주보를 불러오는 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    if (window.navigate) {
      window.navigate('/bulletin')
    } else {
      window.location.href = '/bulletin'
    }
  }

  const handleImageClick = (e, imageUrl) => {
    // 모바일에서만 모달 열기
    if (window.innerWidth <= 768) {
      e.stopPropagation()
      setSelectedImage(imageUrl)
      setIsModalOpen(true)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  const isPDF = (url) => {
    if (!url) return false
    return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf?')
  }

  if (loading) {
    return (
      <div className="bulletin-detail-page">
        <Header />
        <div className="bulletin-detail-container">
          <div className="loading">로딩 중...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!bulletin) {
    return (
      <div className="bulletin-detail-page">
        <Header />
        <div className="bulletin-detail-container">
          <div className="bulletin-empty">
            <p>주보를 찾을 수 없습니다.</p>
            <button onClick={goBack} className="back-button">
              목록으로 돌아가기
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bulletin-detail-page">
      <Header />
      <div className="bulletin-detail-container">
        <button onClick={goBack} className="back-button">
          ← 목록으로
        </button>
        
        <div className="bulletin-detail-header">
          <h1 className="bulletin-detail-title">
            {bulletin.title || '주보'}
          </h1>
          <div className="bulletin-detail-meta">
            <span className="bulletin-meta-item">
              작성자: 관리자
            </span>
            <span className="bulletin-meta-item">
              날짜: {new Date(bulletin.date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </span>
            <span className="bulletin-meta-item">
              조회: {bulletin.views || 0}
            </span>
          </div>
        </div>

        <div className="bulletin-image-container">
          {bulletin.imageUrls && bulletin.imageUrls.length > 0 ? (
            bulletin.imageUrls.map((fileUrl, index) => (
              isPDF(fileUrl) ? (
                <a
                  key={index}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bulletin-file-link"
                  style={{ 
                    marginBottom: index < bulletin.imageUrls.length - 1 ? '2rem' : '0' 
                  }}
                >
                  <div className="bulletin-pdf-preview">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>PDF 파일 보기</p>
                  </div>
                </a>
              ) : (
                <img
                  key={index}
                  src={fileUrl}
                  alt={`${bulletin.title || '주보'} ${index + 1}`}
                  className="bulletin-image"
                  onClick={(e) => handleImageClick(e, fileUrl)}
                  style={{ 
                    marginBottom: index < bulletin.imageUrls.length - 1 ? '2rem' : '0',
                    cursor: window.innerWidth <= 768 ? 'pointer' : 'default'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x1131?text=이미지를+불러올+수+없습니다'
                  }}
                />
              )
            ))
          ) : (
            isPDF(bulletin.imageUrl) ? (
              <a
                href={bulletin.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bulletin-file-link"
              >
                <div className="bulletin-pdf-preview">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>PDF 파일 보기</p>
                </div>
              </a>
            ) : (
              <img
                src={bulletin.imageUrl || 'https://via.placeholder.com/800x1131?text=이미지를+불러올+수+없습니다'}
                alt={bulletin.title || '주보'}
                className="bulletin-image"
                onClick={(e) => handleImageClick(e, bulletin.imageUrl)}
                style={{ cursor: window.innerWidth <= 768 ? 'pointer' : 'default' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x1131?text=이미지를+불러올+수+없습니다'
                }}
              />
            )
          )}
        </div>
      </div>

      {/* 이미지 모달 (모바일용) */}
      {isModalOpen && selectedImage && (
        <div className="bulletin-image-modal-overlay" onClick={closeModal}>
          <div className="bulletin-image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="bulletin-image-modal-close" onClick={closeModal}>×</button>
            <img 
              src={selectedImage} 
              alt="주보 이미지"
              className="bulletin-image-modal-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x566?text=이미지를+불러올+수+없습니다'
              }}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default BulletinDetail

