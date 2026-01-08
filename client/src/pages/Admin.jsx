import { useState, useEffect } from 'react'
import { supabase, GALLERY_BUCKET, BULLETIN_BUCKET } from '../lib/supabase'
import { useAuthCheck } from '../hooks/useAuthCheck'
import AdminHeader from '../components/admin/AdminHeader'
import AdminMessage from '../components/admin/AdminMessage'
import SermonManagement from '../components/admin/SermonManagement'
import { optimizeImage } from '../utils/imageOptimizer'
import './Admin.css'

// 이벤트 날짜 포맷팅 함수
const formatEventDate = (event) => {
  const getDayOfWeek = (date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return days[date.getDay()]
  }

  if (event.startDate && event.endDate) {
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    const startDay = getDayOfWeek(start)
    const endDay = getDayOfWeek(end)
    
    // 같은 년도와 월인 경우
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일(${startDay})부터 ${end.getDate()}일(${endDay})까지`
    } else {
      // 다른 월인 경우
      return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일(${startDay})부터 ${end.getFullYear()}년 ${end.getMonth() + 1}월 ${end.getDate()}일(${endDay})까지`
    }
  } else if (event.startDate) {
    const start = new Date(event.startDate)
    const startDay = getDayOfWeek(start)
    return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일(${startDay})`
  } else if (event.eventDate) {
    const date = new Date(event.eventDate)
    const day = getDayOfWeek(date)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일(${day})`
  }
  return '날짜 없음'
}

