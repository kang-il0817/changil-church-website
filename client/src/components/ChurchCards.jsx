import { useState, useEffect, useRef } from 'react'
import './ChurchCards.css'

function ChurchCards() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

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
  const items = [
    {
      id: 1,
      title: '교회소개',
      icon: '/icons/church-intro.svg', // 또는 .png, .jpg
    },
    {
      id: 2,
      title: '섬기는 이들',
      icon: '/icons/serving-people.svg',
    },
    {
      id: 3,
      title: '주보',
      icon: '/icons/bulletin.svg',
    },
    {
      id: 4,
      title: '예배안내',
      icon: '/icons/worship-guide.svg',
    },
    {
      id: 5,
      title: '오시는 길',
      icon: '/icons/directions.svg',
    },
    {
      id: 6,
      title: '새가족 방문',
      icon: '/icons/new-family.svg',
    }
  ]

  return (
    <section className="church-cards" ref={sectionRef}>
      <div className="church-intro-container">
        <div className={`section-header ${isVisible ? 'fade-in-up' : ''}`}>
          <h2 className="church-intro-title">
            <span className="title-bold">처음</span>
            <span className="title-light"> 오셨나요?</span>
          </h2>
          <p className="section-description">창일교회를 소개합니다</p>
        </div>
        <div className="church-intro-items">
          {items.map(item => {
            const handleClick = () => {
              if (item.title === '교회소개') {
                if (window.navigate) {
                  window.navigate('/church-intro')
                } else {
                  window.location.href = '/church-intro'
                }
              } else if (item.title === '섬기는 이들') {
                if (window.navigate) {
                  window.navigate('/coming-soon')
                } else {
                  window.location.href = '/coming-soon'
                }
              } else if (item.title === '오시는 길') {
                if (window.navigate) {
                  window.navigate('/directions')
                } else {
                  window.location.href = '/directions'
                }
              } else if (item.title === '주보') {
                if (window.navigate) {
                  window.navigate('/bulletin')
                } else {
                  window.location.href = '/bulletin'
                }
              } else if (item.title === '예배안내') {
                if (window.navigate) {
                  window.navigate('/worship-guide')
                } else {
                  window.location.href = '/worship-guide'
                }
              } else if (item.title === '새가족 방문') {
                if (window.navigate) {
                  window.navigate('/new-family-visit')
                } else {
                  window.location.href = '/new-family-visit'
                }
              }
            }

            return (
              <div 
                key={item.id} 
                className="church-intro-item"
                onClick={handleClick}
              >
                <div className="church-intro-icon">
                  <img 
                    src={item.icon} 
                    alt={item.title}
                    onError={(e) => {
                      // 이미지가 없으면 기본 아이콘 표시
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                  <div className="church-intro-icon-fallback" style={{ display: 'none' }}>
                    {item.title.charAt(0)}
                  </div>
                </div>
                <div className="church-intro-label">{item.title}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ChurchCards
