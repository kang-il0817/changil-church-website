import { useState, useEffect } from 'react'
import AdminMessage from './AdminMessage'

function SermonManagement({ onMessageChange }) {
  const [allSermons, setAllSermons] = useState([]) // 모든 설교
  const [formData, setFormData] = useState({
    title: '',
    type: '주일예배',
    youtubeUrl: '',
    date: '',
    customThumbnail: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [editingSermon, setEditingSermon] = useState(null) // 수정 중인 설교 ID
  const [isEditMode, setIsEditMode] = useState(false) // 수정 모드 여부
  const [currentPage, setCurrentPage] = useState(1) // 현재 페이지
  const itemsPerPage = 10 // 페이지당 항목 수

  useEffect(() => {
    fetchSermons()
  }, [])

  useEffect(() => {
    if (onMessageChange) {
      onMessageChange(message)
    }
  }, [message, onMessageChange])

  const fetchSermons = async () => {
    try {
      const response = await fetch('/api/sermons')
      if (!response.ok) {
        console.error('설교 로드 실패:', response.status, response.statusText)
        setAllSermons([])
        return
      }
      const data = await response.json()
      // 날짜순으로 정렬 (최신순)
      const sortedSermons = (data || []).sort((a, b) => {
        // 날짜가 있는 경우 우선 처리
        const dateA = a.date ? new Date(a.date) : (a.createdAt ? new Date(a.createdAt) : new Date(0))
        const dateB = b.date ? new Date(b.date) : (b.createdAt ? new Date(b.createdAt) : new Date(0))
        
        // 날짜가 유효한지 확인
        const isValidDateA = !isNaN(dateA.getTime())
        const isValidDateB = !isNaN(dateB.getTime())
        
        // 둘 다 유효한 날짜면 날짜 비교
        if (isValidDateA && isValidDateB) {
          return dateB - dateA
        }
        // A만 유효하면 A가 앞으로
        if (isValidDateA && !isValidDateB) {
          return -1
        }
        // B만 유효하면 B가 앞으로
        if (!isValidDateA && isValidDateB) {
          return 1
        }
        // 둘 다 유효하지 않으면 createdAt으로 비교
        const createdAtA = a.createdAt ? new Date(a.createdAt) : new Date(0)
        const createdAtB = b.createdAt ? new Date(b.createdAt) : new Date(0)
        return createdAtB - createdAtA
      })
      // 중복 제거: 같은 _id를 가진 항목 제거
      const uniqueSermons = sortedSermons.filter((sermon, index, self) => 
        index === self.findIndex(s => s._id === sermon._id)
      )
      setAllSermons(uniqueSermons)
    } catch (error) {
      console.error('설교 데이터를 불러오는 중 오류:', error)
      setAllSermons([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 중복 체크 (추가 모드일 때만)
    if (!isEditMode) {
      const youtubeId = formData.youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
      const duplicate = allSermons.find(sermon => {
        const existingYoutubeId = sermon.youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
        return existingYoutubeId === youtubeId
      })
      
      if (duplicate) {
        setMessage({ 
          type: 'error', 
          text: '이미 같은 YouTube URL의 설교가 등록되어 있습니다.' 
        })
        return
      }
    }
    
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      let response
      if (isEditMode && editingSermon) {
        // 수정 모드
        response = await fetch(`/api/sermons/${editingSermon}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      } else {
        // 추가 모드
        response = await fetch('/api/sermons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      }

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: isEditMode ? '설교가 성공적으로 수정되었습니다!' : '설교가 성공적으로 추가되었습니다!' 
        })
        setFormData({
          title: '',
          type: '주일예배',
          youtubeUrl: '',
          date: '',
          customThumbnail: '',
          description: '',
        })
        setIsEditMode(false)
        setEditingSermon(null)
        setCurrentPage(1) // 첫 페이지로 리셋
        await fetchSermons() // 목록 새로고침
      } else {
        setMessage({ type: 'error', text: data.message || '오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (sermon) => {
    // 날짜를 YYYY-MM-DD 형식으로 변환
    const dateStr = sermon.date 
      ? new Date(sermon.date).toISOString().split('T')[0]
      : ''
    
    setFormData({
      title: sermon.title || '',
      type: sermon.type || '주일예배',
      youtubeUrl: sermon.youtubeUrl || '',
      date: dateStr,
      customThumbnail: sermon.customThumbnail || '',
      description: sermon.description || '',
    })
    setEditingSermon(sermon._id)
    setIsEditMode(true)
    // 폼 섹션으로 스크롤
    document.querySelector('.admin-form-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setFormData({
      title: '',
      type: '주일예배',
      youtubeUrl: '',
      date: '',
      customThumbnail: '',
      description: '',
    })
    setIsEditMode(false)
    setEditingSermon(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('정말 이 설교를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/sermons/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '설교가 삭제되었습니다.' })
        setCurrentPage(1) // 첫 페이지로 리셋
        await fetchSermons() // 목록 새로고침
      } else {
        setMessage({ type: 'error', text: '삭제 중 오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    }
  }

  return (
    <div className="admin-content">
      <div className="admin-form-section">
        <h2>{isEditMode ? '설교 수정' : '새 설교 추가'}</h2>
        {isEditMode && (
          <button 
            type="button" 
            onClick={handleCancelEdit}
            className="cancel-edit-button"
          >
            수정 취소
          </button>
        )}
        <form onSubmit={handleSubmit} className="sermon-form">
          <div className="form-group">
            <label htmlFor="type">예배타입 *</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="주일예배">주일예배</option>
              <option value="새벽기도">새벽기도</option>
              <option value="특별예배">특별예배</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="youtubeUrl">URL 주소 *</label>
            <input
              type="url"
              id="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
              required
            />
            <small>YouTube 영상 URL을 입력하세요</small>
          </div>

          <div className="form-group">
            <label htmlFor="date">날짜 *</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <small>달력에서 날짜를 선택하세요</small>
          </div>

          <div className="form-group">
            <label htmlFor="title">성경 본문 및 제목 *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: 2025년 1월 첫 주일 설교"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">설교자 *</label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="설교자 이름을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customThumbnail">커스텀 썸네일 이미지 (선택사항)</label>
            <input
              type="text"
              id="customThumbnail"
              value={formData.customThumbnail}
              onChange={(e) => setFormData({ ...formData, customThumbnail: e.target.value })}
              placeholder="/sermon-thumbnails/sunday1.jpg"
            />
            <small>
              직접 디자인한 썸네일 이미지 경로를 입력하세요.<br />
              예: /sermon-thumbnails/sunday1.jpg<br />
              이미지는 client/public/sermon-thumbnails/ 폴더에 저장하세요.
            </small>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? '저장 중...' : isEditMode ? '설교 수정' : '설교 추가'}
          </button>
        </form>
      </div>

      <div className="admin-list-section">
        <h2>현재 등록된 설교 ({allSermons.length}개)</h2>
        {allSermons.length === 0 ? (
          <div className="sermon-empty">
            <p>등록된 설교가 없습니다</p>
          </div>
        ) : (
          <>
            <div className="sermon-list">
              {allSermons
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((sermon) => (
                  <div key={sermon._id} className="sermon-item">
                    <div 
                      className={`sermon-item-list ${editingSermon === sermon._id ? 'editing' : ''}`}
                      onClick={() => handleEdit(sermon)}
                    >
                      <div className="sermon-item-simple">
                        <div className="sermon-item-type">{sermon.type}</div>
                        <div className="sermon-item-date">
                          {sermon.date 
                            ? new Date(sermon.date).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : '날짜 없음'}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(sermon._id)
                          }}
                          className="delete-button"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            {/* 페이지네이션 */}
            {allSermons.length > itemsPerPage && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  이전
                </button>
                <div className="pagination-info">
                  {currentPage} / {Math.ceil(allSermons.length / itemsPerPage)}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(allSermons.length / itemsPerPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(allSermons.length / itemsPerPage)}
                  className="pagination-button"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SermonManagement

