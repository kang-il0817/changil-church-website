import { useState, useEffect, useRef } from 'react'
import './EventSection.css'

function EventSection() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const sectionRef = useRef(null)

  useEffect(() => {
    fetchEvents()
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

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayEvents.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayEvents.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      <section className="event-section" ref={sectionRef}>
        <div className="event-container">
          <div className={`section-header ${isVisible ? 'fade-in-up' : ''}`}>
            <h2 className="event-section-title">
              <span className="title-bold">사역</span>
              <span className="title-light"> | 행사</span>
            </h2>
            <p className="section-description">함께하면 더욱 행복합니다</p>
          </div>
          <div className="event-posters-wrapper">
            <div className="event-posters">
              {displayEvents.map((event, index) => (
                <div 
                  key={event._id || index} 
                  className={`event-poster-item ${index === 0 ? 'event-poster-first' : 'event-poster-other'} ${index === currentIndex ? 'event-poster-active' : ''}`}
                  onClick={() => openModal(event)}
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
            {displayEvents.length > 1 && (
              <div className="event-navigation">
                <button 
                  className="event-nav-button event-nav-prev"
                  onClick={handlePrevious}
                  aria-label="이전 포스터"
                >
                  ‹
                </button>
                <span className="event-nav-indicator">
                  {currentIndex + 1} / {displayEvents.length}
                </span>
                <button 
                  className="event-nav-button event-nav-next"
                  onClick={handleNext}
                  aria-label="다음 포스터"
                >
                  ›
                </button>
              </div>
            )}
          </div>
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

