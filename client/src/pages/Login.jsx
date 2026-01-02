import { useState } from 'react'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 관리자 계정 정보 (환경변수에서 가져오기)
  const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 환경변수가 설정되지 않은 경우
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      setError('관리자 계정이 설정되지 않았습니다. 환경변수를 확인해주세요.')
      setLoading(false)
      return
    }

    // 간단한 지연 (로딩 효과)
    await new Promise(resolve => setTimeout(resolve, 500))

    // 아이디와 비밀번호 확인 (공백 제거)
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()
    
    if (trimmedUsername === ADMIN_USERNAME && trimmedPassword === ADMIN_PASSWORD) {
      // 로그인 성공 - 로컬스토리지에 저장
      localStorage.setItem('adminLoggedIn', 'true')
      localStorage.setItem('adminLoginTime', Date.now().toString())
      
      // 관리자 페이지로 이동
      if (window.navigate) {
        window.navigate('/admin')
      } else {
        window.location.href = '/admin'
      }
    } else {
      setError('관리자에게 문의하세요.')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <h1 className="login-title">관리자 로그인</h1>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">아이디</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                required
                autoFocus
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          <div className="login-footer">
            <button
              onClick={() => {
                if (window.navigate) {
                  window.navigate('/')
                } else {
                  window.location.href = '/'
                }
              }}
              className="back-button"
            >
              ← 홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

