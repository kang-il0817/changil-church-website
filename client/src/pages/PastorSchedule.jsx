import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './PastorSchedule.css'

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
const DAYS_OF_WEEK_KR = ['일', '월', '화', '수', '목', '금', '토']

function PastorSchedule() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSchedule, setSelectedSchedule] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    fetchSchedules()
  }, [year, month])

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`/api/pastor-schedules?year=${year}&month=${month + 1}`)
      if (!response.ok) {
        console.error('목회일정 로드 실패:', response.status, response.statusText)
        setSchedules([])
        return
      }
      const data = await response.json()
      setSchedules(data || [])
    } catch (error) {
      console.error('목회일정을 불러오는 중 오류:', error)
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  // 캘린더 그리드 생성
  const generateCalendar = () => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay()) // 첫 주의 일요일로

    const calendar = []
    const current = new Date(startDate)

    // 6주치 생성 (최대 42일)
    for (let week = 0; week < 6; week++) {
      const weekDays = []
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
      calendar.push(weekDays)
    }

    return calendar
  }

  // 특정 날짜의 일정 가져오기
  const getSchedulesForDate = (date) => {
    return schedules.filter(schedule => {
      const start = new Date(schedule.startDate)
      const end = schedule.endDate ? new Date(schedule.endDate) : new Date(schedule.startDate)
      
      const dateStr = date.toDateString()
      const startStr = start.toDateString()
      const endStr = end.toDateString()
      
      return date >= new Date(start.setHours(0, 0, 0, 0)) && 
             date <= new Date(end.setHours(23, 59, 59, 999))
    })
  }

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const calendar = generateCalendar()

  if (loading) {
    return (
      <div className="pastor-schedule-page">
        <Header />
        <div className="pastor-schedule-container">
          <div className="loading">로딩 중...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="pastor-schedule-page">
      <Header />
      <div className="pastor-schedule-container">
        <div className="pastor-schedule-header">
          <h1 className="pastor-schedule-title">{year}년 {month + 1}월 목회일정</h1>
        </div>

        <div className="calendar-wrapper">
          <div className="calendar-grid">
            {/* 요일 헤더 */}
            <div className="calendar-header">
              {DAYS_OF_WEEK.map((day, index) => {
                const shortDayMap = {
                  'SUNDAY': 'Sun',
                  'MONDAY': 'Mon',
                  'TUESDAY': 'Tue',
                  'WEDNESDAY': 'Wed',
                  'THURSDAY': 'Thu',
                  'FRIDAY': 'Fri',
                  'SATURDAY': 'Sat'
                }
                const shortDay = shortDayMap[day] || day.charAt(0)
                return (
                  <div 
                    key={day} 
                    className={`calendar-day-header ${day === 'SUNDAY' ? 'sunday' : ''}`}
                    data-full={day}
                    data-short={shortDay}
                  >
                    <span className="day-full">{day}</span>
                    <span className="day-short">{shortDay}</span>
                  </div>
                )
              })}
            </div>

            {/* 캘린더 날짜들 */}
            {calendar.map((week, weekIndex) => (
              <div key={weekIndex} className="calendar-week">
                {week.map((date, dayIndex) => {
                  const isCurrentMonth = date.getMonth() === month
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isSunday = date.getDay() === 0
                  const daySchedules = getSchedulesForDate(date)
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSunday ? 'sunday' : ''}`}
                    >
                      <div className={`calendar-day-number ${isSunday ? 'sunday' : ''}`}>{date.getDate()}</div>
                      <div className="calendar-day-schedules">
                        {daySchedules.map((schedule, idx) => {
                          const start = new Date(schedule.startDate)
                          const end = schedule.endDate ? new Date(schedule.endDate) : new Date(schedule.startDate)
                          const isStart = date.toDateString() === start.toDateString()
                          const isEnd = date.toDateString() === end.toDateString()
                          const isMiddle = !isStart && !isEnd && date > start && date < end
                          
                          return (
                            <div
                              key={schedule._id || idx}
                              className={`schedule-item ${isStart ? 'schedule-start' : ''} ${isEnd ? 'schedule-end' : ''} ${isMiddle ? 'schedule-middle' : ''}`}
                              style={{ backgroundColor: schedule.color || '#ff6b35' }}
                              onClick={() => setSelectedSchedule(schedule)}
                              title={schedule.title}
                            >
                              {isEnd && schedule.title}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="pastor-schedule-controls">
          <button onClick={goToPreviousMonth} className="month-nav-button">‹</button>
          <button onClick={goToToday} className="today-button">오늘</button>
          <button onClick={goToNextMonth} className="month-nav-button">›</button>
        </div>

        {/* 일정 상세 모달 */}
        {selectedSchedule && (
          <div className="schedule-modal-overlay" onClick={() => setSelectedSchedule(null)}>
            <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
              <button className="schedule-modal-close" onClick={() => setSelectedSchedule(null)}>×</button>
              <h2 className="schedule-modal-title">{selectedSchedule.title}</h2>
              <div className="schedule-modal-date">
                {selectedSchedule.endDate ? (
                  <>
                    {new Date(selectedSchedule.startDate).toLocaleDateString('ko-KR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'long'
                    })} - {new Date(selectedSchedule.endDate).toLocaleDateString('ko-KR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </>
                ) : (
                  new Date(selectedSchedule.startDate).toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })
                )}
              </div>
              {selectedSchedule.description && (
                <div className="schedule-modal-description">{selectedSchedule.description}</div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default PastorSchedule

