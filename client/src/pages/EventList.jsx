import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './EventList.css'

function EventList() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (!response.ok) {
        console.error('행사 로드 실패:', response.status, response.statusText)
        setEvents([])
        return
      }
      const data = await response.json()
      setEvents(data || [])
    } catch (error) {
      console.error('행사를 불러오는 중 오류:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (event) => {
    // 행사 상세 모달을 열거나 상세 페이지로 이동
    // 현재는 모달이 없으므로 이미지를 클릭하면 새 창에서 열기
    if (event.imageUrl) {
      window.open(event.imageUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="event-list-page">
        <Header />
        <div className="event-list-container">
          <div className="loading">로딩 중...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="event-list-page">
      <Header />
      <div className="event-list-container">
        <div className="event-list-header">
          <h1 className="event-list-title">사역 | 행사</h1>
          <p className="event-list-description">함께하면 더욱 행복합니다</p>
        </div>
        
        <div className="event-list-table-container">
          {events.length > 0 ? (
            <table className="event-list-table">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>날짜</th>
                  <th>제목</th>
                  <th>작성자</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr 
                    key={event._id || index}
                    onClick={() => handleEventClick(event)}
                    className="event-list-table-row"
                  >
                    <td className="event-list-table-number">{events.length - index}</td>
                    <td className="event-list-table-date">
                      {event.eventDate 
                        ? new Date(event.eventDate).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })
                        : '-'}
                    </td>
                    <td className="event-list-table-title">{event.title || '제목 없음'}</td>
                    <td className="event-list-table-author">관리자</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="event-list-empty">
              <p>등록된 행사가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default EventList