function Admin() {
  useAuthCheck()
  const [events, setEvents] = useState([])
  const [eventFormData, setEventFormData] = useState({
    imageUrl: '',
    title: '',
    description: '',
    eventDate: '',
    startDate: '',
    endDate: '',
    order: 0,
  })
  const [eventUploading, setEventUploading] = useState(false)
  const [eventUploadProgress, setEventUploadProgress] = useState({})
  const [eventSelectedFiles, setEventSelectedFiles] = useState([])
  const [eventPreviewUrls, setEventPreviewUrls] = useState([])
  const [editingEvent, setEditingEvent] = useState(null) // 수정 중인 행사 ID
  const [isEventEditMode, setIsEventEditMode] = useState(false) // 행사 수정 모드 여부
  const [eventCurrentPage, setEventCurrentPage] = useState(1) // 행사 포스터 현재 페이지
  const eventItemsPerPage = 10 // 행사 포스터 페이지당 항목 수
  const [eventLoading, setEventLoading] = useState(false)
  const [bulletins, setBulletins] = useState([])
  const [bulletinFormData, setBulletinFormData] = useState({
    title: '',
    date: '',
    order: 0,
    imageUrls: ['', ''], // 이미지 URL 2개
  })
  const [bulletinUploading, setBulletinUploading] = useState(false)
  const [bulletinSelectedFiles, setBulletinSelectedFiles] = useState([null, null]) // 이미지 파일 2개
  const [bulletinPreviewUrls, setBulletinPreviewUrls] = useState([null, null]) // 미리보기 2개
  const [bulletinLoading, setBulletinLoading] = useState(false)
  const [editingBulletin, setEditingBulletin] = useState(null) // 수정 중인 주보 ID
  const [isBulletinEditMode, setIsBulletinEditMode] = useState(false) // 주보 수정 모드 여부
  const [message, setMessage] = useState({ type: '', text: '' })
  const [activeTab, setActiveTab] = useState('sermon') // 기본: 설교 관리
  
  // 갤러리 포스트 관련 state
  const [galleryPosts, setGalleryPosts] = useState([])
  const [galleryPostFormData, setGalleryPostFormData] = useState({
    title: '',
    date: '',
    thumbnail: '',
    sections: [],
    order: 0,
  })
  const [galleryPostLoading, setGalleryPostLoading] = useState(false)
  const [galleryPostUploading, setGalleryPostUploading] = useState(false)
  const [galleryPostThumbnailFile, setGalleryPostThumbnailFile] = useState(null)
  const [galleryPostThumbnailPreview, setGalleryPostThumbnailPreview] = useState(null)
  const [editingGalleryPost, setEditingGalleryPost] = useState(null)
  const [isGalleryPostEditMode, setIsGalleryPostEditMode] = useState(false)
  
  // 팝업 관련 state
  const [popups, setPopups] = useState([])
  const [popupFormData, setPopupFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    linkText: '자세히 보기',
    isActive: true,
    startDate: '',
    endDate: '',
    order: 0,
  })
  const [popupLoading, setPopupLoading] = useState(false)
  const [popupUploading, setPopupUploading] = useState(false)
  const [popupImageFile, setPopupImageFile] = useState(null)
  const [popupImagePreview, setPopupImagePreview] = useState(null)
  const [editingPopup, setEditingPopup] = useState(null)
  const [isPopupEditMode, setIsPopupEditMode] = useState(false)
  
  // 연말정산 신청 관련 state
  const [donationReceipts, setDonationReceipts] = useState([])
  const [donationReceiptLoading, setDonationReceiptLoading] = useState(false)
  
  // 목회일정 관련 state
  const [pastorSchedules, setPastorSchedules] = useState([])
  const [pastorScheduleFormData, setPastorScheduleFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    color: '#718096',
    order: 0,
  })
  const [pastorScheduleLoading, setPastorScheduleLoading] = useState(false)
  const [editingPastorSchedule, setEditingPastorSchedule] = useState(null)
  const [isPastorScheduleEditMode, setIsPastorScheduleEditMode] = useState(false)

  useEffect(() => {
    fetchEvents()
    fetchBulletins()
    fetchGalleryPosts()
    fetchPopups()
    fetchDonationReceipts()
    fetchPastorSchedules()
  }, [])

  // 행사 포스터 관련 함수들
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (!response.ok) {
        console.error('행사 포스터 로드 실패:', response.status, response.statusText)
        setEvents([])
        return
      }
      const data = await response.json()
      setEvents(data || [])
    } catch (error) {
      console.error('행사 포스터를 불러오는 중 오류:', error)
      setEvents([])
    }
  }

  const handleEventFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const validFiles = []
    const invalidFiles = []

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name}: 이미지 파일만 업로드할 수 있습니다.`)
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push(`${file.name}: 파일 크기는 10MB 이하여야 합니다.`)
        return
      }

      validFiles.push(file)
    })

    if (invalidFiles.length > 0) {
      setMessage({ 
        type: 'error', 
        text: invalidFiles.join('\n') 
      })
    }

    if (validFiles.length === 0) return

    setEventSelectedFiles(validFiles)
    
    const previewPromises = validFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve({
            file: file,
            url: reader.result,
            name: file.name
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(previewPromises).then((previews) => {
      setEventPreviewUrls(previews)
    })
  }

  const handleEventSubmit = async (e) => {
    e.preventDefault()
    setEventLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // 수정 모드인 경우 단일 이미지 처리
      if (isEventEditMode && editingEvent) {
        let imageUrl = eventFormData.imageUrl

        // 새 파일이 선택된 경우 업로드
        if (eventSelectedFiles.length > 0) {
          setEventUploading(true)
          try {
            imageUrl = await uploadImageToSupabase(eventSelectedFiles[0])
          } catch (uploadError) {
            setMessage({ type: 'error', text: `이미지 업로드 실패: ${uploadError.message}` })
            setEventLoading(false)
            setEventUploading(false)
            return
          }
          setEventUploading(false)
        }

        if (!imageUrl) {
          setMessage({ type: 'error', text: '이미지 URL을 입력하거나 파일을 업로드해주세요.' })
          setEventLoading(false)
          return
        }

        const response = await fetch(`/api/events/${editingEvent}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...eventFormData,
            imageUrl: imageUrl,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setMessage({ type: 'success', text: '행사 포스터가 성공적으로 수정되었습니다!' })
          setEventFormData({
            imageUrl: '',
            title: '',
            description: '',
            eventDate: '',
            order: 0,
          })
          setEventSelectedFiles([])
          setEventPreviewUrls([])
          setIsEventEditMode(false)
          setEditingEvent(null)
          fetchEvents()
        } else {
          setMessage({ type: 'error', text: data.message || '오류가 발생했습니다.' })
        }
        setEventLoading(false)
        return
      }

      // 추가 모드: 여러 파일 처리
      if (eventSelectedFiles.length > 0) {
        setEventUploading(true)
        setEventUploadProgress({})
        
        const uploadedUrls = []
        const errors = []

        for (let i = 0; i < eventSelectedFiles.length; i++) {
          const file = eventSelectedFiles[i]
          const fileName = file.name

          try {
            setEventUploadProgress(prev => ({
              ...prev,
              [fileName]: { current: i + 1, total: eventSelectedFiles.length, percent: Math.round(((i + 1) / eventSelectedFiles.length) * 100) }
            }))

            const imageUrl = await uploadImageToSupabase(file)
            uploadedUrls.push({
              imageUrl: imageUrl,
              title: eventFormData.title || '',
              description: eventFormData.description || '',
              eventDate: eventFormData.eventDate || null,
              startDate: eventFormData.startDate || null,
              endDate: eventFormData.endDate || null,
              order: eventFormData.order + i,
            })
          } catch (uploadError) {
            errors.push(`${fileName}: ${uploadError.message}`)
          }
        }

        setEventUploadProgress(prev => {
          const newProgress = { ...prev }
          eventSelectedFiles.forEach(file => {
            newProgress[file.name] = { ...newProgress[file.name], percent: 100 }
          })
          return newProgress
        })

        if (errors.length > 0 && uploadedUrls.length === 0) {
          setMessage({ type: 'error', text: errors.join('\n') })
          setEventUploading(false)
          setEventLoading(false)
          return
        }

        const savePromises = uploadedUrls.map((eventData) =>
          fetch('/api/events', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
          })
        )

        const saveResults = await Promise.all(savePromises)
        const failedSaves = []

        saveResults.forEach((response, index) => {
          if (!response.ok) {
            failedSaves.push(uploadedUrls[index].title || '행사 포스터')
          }
        })

        if (errors.length > 0 || failedSaves.length > 0) {
          const errorMessages = [
            ...errors,
            ...failedSaves.map(name => `${name}: 저장 실패`)
          ]
          setMessage({ 
            type: 'warning', 
            text: `${uploadedUrls.length - failedSaves.length}개 업로드 성공, ${errors.length + failedSaves.length}개 실패:\n${errorMessages.join('\n')}` 
          })
        } else {
          setMessage({ 
            type: 'success', 
            text: `${uploadedUrls.length}개의 행사 포스터가 성공적으로 추가되었습니다!` 
          })
        }

        setEventFormData({
          imageUrl: '',
          title: '',
          description: '',
          eventDate: '',
          startDate: '',
          endDate: '',
          order: 0,
        })
        setEventSelectedFiles([])
        setEventPreviewUrls([])
        setEventUploadProgress({})
        fetchEvents()
        setEventUploading(false)
        setEventLoading(false)
        return
      }

      const imageUrl = eventFormData.imageUrl
      if (!imageUrl) {
        setMessage({ type: 'error', text: '이미지 URL을 입력하거나 파일을 업로드해주세요.' })
        setEventLoading(false)
        return
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventFormData,
          imageUrl: imageUrl,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: '행사 포스터가 성공적으로 추가되었습니다!' })
        setEventFormData({
          imageUrl: '',
          title: '',
          description: '',
          eventDate: '',
          startDate: '',
          endDate: '',
          order: 0,
        })
        fetchEvents()
      } else {
        setMessage({ type: 'error', text: data.message || '오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    } finally {
      setEventLoading(false)
      setEventUploading(false)
    }
  }

  const handleEventEdit = (event) => {
    // 날짜를 YYYY-MM-DD 형식으로 변환
    const dateStr = event.eventDate 
      ? new Date(event.eventDate).toISOString().split('T')[0]
      : ''
    const startDateStr = event.startDate 
      ? new Date(event.startDate).toISOString().split('T')[0]
      : ''
    const endDateStr = event.endDate 
      ? new Date(event.endDate).toISOString().split('T')[0]
      : ''
    
    setEventFormData({
      imageUrl: event.imageUrl || '',
      title: event.title || '',
      description: event.description || '',
      eventDate: dateStr,
      startDate: startDateStr,
      endDate: endDateStr,
      order: event.order || 0,
    })
    setEditingEvent(event._id)
    setIsEventEditMode(true)
    // 폼 섹션으로 스크롤
    document.querySelector('.admin-form-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleEventCancelEdit = () => {
    setEventFormData({
      imageUrl: '',
      title: '',
      description: '',
      eventDate: '',
      order: 0,
    })
    setEventSelectedFiles([])
    setEventPreviewUrls([])
    setIsEventEditMode(false)
    setEditingEvent(null)
  }

  const handleEventDelete = async (id) => {
    if (!confirm('정말 이 행사 포스터를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '행사 포스터가 삭제되었습니다.' })
        fetchEvents()
      } else {
        setMessage({ type: 'error', text: '삭제 중 오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    }
  }

  // 주보 관련 함수들
  const fetchBulletins = async () => {
    try {
      const response = await fetch('/api/bulletins')
      if (!response.ok) {
        console.error('주보 로드 실패:', response.status, response.statusText)
        setBulletins([])
        return
      }
      const data = await response.json()
      setBulletins(data || [])
    } catch (error) {
      console.error('주보를 불러오는 중 오류:', error)
      setBulletins([])
    }
  }

  const handleBulletinFileSelect = (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    // 이미지 또는 PDF 파일만 허용
    const isImage = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf'
    
    if (!isImage && !isPDF) {
      setMessage({ type: 'error', text: '이미지 파일 또는 PDF 파일만 업로드할 수 있습니다.' })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: '파일 크기는 10MB 이하여야 합니다.' })
      return
    }

    const newFiles = [...bulletinSelectedFiles]
    newFiles[index] = file
    setBulletinSelectedFiles(newFiles)

    // PDF는 미리보기를 생성하지 않음 (이미지만 미리보기)
    if (isImage) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newPreviews = [...bulletinPreviewUrls]
        newPreviews[index] = reader.result
        setBulletinPreviewUrls(newPreviews)
      }
      reader.readAsDataURL(file)
    } else {
      // PDF인 경우 미리보기 URL을 null로 설정
      const newPreviews = [...bulletinPreviewUrls]
      newPreviews[index] = null
      setBulletinPreviewUrls(newPreviews)
    }
  }

  // 공통 이미지 업로드 함수 (이벤트, 갤러리, 팝업용)
  const uploadImageToSupabase = async (file, bucket = GALLERY_BUCKET, folder = 'gallery') => {
    if (!supabase) {
      throw new Error('Supabase가 설정되지 않았습니다.')
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Supabase 업로드 오류:', error)
      throw new Error(`이미지 업로드 실패: ${error.message}`)
    }
  }

  const uploadBulletinImageToSupabase = async (file) => {
    if (!supabase) {
      throw new Error('Supabase가 설정되지 않았습니다.')
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `bulletins/${fileName}`

      const { data, error } = await supabase.storage
        .from(BULLETIN_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(BULLETIN_BUCKET)
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Supabase 업로드 오류:', error)
      throw new Error(`이미지 업로드 실패: ${error.message}`)
    }
  }

  const handleBulletinSubmit = async (e) => {
    e.preventDefault()
    setBulletinLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const imageUrls = []

      // 파일 업로드 처리
      if (bulletinSelectedFiles.some(file => file !== null)) {
        setBulletinUploading(true)
        
        for (let i = 0; i < bulletinSelectedFiles.length; i++) {
          const file = bulletinSelectedFiles[i]
          if (file) {
            try {
              const imageUrl = await uploadBulletinImageToSupabase(file)
              imageUrls.push(imageUrl)
            } catch (uploadError) {
              setMessage({ type: 'error', text: `파일 ${i + 1} 업로드 실패: ${uploadError.message}` })
              setBulletinLoading(false)
              setBulletinUploading(false)
              return
            }
          } else if (bulletinFormData.imageUrls[i] && bulletinFormData.imageUrls[i].trim() !== '') {
            // 파일이 없지만 URL이 입력된 경우
            imageUrls.push(bulletinFormData.imageUrls[i].trim())
          }
        }
        setBulletinUploading(false)
      } else {
        // 파일이 없고 URL만 입력된 경우
        bulletinFormData.imageUrls.forEach(url => {
          if (url && url.trim() !== '') {
            imageUrls.push(url.trim())
          }
        })
      }

      if (imageUrls.length === 0) {
        setMessage({ type: 'error', text: '최소 1개 이상의 파일을 업로드하거나 URL을 입력해주세요.' })
        setBulletinLoading(false)
        return
      }

      if (imageUrls.length > 2) {
        setMessage({ type: 'error', text: '파일은 최대 2개까지 업로드할 수 있습니다.' })
        setBulletinLoading(false)
        return
      }

      let response
      if (isBulletinEditMode && editingBulletin) {
        // 수정 모드
        response = await fetch(`/api/bulletins/${editingBulletin}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: bulletinFormData.title || '주보',
            imageUrls: imageUrls,
            date: bulletinFormData.date || new Date().toISOString(),
            order: bulletinFormData.order || 0,
          }),
        })
      } else {
        // 추가 모드
        response = await fetch('/api/bulletins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: bulletinFormData.title || '주보',
            imageUrls: imageUrls,
            date: bulletinFormData.date || new Date().toISOString(),
            order: bulletinFormData.order || 0,
          }),
        })
      }

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: isBulletinEditMode ? '주보가 성공적으로 수정되었습니다!' : '주보가 성공적으로 추가되었습니다!' 
        })
        setBulletinFormData({
          title: '',
          date: '',
          order: 0,
          imageUrls: ['', ''],
        })
        setBulletinSelectedFiles([null, null])
        setBulletinPreviewUrls([null, null])
        setIsBulletinEditMode(false)
        setEditingBulletin(null)
        fetchBulletins()
      } else {
        setMessage({ type: 'error', text: data.message || '오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    } finally {
      setBulletinLoading(false)
      setBulletinUploading(false)
    }
  }

  const handleBulletinEdit = (bulletin) => {
    // 날짜를 YYYY-MM-DD 형식으로 변환
    const dateStr = bulletin.date 
      ? new Date(bulletin.date).toISOString().split('T')[0]
      : ''
    
    setBulletinFormData({
      title: bulletin.title || '',
      date: dateStr,
      order: bulletin.order || 0,
      imageUrls: bulletin.imageUrls && bulletin.imageUrls.length > 0 
        ? [...bulletin.imageUrls, ''].slice(0, 2) // 최대 2개, 부족하면 빈 문자열로 채움
        : ['', ''],
    })
    setEditingBulletin(bulletin._id)
    setIsBulletinEditMode(true)
    // 폼 섹션으로 스크롤
    document.querySelector('.admin-form-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleBulletinCancelEdit = () => {
    setBulletinFormData({
      title: '',
      date: '',
      order: 0,
      imageUrls: ['', ''],
    })
    setBulletinSelectedFiles([null, null])
    setBulletinPreviewUrls([null, null])
    setIsBulletinEditMode(false)
    setEditingBulletin(null)
  }

  const handleBulletinDelete = async (id) => {
    if (!confirm('정말 이 주보를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/bulletins/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '주보가 삭제되었습니다.' })
        fetchBulletins()
      } else {
        setMessage({ type: 'error', text: '삭제 중 오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    }
  }

  // 갤러리 포스트 관련 함수들
  const fetchGalleryPosts = async () => {
    try {
      const response = await fetch('/api/gallery-posts')
      if (!response.ok) {
        console.error('갤러리 포스트 로드 실패:', response.status, response.statusText)
        setGalleryPosts([])
        return
      }
      const data = await response.json()
      setGalleryPosts(data || [])
    } catch (error) {
      console.error('갤러리 포스트를 불러오는 중 오류:', error)
      setGalleryPosts([])
    }
  }

  const handleGalleryPostThumbnailSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: '이미지 파일만 업로드할 수 있습니다.' })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: '파일 크기는 10MB 이하여야 합니다.' })
      return
    }

    // 이미지 최적화
    try {
      const optimizedFile = await optimizeImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
      })
      setGalleryPostThumbnailFile(optimizedFile)

      // 미리보기 생성
      const reader = new FileReader()
      reader.onloadend = () => {
        setGalleryPostThumbnailPreview(reader.result)
      }
      reader.readAsDataURL(optimizedFile)
    } catch (error) {
      console.error('이미지 최적화 실패:', error)
      setGalleryPostThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setGalleryPostThumbnailPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGalleryPostSubmit = async (e) => {
    e.preventDefault()
    setGalleryPostLoading(true)
    setMessage({ type: '', text: '' })

    try {
      let thumbnailUrl = galleryPostFormData.thumbnail

      // 썸네일 업로드
      if (galleryPostThumbnailFile) {
        setGalleryPostUploading(true)
        try {
          thumbnailUrl = await uploadImageToSupabase(galleryPostThumbnailFile)
        } catch (uploadError) {
          setMessage({ type: 'error', text: `썸네일 업로드 실패: ${uploadError.message}` })
          setGalleryPostLoading(false)
          setGalleryPostUploading(false)
          return
        }
        setGalleryPostUploading(false)
      }

      if (!thumbnailUrl) {
        setMessage({ type: 'error', text: '썸네일 이미지는 필수입니다.' })
        setGalleryPostLoading(false)
        return
      }

      if (!galleryPostFormData.title) {
        setMessage({ type: 'error', text: '제목은 필수입니다.' })
        setGalleryPostLoading(false)
        return
      }

      let response
      if (isGalleryPostEditMode && editingGalleryPost) {
        // 수정 모드
        response = await fetch(`/api/gallery-posts/${editingGalleryPost}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: galleryPostFormData.title,
            date: galleryPostFormData.date || new Date().toISOString(),
            thumbnail: thumbnailUrl,
            sections: galleryPostFormData.sections,
            order: galleryPostFormData.order || 0,
          }),
        })
      } else {
        // 추가 모드
        response = await fetch('/api/gallery-posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: galleryPostFormData.title,
            date: galleryPostFormData.date || new Date().toISOString(),
            thumbnail: thumbnailUrl,
            sections: galleryPostFormData.sections,
            order: galleryPostFormData.order || 0,
          }),
        })
      }

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: isGalleryPostEditMode ? '갤러리 포스트가 성공적으로 수정되었습니다!' : '갤러리 포스트가 성공적으로 추가되었습니다!' 
        })
        setGalleryPostFormData({
          title: '',
          date: '',
          thumbnail: '',
          sections: [],
          order: 0,
        })
        setGalleryPostThumbnailFile(null)
        setGalleryPostThumbnailPreview(null)
        setIsGalleryPostEditMode(false)
        setEditingGalleryPost(null)
        fetchGalleryPosts()
      } else {
        setMessage({ type: 'error', text: data.message || '오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    } finally {
      setGalleryPostLoading(false)
      setGalleryPostUploading(false)
    }
  }

  const handleGalleryPostEdit = (post) => {
    const dateStr = post.date 
      ? new Date(post.date).toISOString().split('T')[0]
      : ''
    
    setGalleryPostFormData({
      title: post.title || '',
      date: dateStr,
      thumbnail: post.thumbnail || '',
      sections: post.sections || [],
      order: post.order || 0,
    })
    setGalleryPostThumbnailPreview(post.thumbnail || null)
    setGalleryPostThumbnailFile(null)
    setEditingGalleryPost(post._id)
    setIsGalleryPostEditMode(true)
    document.querySelector('.admin-form-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGalleryPostCancelEdit = () => {
    setGalleryPostFormData({
      title: '',
      date: '',
      thumbnail: '',
      sections: [],
      order: 0,
    })
    setGalleryPostThumbnailFile(null)
    setGalleryPostThumbnailPreview(null)
    setIsGalleryPostEditMode(false)
    setEditingGalleryPost(null)
  }

  const handleGalleryPostDelete = async (id) => {
    if (!confirm('정말 이 갤러리 포스트를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/gallery-posts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '갤러리 포스트가 삭제되었습니다.' })
        fetchGalleryPosts()
      } else {
        setMessage({ type: 'error', text: '삭제 중 오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    }
  }

  // 섹션 관리 함수들
  const addSection = (type) => {
    const newSection = type === 'text' 
      ? { type: 'text', content: '' }
      : { type: 'image-grid', images: [], gridType: '4-grid' }
    
    setGalleryPostFormData({
      ...galleryPostFormData,
      sections: [...galleryPostFormData.sections, newSection]
    })
  }

  const removeSection = (index) => {
    const newSections = galleryPostFormData.sections.filter((_, i) => i !== index)
    setGalleryPostFormData({
      ...galleryPostFormData,
      sections: newSections
    })
  }

  const updateSection = (index, field, value) => {
    const newSections = [...galleryPostFormData.sections]
    newSections[index] = { ...newSections[index], [field]: value }
    setGalleryPostFormData({
      ...galleryPostFormData,
      sections: newSections
    })
  }

  const handleSectionImageUpload = async (sectionIndex, file) => {
    try {
      const optimizedFile = await optimizeImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
      })
      const imageUrl = await uploadImageToSupabase(optimizedFile)
      
      const newSections = [...galleryPostFormData.sections]
      if (!newSections[sectionIndex].images) {
        newSections[sectionIndex].images = []
      }
      newSections[sectionIndex].images.push(imageUrl)
      setGalleryPostFormData({
        ...galleryPostFormData,
        sections: newSections
      })
    } catch (error) {
      setMessage({ type: 'error', text: `이미지 업로드 실패: ${error.message}` })
    }
  }

  // 팝업 관련 함수들
  const fetchPopups = async () => {
    try {
      const response = await fetch('/api/popups')
      if (!response.ok) {
        console.error('팝업 로드 실패:', response.status, response.statusText)
        setPopups([])
        return
      }
      const data = await response.json()
      setPopups(data || [])
    } catch (error) {
      console.error('팝업을 불러오는 중 오류:', error)
      setPopups([])
    }
  }

  const handlePopupImageSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: '이미지 파일만 업로드할 수 있습니다.' })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: '파일 크기는 10MB 이하여야 합니다.' })
      return
    }

    try {
      const optimizedFile = await optimizeImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
      })
      setPopupImageFile(optimizedFile)

      const reader = new FileReader()
      reader.onloadend = () => {
        setPopupImagePreview(reader.result)
      }
      reader.readAsDataURL(optimizedFile)
    } catch (error) {
      console.error('이미지 최적화 실패:', error)
      setPopupImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPopupImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePopupSubmit = async (e) => {
    e.preventDefault()
    setPopupLoading(true)
    setMessage({ type: '', text: '' })

    try {
      let imageUrl = popupFormData.imageUrl

      if (popupImageFile) {
        setPopupUploading(true)
        try {
          imageUrl = await uploadImageToSupabase(popupImageFile)
        } catch (uploadError) {
          setMessage({ type: 'error', text: `이미지 업로드 실패: ${uploadError.message}` })
          setPopupLoading(false)
          setPopupUploading(false)
          return
        }
        setPopupUploading(false)
      }

      if (!popupFormData.title) {
        setMessage({ type: 'error', text: '제목은 필수입니다.' })
        setPopupLoading(false)
        return
      }

      let response
      if (isPopupEditMode && editingPopup) {
        response = await fetch(`/api/popups/${editingPopup}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...popupFormData,
            imageUrl: imageUrl || popupFormData.imageUrl,
            startDate: popupFormData.startDate || new Date().toISOString(),
            endDate: popupFormData.endDate || null,
          }),
        })
      } else {
        response = await fetch('/api/popups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...popupFormData,
            imageUrl: imageUrl || '',
            startDate: popupFormData.startDate || new Date().toISOString(),
            endDate: popupFormData.endDate || null,
          }),
        })
      }

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: isPopupEditMode ? '팝업이 성공적으로 수정되었습니다!' : '팝업이 성공적으로 추가되었습니다!' 
        })
        setPopupFormData({
          title: '',
          content: '',
          imageUrl: '',
          linkUrl: '',
          linkText: '자세히 보기',
          isActive: true,
          startDate: '',
          endDate: '',
          order: 0,
        })
        setPopupImageFile(null)
        setPopupImagePreview(null)
        setIsPopupEditMode(false)
        setEditingPopup(null)
        fetchPopups()
      } else {
        setMessage({ type: 'error', text: data.message || '오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    } finally {
      setPopupLoading(false)
      setPopupUploading(false)
    }
  }

  const handlePopupEdit = (popup) => {
    const startDateStr = popup.startDate 
      ? new Date(popup.startDate).toISOString().split('T')[0]
      : ''
    const endDateStr = popup.endDate 
      ? new Date(popup.endDate).toISOString().split('T')[0]
      : ''
    
    setPopupFormData({
      title: popup.title || '',
      content: popup.content || '',
      imageUrl: popup.imageUrl || '',
      linkUrl: popup.linkUrl || '',
      linkText: popup.linkText || '자세히 보기',
      isActive: popup.isActive !== undefined ? popup.isActive : true,
      startDate: startDateStr,
      endDate: endDateStr,
      order: popup.order || 0,
    })
    setPopupImagePreview(popup.imageUrl || null)
    setPopupImageFile(null)
    setEditingPopup(popup._id)
    setIsPopupEditMode(true)
    document.querySelector('.admin-form-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handlePopupCancelEdit = () => {
    setPopupFormData({
      title: '',
      content: '',
      imageUrl: '',
      linkUrl: '',
      linkText: '자세히 보기',
      isActive: true,
      startDate: '',
      endDate: '',
      order: 0,
    })
    setPopupImageFile(null)
    setPopupImagePreview(null)
    setIsPopupEditMode(false)
    setEditingPopup(null)
  }

  const handlePopupDelete = async (id) => {
    if (!confirm('정말 이 팝업을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/popups/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '팝업이 삭제되었습니다.' })
        fetchPopups()
      } else {
        setMessage({ type: 'error', text: '삭제 중 오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminLoginTime')
    if (window.navigate) {
      window.navigate('/login')
    } else {
      window.location.href = '/login'
    }
  }

  const handleHome = () => {
    if (window.navigate) {
      window.navigate('/')
    } else {
      window.location.href = '/'
    }
  }

  // 연말정산 신청 관련 함수들
  const fetchDonationReceipts = async () => {
    try {
      const response = await fetch('/api/donation-receipts')
      if (!response.ok) {
        console.error('연말정산 신청 로드 실패:', response.status, response.statusText)
        setDonationReceipts([])
        return
      }
      const data = await response.json()
      setDonationReceipts(data || [])
    } catch (error) {
      console.error('연말정산 신청을 불러오는 중 오류:', error)
      setDonationReceipts([])
    }
  }

  const handleReceiptStatusUpdate = async (id, status) => {
    try {
      const response = await fetch(`/api/donation-receipts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '상태가 업데이트되었습니다.' })
        fetchDonationReceipts()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.message || '상태 업데이트에 실패했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    }
  }

  // 목회일정 관련 함수들
  const fetchPastorSchedules = async () => {
    try {
      const response = await fetch('/api/pastor-schedules')
      if (!response.ok) {
        console.error('목회일정 로드 실패:', response.status, response.statusText)
        setPastorSchedules([])
        return
      }
      const data = await response.json()
      setPastorSchedules(data || [])
    } catch (error) {
      console.error('목회일정을 불러오는 중 오류:', error)
      setPastorSchedules([])
    }
  }

  const handlePastorScheduleSubmit = async (e) => {
    e.preventDefault()
    setPastorScheduleLoading(true)

    try {
      if (isPastorScheduleEditMode && editingPastorSchedule) {
        const response = await fetch(`/api/pastor-schedules/${editingPastorSchedule}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...pastorScheduleFormData,
            startDate: pastorScheduleFormData.startDate || null,
            endDate: pastorScheduleFormData.endDate || null,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setMessage({ type: 'success', text: '목회일정이 성공적으로 수정되었습니다!' })
          setPastorScheduleFormData({
            title: '',
            startDate: '',
            endDate: '',
            description: '',
            color: '#718096',
            order: 0,
          })
          setIsPastorScheduleEditMode(false)
          setEditingPastorSchedule(null)
          fetchPastorSchedules()
        } else {
          setMessage({ type: 'error', text: data.message || '오류가 발생했습니다.' })
        }
      } else {
        const response = await fetch('/api/pastor-schedules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...pastorScheduleFormData,
            startDate: pastorScheduleFormData.startDate || null,
            endDate: pastorScheduleFormData.endDate || null,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setMessage({ type: 'success', text: '목회일정이 성공적으로 추가되었습니다!' })
          setPastorScheduleFormData({
            title: '',
            startDate: '',
            endDate: '',
            description: '',
            color: '#718096',
            order: 0,
          })
          fetchPastorSchedules()
        } else {
          setMessage({ type: 'error', text: data.message || '오류가 발생했습니다.' })
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    } finally {
      setPastorScheduleLoading(false)
    }
  }

  const handlePastorScheduleEdit = (schedule) => {
    setPastorScheduleFormData({
      title: schedule.title || '',
      startDate: schedule.startDate ? new Date(schedule.startDate).toISOString().split('T')[0] : '',
      endDate: schedule.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : '',
      description: schedule.description || '',
      color: schedule.color || '#ff6b35',
      order: schedule.order || 0,
    })
    setEditingPastorSchedule(schedule._id)
    setIsPastorScheduleEditMode(true)
  }

  const handlePastorScheduleCancelEdit = () => {
    setPastorScheduleFormData({
      title: '',
      startDate: '',
      endDate: '',
      description: '',
      color: '#718096',
      order: 0,
    })
    setIsPastorScheduleEditMode(false)
    setEditingPastorSchedule(null)
  }

  const handlePastorScheduleDelete = async (id) => {
    if (!confirm('정말 이 목회일정을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/pastor-schedules/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '목회일정이 삭제되었습니다.' })
        fetchPastorSchedules()
      } else {
        setMessage({ type: 'error', text: '삭제 중 오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    }
  }

  const handleReceiptDelete = async (id) => {
    if (!confirm('정말 이 신청 내역을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/donation-receipts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '신청 내역이 삭제되었습니다.' })
        fetchDonationReceipts()
      } else {
        setMessage({ type: 'error', text: '삭제 중 오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' })
    }
  }

  const getTitle = () => {
    switch (activeTab) {
      case 'sermon': return '설교 관리'
      case 'gallery': return '갤러리 포스트 관리'
      case 'event': return '행사 포스터 관리'
      case 'bulletin': return '주보 관리'
      case 'popup': return '팝업 관리'
      case 'donation-receipt': return '연말정산 신청 관리'
      case 'pastor-schedule': return '목회일정 관리'
      default: return '관리자 페이지'
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <AdminHeader
          title="관리자 페이지"
          showBackButton={false}
          onHome={handleHome}
          onLogout={handleLogout}
        />

        <AdminMessage message={message} />

        <div className="admin-layout">
          {/* 왼쪽: 카테고리 메뉴 */}
          <div className="admin-sidebar">
            <div className="admin-menu">
              <button
                className={`admin-menu-item ${activeTab === 'sermon' ? 'active' : ''}`}
                onClick={() => setActiveTab('sermon')}
              >
                설교 관리
              </button>
              <button
                className={`admin-menu-item ${activeTab === 'bulletin' ? 'active' : ''}`}
                onClick={() => setActiveTab('bulletin')}
              >
                주보 관리
              </button>
              <button
                className={`admin-menu-item ${activeTab === 'event' ? 'active' : ''}`}
                onClick={() => setActiveTab('event')}
              >
                행사 포스터 관리
              </button>
              <button
                className={`admin-menu-item ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                갤러리 포스트 관리
              </button>
              <button
                className={`admin-menu-item ${activeTab === 'popup' ? 'active' : ''}`}
                onClick={() => setActiveTab('popup')}
              >
                팝업 관리
              </button>
              <button
                className={`admin-menu-item ${activeTab === 'donation-receipt' ? 'active' : ''}`}
                onClick={() => setActiveTab('donation-receipt')}
              >
                연말정산 신청 관리
              </button>
              <button
                className={`admin-menu-item ${activeTab === 'pastor-schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('pastor-schedule')}
              >
                목회일정 관리
              </button>
            </div>
          </div>

          {/* 오른쪽: 관리 창 */}
          <div className="admin-main-content">
            {/* 설교 관리 섹션 */}
            {activeTab === 'sermon' && (
              <SermonManagement onMessageChange={setMessage} />
            )}

            {/* 갤러리 포스트 관리 섹션 */}
            {activeTab === 'gallery' && (
              <div className="admin-content">
            <div className="admin-form-section">
              <h2>{isGalleryPostEditMode ? '갤러리 포스트 수정' : '새 갤러리 포스트 추가'}</h2>
              {isGalleryPostEditMode && (
                <button 
                  type="button" 
                  onClick={handleGalleryPostCancelEdit}
                  className="cancel-edit-button"
                >
                  수정 취소
                </button>
              )}
            <form onSubmit={handleGalleryPostSubmit} className="sermon-form">
              <div className="form-group">
                <label htmlFor="galleryPostTitle">제목 *</label>
                <input
                  type="text"
                  id="galleryPostTitle"
                  value={galleryPostFormData.title}
                  onChange={(e) => setGalleryPostFormData({ ...galleryPostFormData, title: e.target.value })}
                  placeholder="예: 2025년 1월 첫 주일 예배"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="galleryPostDate">날짜 *</label>
                <input
                  type="date"
                  id="galleryPostDate"
                  value={galleryPostFormData.date}
                  onChange={(e) => setGalleryPostFormData({ ...galleryPostFormData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="galleryPostThumbnail">대표 이미지 (썸네일) *</label>
                <input
                  type="file"
                  id="galleryPostThumbnail"
                  accept="image/*"
                  onChange={handleGalleryPostThumbnailSelect}
                  disabled={galleryPostUploading || galleryPostLoading}
                />
                <small>
                  메인 페이지에 표시될 대표 이미지입니다. (최대 10MB)<br />
                  이미지는 자동으로 최적화됩니다.
                </small>
                {galleryPostThumbnailPreview && (
                  <div className="preview-container" style={{ marginTop: '1rem' }}>
                    <img 
                      src={galleryPostThumbnailPreview} 
                      alt="썸네일 미리보기" 
                      className="preview-image"
                      style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
                    />
                  </div>
                )}
                {galleryPostUploading && (
                  <div className="upload-progress">
                    <p>썸네일 업로드 중...</p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>콘텐츠 섹션</label>
                <div style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => addSection('text')}
                    className="add-section-button"
                    style={{ marginRight: '0.5rem' }}
                  >
                    텍스트 섹션 추가
                  </button>
                  <button
                    type="button"
                    onClick={() => addSection('image-grid')}
                    className="add-section-button"
                  >
                    이미지 그리드 섹션 추가
                  </button>
                </div>
                
                {galleryPostFormData.sections.map((section, index) => (
                  <div key={index} className="section-editor" style={{ 
                    border: '1px solid #e2e8f0', 
                    padding: '1rem', 
                    marginBottom: '1rem',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong>{section.type === 'text' ? '텍스트 섹션' : '이미지 그리드 섹션'}</strong>
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="remove-section-button"
                        style={{ background: '#ef4444', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                      >
                        삭제
                      </button>
                    </div>
                    
                    {section.type === 'text' ? (
                      <textarea
                        value={section.content || ''}
                        onChange={(e) => updateSection(index, 'content', e.target.value)}
                        placeholder="텍스트 내용을 입력하세요"
                        rows="5"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                      />
                    ) : (
                      <div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <label>그리드 타입: </label>
                          <select
                            value={section.gridType || '4-grid'}
                            onChange={(e) => updateSection(index, 'gridType', e.target.value)}
                            style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                          >
                            <option value="4-grid">4개 그리드</option>
                            <option value="6-grid">6개 그리드</option>
                          </select>
                        </div>
                        <div>
                          <label>이미지 업로드: </label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={async (e) => {
                              const files = Array.from(e.target.files)
                              for (const file of files) {
                                await handleSectionImageUpload(index, file)
                              }
                            }}
                            style={{ marginTop: '0.5rem' }}
                          />
                        </div>
                        {section.images && section.images.length > 0 && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
                            {section.images.map((imgUrl, imgIndex) => (
                              <div key={imgIndex} style={{ position: 'relative' }}>
                                <img src={imgUrl} alt={`이미지 ${imgIndex + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSections = [...galleryPostFormData.sections]
                                    newSections[index].images = newSections[index].images.filter((_, i) => i !== imgIndex)
                                    setGalleryPostFormData({ ...galleryPostFormData, sections: newSections })
                                  }}
                                  style={{ 
                                    position: 'absolute', 
                                    top: '4px', 
                                    right: '4px', 
                                    background: 'rgba(0,0,0,0.7)', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '50%', 
                                    width: '24px', 
                                    height: '24px', 
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    lineHeight: '1'
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label htmlFor="galleryPostOrder">순서 (선택사항)</label>
                <input
                  type="number"
                  id="galleryPostOrder"
                  value={galleryPostFormData.order}
                  onChange={(e) => setGalleryPostFormData({ ...galleryPostFormData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
                <small>숫자가 작을수록 먼저 표시됩니다.</small>
              </div>

              <button 
                type="submit" 
                className="submit-button" 
                disabled={galleryPostLoading || galleryPostUploading || !galleryPostFormData.title || (!galleryPostThumbnailFile && !galleryPostFormData.thumbnail)}
              >
                {galleryPostUploading 
                  ? '업로드 중...' 
                  : galleryPostLoading 
                    ? '저장 중...' 
                    : isGalleryPostEditMode
                      ? '포스트 수정'
                      : '포스트 추가'}
              </button>
            </form>
          </div>

          <div className="admin-list-section">
            <h2>현재 등록된 갤러리 포스트</h2>
            <div className="sermon-list">
              {galleryPosts.length > 0 ? (
                galleryPosts.map((post) => (
                  <div key={post._id} className="sermon-item">
                    <div 
                      className={`sermon-item-list ${editingGalleryPost === post._id ? 'editing' : ''}`}
                      onClick={() => handleGalleryPostEdit(post)}
                    >
                      <div className="sermon-item-simple">
                        <div className="sermon-item-type">{post.title || '제목 없음'}</div>
                        <div className="sermon-item-date">
                          {post.date 
                            ? new Date(post.date).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : '날짜 없음'}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGalleryPostDelete(post._id)
                          }}
                          className="delete-button"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sermon-empty">
                  <p>등록된 포스트가 없습니다</p>
                </div>
              )}
            </div>
              </div>
            </div>
            )}

            {/* 행사 포스터 관리 섹션 */}
            {activeTab === 'event' && (
              <div className="admin-content">
            <div className="admin-form-section">
              <h2>{isEventEditMode ? '행사 포스터 수정' : '새 행사 포스터 추가'}</h2>
              {isEventEditMode && (
                <button 
                  type="button" 
                  onClick={handleEventCancelEdit}
                  className="cancel-edit-button"
                >
                  수정 취소
                </button>
              )}
            <form onSubmit={handleEventSubmit} className="sermon-form">
              <div className="form-group">
                <label htmlFor="eventImageFile">포스터 이미지 업로드 (Supabase) - 여러 장 선택 가능 *</label>
                <input
                  type="file"
                  id="eventImageFile"
                  accept="image/*"
                  multiple
                  onChange={handleEventFileSelect}
                  disabled={eventUploading || eventLoading}
                />
                <small>
                  여러 이미지 파일을 선택할 수 있습니다. (최대 10MB/파일)<br />
                  지원 형식: JPG, PNG, GIF, WebP<br />
                  <strong>Ctrl (Mac: Cmd) 키를 누른 채로 여러 파일을 선택하세요.</strong>
                </small>
                {eventUploading && (
                  <div className="upload-progress-container">
                    {eventSelectedFiles.map((file, index) => {
                      const progress = eventUploadProgress[file.name] || { percent: 0, current: 0, total: eventSelectedFiles.length }
                      return (
                        <div key={index} className="upload-progress-item">
                          <div className="upload-progress-header">
                            <span className="upload-file-name">{file.name}</span>
                            <span className="upload-progress-text">
                              {progress.current > 0 ? `${progress.current}/${progress.total}` : ''} {progress.percent}%
                            </span>
                          </div>
                          <div className="upload-progress">
                            <div 
                              className="upload-progress-bar" 
                              style={{ width: `${progress.percent}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                {eventPreviewUrls.length > 0 && (
                  <div className="image-preview-container">
                    <div className="image-preview-grid">
                      {eventPreviewUrls.map((preview, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={preview.url} alt={preview.name} />
                          <div className="image-preview-info">
                            <span className="image-preview-name">{preview.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = eventSelectedFiles.filter((_, i) => i !== index)
                                const newPreviews = eventPreviewUrls.filter((_, i) => i !== index)
                                setEventSelectedFiles(newFiles)
                                setEventPreviewUrls(newPreviews)
                              }}
                              className="remove-preview-button"
                              disabled={eventUploading || eventLoading}
                            >
                              제거
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEventSelectedFiles([])
                        setEventPreviewUrls([])
                      }}
                      className="clear-all-button"
                      disabled={eventUploading || eventLoading}
                    >
                      모두 제거 ({eventPreviewUrls.length}개)
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="eventImageUrl">또는 이미지 URL 직접 입력</label>
                <input
                  type="url"
                  id="eventImageUrl"
                  value={eventFormData.imageUrl}
                  onChange={(e) => setEventFormData({ ...eventFormData, imageUrl: e.target.value })}
                  placeholder="https://example.com/poster.jpg"
                  disabled={eventSelectedFiles.length > 0}
                />
                <small>
                  파일 업로드 대신 이미지 URL을 직접 입력할 수도 있습니다.<br />
                  파일을 선택하면 이 필드는 비활성화됩니다.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="eventTitle">행사 제목 (선택사항)</label>
                <input
                  type="text"
                  id="eventTitle"
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                  placeholder="예: 2025년 봄 수련회"
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventDescription">설명 (선택사항)</label>
                <textarea
                  id="eventDescription"
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  placeholder="행사에 대한 설명을 입력하세요"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventDate">행사 날짜 (선택사항, 기존 호환성)</label>
                <input
                  type="date"
                  id="eventDate"
                  value={eventFormData.eventDate}
                  onChange={(e) => setEventFormData({ ...eventFormData, eventDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="startDate">시작 날짜 (선택사항)</label>
                <input
                  type="date"
                  id="startDate"
                  value={eventFormData.startDate}
                  onChange={(e) => setEventFormData({ ...eventFormData, startDate: e.target.value })}
                />
                <small>행사 기간의 시작 날짜를 입력하세요</small>
              </div>

              <div className="form-group">
                <label htmlFor="endDate">끝나는 날짜 (선택사항)</label>
                <input
                  type="date"
                  id="endDate"
                  value={eventFormData.endDate}
                  onChange={(e) => setEventFormData({ ...eventFormData, endDate: e.target.value })}
                />
                <small>끝나는 날짜를 입력하지 않으면 시작 날짜만 표시됩니다</small>
              </div>

              <div className="form-group">
                <label htmlFor="eventOrder">순서 (선택사항)</label>
                <input
                  type="number"
                  id="eventOrder"
                  value={eventFormData.order}
                  onChange={(e) => setEventFormData({ ...eventFormData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
                <small>숫자가 작을수록 먼저 표시됩니다.</small>
              </div>

              <button 
                type="submit" 
                className="submit-button" 
                disabled={eventLoading || eventUploading || (eventSelectedFiles.length === 0 && !eventFormData.imageUrl)}
              >
                {eventUploading 
                  ? `업로드 중... (${eventSelectedFiles.length}개)` 
                  : eventLoading 
                    ? '저장 중...' 
                    : isEventEditMode
                      ? '포스터 수정'
                      : eventSelectedFiles.length > 0
                        ? `포스터 추가 (${eventSelectedFiles.length}개)`
                        : '포스터 추가'}
              </button>
            </form>
          </div>

          <div className="admin-list-section">
            <h2>현재 등록된 행사 포스터 ({events.length}개)</h2>
            {events.length === 0 ? (
              <div className="sermon-empty">
                <p>등록된 포스터가 없습니다</p>
              </div>
            ) : (
              <>
                <div className="sermon-list">
                  {events
                    .slice((eventCurrentPage - 1) * eventItemsPerPage, eventCurrentPage * eventItemsPerPage)
                    .map((event) => (
                      <div key={event._id} className="sermon-item">
                        <div 
                          className={`sermon-item-list ${editingEvent === event._id ? 'editing' : ''}`}
                          onClick={() => handleEventEdit(event)}
                        >
                          <div className="sermon-item-simple">
                            <div className="sermon-item-type">{event.title || '행사 포스터'}</div>
                            <div className="sermon-item-date">
                              {formatEventDate(event)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEventDelete(event._id)
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
                {events.length > eventItemsPerPage && (
                  <div className="pagination">
                    <button
                      onClick={() => setEventCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={eventCurrentPage === 1}
                      className="pagination-button"
                    >
                      이전
                    </button>
                    <div className="pagination-info">
                      {eventCurrentPage} / {Math.ceil(events.length / eventItemsPerPage)}
                    </div>
                    <button
                      onClick={() => setEventCurrentPage(prev => Math.min(Math.ceil(events.length / eventItemsPerPage), prev + 1))}
                      disabled={eventCurrentPage >= Math.ceil(events.length / eventItemsPerPage)}
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
            )}

            {/* 주보 관리 섹션 */}
            {activeTab === 'bulletin' && (
              <div className="admin-content">
            <div className="admin-form-section">
              <h2>{isBulletinEditMode ? '주보 수정' : '새 주보 추가'}</h2>
              {isBulletinEditMode && (
                <button 
                  type="button" 
                  onClick={handleBulletinCancelEdit}
                  className="cancel-edit-button"
                >
                  수정 취소
                </button>
              )}
            <form onSubmit={handleBulletinSubmit}>
              {[0, 1].map((index) => (
                <div key={index} className="form-group">
                  <label htmlFor={`bulletinFile${index}`}>
                    주보 파일 {index + 1} {index === 0 ? '*' : '(선택사항)'}
                  </label>
                  <input
                    type="file"
                    id={`bulletinFile${index}`}
                    accept="image/*,application/pdf"
                    onChange={(e) => handleBulletinFileSelect(e, index)}
                    disabled={bulletinUploading}
                  />
                  {bulletinPreviewUrls[index] && (
                    <div className="preview-container">
                      <img 
                        src={bulletinPreviewUrls[index]} 
                        alt={`주보 미리보기 ${index + 1}`} 
                        className="preview-image"
                      />
                    </div>
                  )}
                  {bulletinSelectedFiles[index] && !bulletinPreviewUrls[index] && (
                    <div className="preview-container">
                      <div className="pdf-preview">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p>{bulletinSelectedFiles[index].name}</p>
                        <p className="file-size">{(bulletinSelectedFiles[index].size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  )}
                  {bulletinUploading && bulletinSelectedFiles[index] && (
                    <div className="upload-progress">
                      <p>파일 {index + 1} 업로드 중...</p>
                    </div>
                  )}
                  <small>이미지 파일(JPG, PNG, GIF, WebP) 또는 PDF 파일을 업로드할 수 있습니다. (최대 10MB)<br />
                  또는 아래에 파일 URL을 직접 입력할 수 있습니다.</small>
                  
                  <div style={{ marginTop: '0.5rem' }}>
                    <label htmlFor={`bulletinImageUrl${index}`} style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>
                      파일 {index + 1} URL (선택사항)
                    </label>
                    <input
                      type="url"
                      id={`bulletinImageUrl${index}`}
                      value={bulletinFormData.imageUrls[index] || ''}
                      onChange={(e) => {
                        const newImageUrls = [...bulletinFormData.imageUrls]
                        newImageUrls[index] = e.target.value
                        setBulletinFormData({ ...bulletinFormData, imageUrls: newImageUrls })
                      }}
                      placeholder="https://example.com/image.jpg 또는 https://example.com/bulletin.pdf"
                      style={{ marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
              ))}

              <div className="form-group">
                <label htmlFor="bulletinTitle">주보 제목 (선택사항)</label>
                <input
                  type="text"
                  id="bulletinTitle"
                  value={bulletinFormData.title}
                  onChange={(e) => setBulletinFormData({ ...bulletinFormData, title: e.target.value })}
                  placeholder="예: 2025년 1월 첫째 주 주보"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bulletinDate">주보 날짜 (선택사항)</label>
                <input
                  type="date"
                  id="bulletinDate"
                  value={bulletinFormData.date}
                  onChange={(e) => setBulletinFormData({ ...bulletinFormData, date: e.target.value })}
                />
                <small>날짜를 지정하지 않으면 오늘 날짜로 저장됩니다.</small>
              </div>

              <div className="form-group">
                <label htmlFor="bulletinOrder">순서 (선택사항)</label>
                <input
                  type="number"
                  id="bulletinOrder"
                  value={bulletinFormData.order}
                  onChange={(e) => setBulletinFormData({ ...bulletinFormData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
                <small>숫자가 작을수록 먼저 표시됩니다.</small>
              </div>

              <button 
                type="submit" 
                className="submit-button" 
                disabled={bulletinLoading || bulletinUploading || (!bulletinSelectedFiles.some(f => f !== null) && !bulletinFormData.imageUrls.some(url => url && url.trim() !== ''))}
              >
                {bulletinUploading 
                  ? '이미지 업로드 중...' 
                  : bulletinLoading 
                    ? '저장 중...' 
                    : isBulletinEditMode ? '주보 수정' : '주보 추가'}
              </button>
            </form>
          </div>

          <div className="admin-list-section">
            <h2>현재 등록된 주보</h2>
            <div className="sermon-list">
              {bulletins.length > 0 ? (
                bulletins.map((bulletin) => (
                  <div key={bulletin._id} className="sermon-item">
                    <div 
                      className={`sermon-item-list ${editingBulletin === bulletin._id ? 'editing' : ''}`}
                      onClick={() => handleBulletinEdit(bulletin)}
                    >
                      <div className="sermon-item-simple">
                        <div className="sermon-item-type">{bulletin.title || '주보'}</div>
                        <div className="sermon-item-date">
                          {bulletin.date 
                            ? new Date(bulletin.date).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : '날짜 없음'}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBulletinDelete(bulletin._id)
                          }}
                          className="delete-button"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sermon-empty">
                  <p>등록된 주보가 없습니다</p>
                </div>
              )}
            </div>
              </div>
            </div>
            )}

            {/* 팝업 관리 섹션 */}
            {activeTab === 'popup' && (
              <div className="admin-content">
                <div className="admin-form-section">
                  <h2>{isPopupEditMode ? '팝업 수정' : '새 팝업 추가'}</h2>
                  {isPopupEditMode && (
                    <button 
                      type="button" 
                      onClick={handlePopupCancelEdit}
                      className="cancel-edit-button"
                    >
                      수정 취소
                    </button>
                  )}
                  <form onSubmit={handlePopupSubmit} className="sermon-form">
                    <div className="form-group">
                      <label htmlFor="popupTitle">제목 *</label>
                      <input
                        type="text"
                        id="popupTitle"
                        value={popupFormData.title}
                        onChange={(e) => setPopupFormData({ ...popupFormData, title: e.target.value })}
                        placeholder="예: 새해 인사말"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="popupImage">이미지 (선택사항)</label>
                      <input
                        type="file"
                        id="popupImage"
                        accept="image/*"
                        onChange={handlePopupImageSelect}
                        disabled={popupUploading || popupLoading}
                      />
                      <small>
                        팝업에 표시할 이미지를 업로드하세요. (최대 10MB)<br />
                        <strong>이미지 비율은 16:9가 최적입니다.</strong><br />
                        이미지는 자동으로 최적화됩니다.
                      </small>
                      {popupImagePreview && (
                        <div className="preview-container" style={{ marginTop: '1rem' }}>
                          <img 
                            src={popupImagePreview} 
                            alt="이미지 미리보기" 
                            className="preview-image"
                            style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      {popupUploading && (
                        <div className="upload-progress">
                          <p>이미지 업로드 중...</p>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="popupImageUrl">또는 이미지 URL 직접 입력</label>
                      <input
                        type="url"
                        id="popupImageUrl"
                        value={popupFormData.imageUrl}
                        onChange={(e) => setPopupFormData({ ...popupFormData, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        disabled={popupImageFile !== null}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="popupLinkUrl">링크 URL (선택사항)</label>
                      <input
                        type="url"
                        id="popupLinkUrl"
                        value={popupFormData.linkUrl}
                        onChange={(e) => setPopupFormData({ ...popupFormData, linkUrl: e.target.value })}
                        placeholder="https://example.com"
                      />
                      <small>팝업 클릭 시 이동할 링크를 입력하세요.</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="popupLinkText">링크 버튼 텍스트 (선택사항)</label>
                      <input
                        type="text"
                        id="popupLinkText"
                        value={popupFormData.linkText}
                        onChange={(e) => setPopupFormData({ ...popupFormData, linkText: e.target.value })}
                        placeholder="자세히 보기"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="popupStartDate">시작 날짜 *</label>
                      <input
                        type="date"
                        id="popupStartDate"
                        value={popupFormData.startDate}
                        onChange={(e) => setPopupFormData({ ...popupFormData, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="popupEndDate">종료 날짜 (선택사항)</label>
                      <input
                        type="date"
                        id="popupEndDate"
                        value={popupFormData.endDate}
                        onChange={(e) => setPopupFormData({ ...popupFormData, endDate: e.target.value })}
                      />
                      <small>종료 날짜를 지정하지 않으면 무제한으로 표시됩니다.</small>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={popupFormData.isActive}
                          onChange={(e) => setPopupFormData({ ...popupFormData, isActive: e.target.checked })}
                        />
                        활성화
                      </label>
                      <small>체크 해제 시 팝업이 표시되지 않습니다.</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="popupOrder">순서 (선택사항)</label>
                      <input
                        type="number"
                        id="popupOrder"
                        value={popupFormData.order}
                        onChange={(e) => setPopupFormData({ ...popupFormData, order: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        min="0"
                      />
                      <small>숫자가 작을수록 먼저 표시됩니다.</small>
                    </div>

                    <button 
                      type="submit" 
                      className="submit-button" 
                      disabled={popupLoading || popupUploading || !popupFormData.title || !popupFormData.startDate}
                    >
                      {popupUploading 
                        ? '업로드 중...' 
                        : popupLoading 
                          ? '저장 중...' 
                          : isPopupEditMode
                            ? '팝업 수정'
                            : '팝업 추가'}
                    </button>
                  </form>
                </div>

                <div className="admin-list-section">
                  <h2>현재 등록된 팝업</h2>
                  <div className="sermon-list">
                    {popups.length > 0 ? (
                      popups.map((popup) => (
                        <div key={popup._id} className="sermon-item">
                          <div 
                            className={`sermon-item-list ${editingPopup === popup._id ? 'editing' : ''}`}
                            onClick={() => handlePopupEdit(popup)}
                          >
                            <div className="sermon-item-simple">
                              <div className="sermon-item-type">
                                {popup.title || '제목 없음'} 
                                {popup.isActive ? ' (활성)' : ' (비활성)'}
                              </div>
                              <div className="sermon-item-date">
                                {popup.startDate 
                                  ? new Date(popup.startDate).toLocaleDateString('ko-KR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })
                                  : '날짜 없음'}
                                {popup.endDate && ` ~ ${new Date(popup.endDate).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}`}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePopupDelete(popup._id)
                                }}
                                className="delete-button"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="sermon-empty">
                        <p>등록된 팝업이 없습니다</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 연말정산 신청 관리 섹션 */}
            {activeTab === 'donation-receipt' && (
              <div className="admin-content">
                <div className="admin-list-section">
                  <h2>연말정산 신청 내역 ({donationReceipts.length}건)</h2>
                  {donationReceiptLoading ? (
                    <div className="loading">로딩 중...</div>
                  ) : donationReceipts.length > 0 ? (
                    <div className="donation-receipt-list">
                      {donationReceipts.map((receipt) => (
                        <div key={receipt._id} className="donation-receipt-item">
                          <div className="donation-receipt-header">
                            <div className="donation-receipt-type-badge">
                              {receipt.type === '개인' ? '개인' : '법인'}
                            </div>
                            <div className="donation-receipt-status-badge" data-status={receipt.status}>
                              {receipt.status}
                            </div>
                            <div className="donation-receipt-date">
                              {new Date(receipt.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div className="donation-receipt-info">
                            <div className="donation-receipt-info-row">
                              <strong>성함:</strong> {receipt.name}
                            </div>
                            <div className="donation-receipt-info-row">
                              <strong>연락처:</strong> {receipt.contact}
                            </div>
                            <div className="donation-receipt-info-row">
                              <strong>이메일:</strong> {receipt.email}
                            </div>
                            {receipt.type === '개인' ? (
                              <>
                                <div className="donation-receipt-info-row">
                                  <strong>주민등록번호:</strong> {receipt.residentNumber || '-'}
                                </div>
                                <div className="donation-receipt-info-row">
                                  <strong>주소:</strong> {receipt.address || '-'}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="donation-receipt-info-row">
                                  <strong>법인명:</strong> {receipt.corporateName || '-'}
                                </div>
                                {receipt.businessRegistrationFile && (
                                  <div className="donation-receipt-info-row">
                                    <strong>사업자등록증:</strong>{' '}
                                    <a href={receipt.businessRegistrationFile} target="_blank" rel="noopener noreferrer" className="file-link">
                                      파일 보기
                                    </a>
                                  </div>
                                )}
                              </>
                            )}
                            {receipt.otherRequests && (
                              <div className="donation-receipt-info-row">
                                <strong>기타 요청사항:</strong> {receipt.otherRequests}
                              </div>
                            )}
                          </div>
                          <div className="donation-receipt-actions">
                            <select
                              value={receipt.status}
                              onChange={(e) => handleReceiptStatusUpdate(receipt._id, e.target.value)}
                              className="status-select"
                            >
                              <option value="대기">대기</option>
                              <option value="처리중">처리중</option>
                              <option value="완료">완료</option>
                              <option value="거부">거부</option>
                            </select>
                            <button
                              onClick={() => handleReceiptDelete(receipt._id)}
                              className="delete-button"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="sermon-empty">
                      <p>신청 내역이 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 목회일정 관리 섹션 */}
            {activeTab === 'pastor-schedule' && (
              <div className="admin-content">
                <div className="admin-form-section">
                  <h2>{isPastorScheduleEditMode ? '목회일정 수정' : '새 목회일정 추가'}</h2>
                  {isPastorScheduleEditMode && (
                    <button 
                      type="button" 
                      onClick={handlePastorScheduleCancelEdit}
                      className="cancel-edit-button"
                    >
                      수정 취소
                    </button>
                  )}
                  <form onSubmit={handlePastorScheduleSubmit} className="sermon-form">
                    <div className="form-group">
                      <label htmlFor="pastorScheduleTitle">제목 *</label>
                      <input
                        type="text"
                        id="pastorScheduleTitle"
                        value={pastorScheduleFormData.title}
                        onChange={(e) => setPastorScheduleFormData({ ...pastorScheduleFormData, title: e.target.value })}
                        placeholder="예: 송구영신예배"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pastorScheduleStartDate">시작 날짜 *</label>
                      <input
                        type="date"
                        id="pastorScheduleStartDate"
                        value={pastorScheduleFormData.startDate}
                        onChange={(e) => setPastorScheduleFormData({ ...pastorScheduleFormData, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pastorScheduleEndDate">종료 날짜 (선택사항)</label>
                      <input
                        type="date"
                        id="pastorScheduleEndDate"
                        value={pastorScheduleFormData.endDate}
                        onChange={(e) => setPastorScheduleFormData({ ...pastorScheduleFormData, endDate: e.target.value })}
                      />
                      <small>종료 날짜를 입력하지 않으면 하루짜리 일정으로 표시됩니다.</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="pastorScheduleDescription">설명 (선택사항)</label>
                      <textarea
                        id="pastorScheduleDescription"
                        value={pastorScheduleFormData.description}
                        onChange={(e) => setPastorScheduleFormData({ ...pastorScheduleFormData, description: e.target.value })}
                        rows="4"
                        placeholder="일정에 대한 추가 설명을 입력하세요."
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pastorScheduleColor">색상</label>
                      <input
                        type="color"
                        id="pastorScheduleColor"
                        value={pastorScheduleFormData.color}
                        onChange={(e) => setPastorScheduleFormData({ ...pastorScheduleFormData, color: e.target.value })}
                      />
                      <small>캘린더에 표시될 색상을 선택하세요.</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="pastorScheduleOrder">순서 (선택사항)</label>
                      <input
                        type="number"
                        id="pastorScheduleOrder"
                        value={pastorScheduleFormData.order}
                        onChange={(e) => setPastorScheduleFormData({ ...pastorScheduleFormData, order: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        min="0"
                      />
                      <small>숫자가 작을수록 먼저 표시됩니다.</small>
                    </div>

                    <button 
                      type="submit" 
                      className="submit-button" 
                      disabled={pastorScheduleLoading || !pastorScheduleFormData.title || !pastorScheduleFormData.startDate}
                    >
                      {pastorScheduleLoading 
                        ? '저장 중...' 
                        : isPastorScheduleEditMode
                          ? '목회일정 수정'
                          : '목회일정 추가'}
                    </button>
                  </form>
                </div>

                <div className="admin-list-section">
                  <h2>현재 등록된 목회일정 ({pastorSchedules.length}건)</h2>
                  {pastorSchedules.length > 0 ? (
                    <div className="sermon-list">
                      {pastorSchedules.map((schedule) => (
                        <div key={schedule._id} className="sermon-item">
                          <div className="sermon-info">
                            <h3>{schedule.title}</h3>
                            <p>
                              <strong>기간:</strong>{' '}
                              {schedule.endDate 
                                ? `${new Date(schedule.startDate).toLocaleDateString('ko-KR')} - ${new Date(schedule.endDate).toLocaleDateString('ko-KR')}`
                                : new Date(schedule.startDate).toLocaleDateString('ko-KR')}
                            </p>
                            {schedule.description && (
                              <p><strong>설명:</strong> {schedule.description}</p>
                            )}
                            <p>
                              <strong>색상:</strong>{' '}
                              <span 
                                style={{ 
                                  display: 'inline-block', 
                                  width: '20px', 
                                  height: '20px', 
                                  backgroundColor: schedule.color || '#ff6b35',
                                  borderRadius: '4px',
                                  verticalAlign: 'middle',
                                  marginLeft: '8px'
                                }}
                              />
                            </p>
                          </div>
                          <div className="sermon-actions">
                            <button
                              onClick={() => handlePastorScheduleEdit(schedule)}
                              className="edit-button"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handlePastorScheduleDelete(schedule._id)}
                              className="delete-button"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="sermon-empty">
                      <p>등록된 목회일정이 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin

