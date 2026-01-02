import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Bulletin.css'

function Bulletin() {
  const [bulletins, setBulletins] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchBulletins()
  }, [])

  const fetchBulletins = async () => {
    try {
      const response = await fetch('/api/bulletins')
      const data = await response.json()
      setBulletins(data || [])
    } catch (error) {
      console.error('주보를 불러오는 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulletinClick = (bulletinId) => {
    if (window.navigate) {
      window.navigate(`/bulletin/${bulletinId}`)
    } else {
      window.location.href = `/bulletin/${bulletinId}`
    }
  }

  const handleImageClick = (e, imageUrl) => {
    // 모바일에서만 모달 열기
    if (window.innerWidth <= 768) {
      e.stopPropagation() // 상위 클릭 이벤트 방지
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

  const getLatestBulletin = () => {
    if (bulletins.length === 0) return null
    return bulletins[0] // 가장 최근 주보 (첫 번째 항목)
  }

  if (loading) {
    return (
      <div className="bulletin-page">
        <Header />
        <div className="bulletin-container">
          <div className="loading">로딩 중...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bulletin-page">
      <Header />
      <div className="bulletin-container">
        <h1 className="bulletin-title">주보</h1>
        
        {bulletins.length === 0 ? (
          <div className="bulletin-empty">
            <p>등록된 주보가 없습니다.</p>
          </div>
        ) : (
          <>
            {getLatestBulletin() && (
              <div className="bulletin-latest-container">
                <div 
                  className="bulletin-latest-images"
                  onClick={() => handleBulletinClick(getLatestBulletin()._id)}
                >
                  {getLatestBulletin().imageUrls && getLatestBulletin().imageUrls.length > 0 ? (
                    getLatestBulletin().imageUrls.map((fileUrl, index) => (
                      isPDF(fileUrl) ? (
                        <div key={index} className="bulletin-latest-pdf">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <p>PDF 파일</p>
                        </div>
                      ) : (
                        <img 
                          key={index}
                          src={fileUrl} 
                          alt={`${getLatestBulletin().title || '최근 주보'} ${index + 1}`}
                          className="bulletin-latest-image"
                          onClick={(e) => handleImageClick(e, fileUrl)}
                          style={{ cursor: window.innerWidth <= 768 ? 'pointer' : 'default' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x566?text=이미지를+불러올+수+없습니다'
                          }}
                        />
                      )
                    ))
                  ) : getLatestBulletin().imageUrl ? (
                    isPDF(getLatestBulletin().imageUrl) ? (
                      <div className="bulletin-latest-pdf">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p>PDF 파일</p>
                      </div>
                    ) : (
                      <img 
                        src={getLatestBulletin().imageUrl} 
                        alt={getLatestBulletin().title || '최근 주보'}
                        className="bulletin-latest-image"
                        onClick={(e) => handleImageClick(e, getLatestBulletin().imageUrl)}
                        style={{ cursor: window.innerWidth <= 768 ? 'pointer' : 'default' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x566?text=이미지를+불러올+수+없습니다'
                        }}
                      />
                    )
                  ) : null}
                </div>
              </div>
            )}
            <div className="bulletin-table-container">
            <table className="bulletin-table">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>제목</th>
                  <th>작성자</th>
                  <th>날짜</th>
                  <th>조회</th>
                </tr>
              </thead>
              <tbody>
                {bulletins.map((bulletin, index) => (
                  <tr 
                    key={bulletin._id}
                    onClick={() => handleBulletinClick(bulletin._id)}
                    className="bulletin-table-row"
                  >
                    <td>{bulletins.length - index}</td>
                    <td className="bulletin-table-title">
                      {bulletin.title || `${new Date(bulletin.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      }).replace(/\./g, '.')}.주보`}
                    </td>
                    <td>관리자</td>
                    <td>
                      {new Date(bulletin.date).toLocaleDateString('ko-KR', {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit'
                      }).replace(/\./g, '.')}
                    </td>
                    <td>{bulletin.views || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
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

export default Bulletin

