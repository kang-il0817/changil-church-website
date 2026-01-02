import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './GalleryList.css'

function GalleryList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/gallery-posts')
      if (!response.ok) {
        console.error('갤러리 포스트 로드 실패:', response.status, response.statusText)
        setPosts([])
        return
      }
      const data = await response.json()
      setPosts(data || [])
    } catch (error) {
      console.error('갤러리 포스트를 불러오는 중 오류:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handlePostClick = (postId) => {
    if (window.navigate) {
      window.navigate(`/gallery/${postId}`)
    } else {
      window.location.href = `/gallery/${postId}`
    }
  }

  if (loading) {
    return (
      <div className="gallery-list-page">
        <Header />
        <div className="gallery-list-container">
          <div className="loading">로딩 중...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="gallery-list-page">
      <Header />
      <div className="gallery-list-container">
        <div className="gallery-list-header">
          <h1 className="gallery-list-title">창일 갤러리</h1>
          <p className="gallery-list-description">은혜와 기쁨의 순간들을 공유합니다.</p>
        </div>
        
        <div className="gallery-list-table-container">
          {posts.length > 0 ? (
            <table className="gallery-list-table">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>날짜</th>
                  <th>제목</th>
                  <th>작성자</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr 
                    key={post._id}
                    onClick={() => handlePostClick(post._id)}
                    className="gallery-list-table-row"
                  >
                    <td className="gallery-list-table-number">{posts.length - index}</td>
                    <td className="gallery-list-table-date">
                      {post.date 
                        ? new Date(post.date).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })
                        : '-'}
                    </td>
                    <td className="gallery-list-table-title">{post.title || '제목 없음'}</td>
                    <td className="gallery-list-table-author">관리자</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="gallery-list-empty">
              <p>등록된 포스트가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default GalleryList

