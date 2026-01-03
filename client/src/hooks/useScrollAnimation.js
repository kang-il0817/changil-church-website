import { useState, useEffect, useRef } from 'react'

/**
 * 스크롤 시 요소가 나타나는 애니메이션을 위한 커스텀 훅
 * @param {Object} options - 옵션 객체
 * @param {number} options.threshold - Intersection Observer의 threshold (0-1)
 * @param {string} options.rootMargin - Intersection Observer의 rootMargin
 * @param {number} options.delay - 초기 체크 지연 시간 (ms)
 * @returns {[React.RefObject, boolean]} - ref와 isVisible 상태
 */
export function useScrollAnimation(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    delay = 100
  } = options

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
          { threshold, rootMargin }
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
    }, delay)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [threshold, rootMargin, delay])

  return [sectionRef, isVisible]
}

