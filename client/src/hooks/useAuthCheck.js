import { useEffect } from 'react'

export function useAuthCheck() {
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    const loginTime = localStorage.getItem('adminLoginTime')
    
    // 로그인하지 않았거나 24시간이 지났으면 로그인 페이지로 리다이렉트
    if (!isLoggedIn || !loginTime) {
      if (window.navigate) {
        window.navigate('/login')
      } else {
        window.location.href = '/login'
      }
      return
    }
    
    // 24시간(86400000ms) 체크
    const timeDiff = Date.now() - parseInt(loginTime)
    if (timeDiff > 86400000) {
      localStorage.removeItem('adminLoggedIn')
      localStorage.removeItem('adminLoginTime')
      if (window.navigate) {
        window.navigate('/login')
      } else {
        window.location.href = '/login'
      }
      return
    }
  }, [])
}

