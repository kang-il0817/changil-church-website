import { useState, useEffect } from 'react'
import './Header.css'

function Header() {
  const [logoSrc, setLogoSrc] = useState('/logo-head.svg')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // 로고 이미지 형식 자동 감지
  useEffect(() => {
    const logoFormats = ['/logo-head.svg', '/logo-head.png', '/logo-head.jpg', '/logo-head.webp']
    let currentIndex = 0
    
    const checkLogo = () => {
      if (currentIndex >= logoFormats.length) {
        // 모든 형식 실패 시 텍스트 표시
        return
      }
      
      const img = new Image()
      img.onload = () => {
        setLogoSrc(logoFormats[currentIndex])
      }
      img.onerror = () => {
        currentIndex++
        checkLogo()
      }
      img.src = logoFormats[currentIndex]
    }
    
    checkLogo()
  }, [])

  const handleLogoClick = (e) => {
    e.preventDefault()
    
    // 현재 경로 확인
    const currentPath = window.location.pathname
    
    // 메인 페이지에 있으면 새로고침
    if (currentPath === '/' || currentPath === '') {
      window.location.reload()
    } else {
      // 다른 페이지에 있으면 메인 페이지로 이동
      if (window.navigate) {
        window.navigate('/')
      } else {
        window.location.href = '/'
      }
    }
  }

  const handleNavClick = (e, sectionId) => {
    e.preventDefault()
    
    // 현재 경로 확인
    const currentPath = window.location.pathname
    
    // 메인 페이지가 아니면 먼저 메인 페이지로 이동
    if (currentPath !== '/' && currentPath !== '') {
      if (window.navigate) {
        window.navigate('/')
      } else {
        window.location.href = '/'
      }
      // 페이지 이동 후 스크롤 (약간의 지연 필요)
      setTimeout(() => {
        scrollToSection(sectionId)
      }, 100)
    } else {
      // 메인 페이지에 있으면 바로 스크롤
      scrollToSection(sectionId)
    }
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerHeight = 80 // 헤더 높이 고려
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - headerHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleMobileMenuItemClick = (path, sectionId = null) => {
    setIsMobileMenuOpen(false)
    
    if (sectionId) {
      // 메인 페이지 섹션으로 이동
      const currentPath = window.location.pathname
      if (currentPath !== '/' && currentPath !== '') {
        if (window.navigate) {
          window.navigate('/')
        } else {
          window.location.href = '/'
        }
        setTimeout(() => {
          scrollToSection(sectionId)
        }, 100)
      } else {
        scrollToSection(sectionId)
      }
    } else {
      // 다른 페이지로 이동
      if (window.navigate) {
        window.navigate(path)
      } else {
        window.location.href = path
      }
    }
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={handleLogoClick}>
          <img 
            src={logoSrc} 
            alt="창일교회" 
            className="logo-image"
            onError={(e) => {
              // 로고 이미지가 없으면 텍스트 표시
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div className="logo-icon" style={{ display: 'none' }}>창일교회</div>
        </div>
        <nav className="nav">
          <a href="#welcome" onClick={(e) => handleNavClick(e, 'welcome')}>환영해요</a>
          <a href="#worship" onClick={(e) => handleNavClick(e, 'worship')}>예배해요</a>
          <a href="#together" onClick={(e) => handleNavClick(e, 'together')}>함께해요</a>
          <a href="#live" onClick={(e) => handleNavClick(e, 'live')}>살아가요</a>
        </nav>
        <button 
          className="mobile-menu-button"
          onClick={handleMobileMenuClick}
          aria-label="메뉴"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={handleMobileMenuClick}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>메뉴</h3>
              <button 
                className="mobile-menu-close"
                onClick={handleMobileMenuClick}
                aria-label="메뉴 닫기"
              >
                ×
              </button>
            </div>
            <div className="mobile-menu-items">
              <button 
                className="mobile-menu-item"
                onClick={() => handleMobileMenuItemClick('/church-intro')}
              >
                교회소개
              </button>
              <button 
                className="mobile-menu-item"
                onClick={() => handleMobileMenuItemClick('/coming-soon')}
              >
                섬기는 이들
              </button>
              <button 
                className="mobile-menu-item"
                onClick={() => handleMobileMenuItemClick('/bulletin')}
              >
                주보
              </button>
              <button 
                className="mobile-menu-item"
                onClick={() => handleMobileMenuItemClick('/worship-guide')}
              >
                예배안내
              </button>
              <button 
                className="mobile-menu-item"
                onClick={() => handleMobileMenuItemClick('/directions')}
              >
                오시는 길
              </button>
              <button 
                className="mobile-menu-item"
                onClick={() => handleMobileMenuItemClick('/new-family-visit')}
              >
                새가족 방문
              </button>
              <button 
                className="mobile-menu-item"
                onClick={() => handleMobileMenuItemClick(null, 'together')}
              >
                시역 | 행사
              </button>
              <button 
                className="mobile-menu-item"
                onClick={() => handleMobileMenuItemClick('/gallery')}
              >
                창일 갤러리
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

