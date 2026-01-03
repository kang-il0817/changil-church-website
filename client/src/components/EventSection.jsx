import { useState, useEffect } from 'react'
import './EventSection.css'

function EventSection() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

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

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(data || [])
    } catch (error) {
      console.error('행사 포스터를 불러오는 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
    document.body.style.overflow = 'unset'
  }

  // 행사 목록 페이지로 이동
  const handleViewAllClick = () => {
    if (window.navigate) {
      window.navigate('/events')
    } else {
      window.location.href = '/events'
    }
  }

  if (loading) {
    return (
      <section className="event-section">
        <div className="event-container">
          <div className="loading">로딩 중...</div>
        </div>
      </section>
    )
  }

  if (events.length === 0) {
    return null // 행사가 없으면 섹션을 표시하지 않음
  }

  // 최대 4개만 표시
  const displayEvents = events.slice(0, 4)

  return (
    <>
      <section className="event-section" data-aos="fade-up">
        <div className="event-container">
          <div className="section-header" data-aos="fade-up" data-aos-delay="100">
            <h2 className="event-section-title">
              <span className="title-bold">사역</span>
              <span className="title-light"> | 행사</span>
            </h2>
            <p className="section-description">함께하면 더욱 행복합니다</p>
          </div>
          <div className="event-posters-wrapper" data-aos="fade-down" data-aos-delay="200">
            <div className="event-posters">
              {displayEvents.map((event, index) => (
                <div 
                  key={event._id || index} 
                  className={`event-poster-item ${index === 0 ? 'event-poster-first' : 'event-poster-other'}`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openModal(event)
                  }}
                >
                  <img 
                    src={event.imageUrl} 
                    alt={event.title || `행사 포스터 ${index + 1}`}
                    className="event-poster-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x600?text=No+Image'
                    }}
                  />
                  {event.title && (
                    <div className="event-poster-title">{event.title}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {displayEvents.length > 0 && (
            <div className="event-view-all">
              <button 
                className="event-view-all-button"
                onClick={handleViewAllClick}
              >
                목록보기
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 행사 상세 모달 */}
      {isModalOpen && selectedEvent && (
        <div className="event-modal-overlay" onClick={closeModal}>
          <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="event-modal-close" onClick={closeModal} aria-label="닫기">
              ×
            </button>
            
            <div className="event-modal-body">
              <div className="event-modal-image-container">
                <img 
                  src={selectedEvent.imageUrl} 
                  alt={selectedEvent.title || '행사 포스터'}
                  className="event-modal-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600?text=No+Image'
                  }}
                />
              </div>

              <div className="event-modal-info">
                {selectedEvent.title && (
                  <h3 className="event-modal-title">
                    {selectedEvent.title}
                  </h3>
                )}
                {selectedEvent.eventDate && (
                  <p className="event-modal-date">
                    {new Date(selectedEvent.eventDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
                {selectedEvent.description && (
                  <p className="event-modal-description">
                    {selectedEvent.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EventSection

