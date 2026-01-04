import { useState, useEffect, useRef } from 'react'
import './MainBanner.css'

function MainBanner() {
  // 배너 동영상 경로 배열 (여러 개 지원)
  // 실제로 존재하는 동영상만 배열에 추가하세요
  // 지원 형식: .mp4, .webm, .ogg
  const videoPaths = [
    '/banner-video.mp4',
    // '/banner-video2.mp4', // 필요시 추가
  ]

  const [loadedVideos, setLoadedVideos] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const videoRefs = useRef([])

  // 동영상 로드 확인 - oncanplay 사용 (전체 로드 대신 재생 가능할 때)
  useEffect(() => {
    const checkVideos = async () => {
      const loaded = []
      
      for (const path of videoPaths) {
        try {
          const video = document.createElement('video')
          video.preload = 'metadata' // 메타데이터만 먼저 로드
          
          await new Promise((resolve, reject) => {
            // oncanplay: 재생 가능할 때 (전체 로드 대기하지 않음)
            video.oncanplay = () => {
              loaded.push(path)
              resolve()
            }
            video.onerror = () => reject()
            video.src = path
            video.load()
            // 타임아웃 설정 (10초로 증가 - 큰 파일 대응)
            setTimeout(() => reject(), 10000)
          })
        } catch {
          // 동영상 로드 실패 시 무시
        }
      }
      
      setLoadedVideos(loaded)
      setIsLoading(false)
    }

    checkVideos()
  }, [])

  // 동영상 자동 재생 및 루프 설정 (단순화된 버전)
  useEffect(() => {
    if (videoRefs.current[currentIndex] && loadedVideos.length > 0) {
      const video = videoRefs.current[currentIndex]
      
      // 비디오가 준비될 때까지 대기
      const tryPlay = async () => {
        // 비디오가 재생 가능한 상태인지 확인
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA 이상
          try {
            await video.play()
          } catch (error) {
            // 자동 재생 실패 시 여러 번 재시도
            const retryPlay = async (retries = 3) => {
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 500))
                try {
                  await video.play()
                } catch (e) {
                  await retryPlay(retries - 1)
                }
              }
            }
            await retryPlay()
          }
        } else {
          // 비디오가 아직 준비되지 않았으면 대기
          const handleReady = async () => {
            try {
              await video.play()
            } catch (error) {
              // 재생 실패는 정상 (모바일 브라우저 정책)
            }
          }
          video.addEventListener('loadeddata', handleReady, { once: true })
          video.addEventListener('canplay', handleReady, { once: true })
          video.addEventListener('canplaythrough', handleReady, { once: true })
        }
      }

      // 약간의 지연 후 재생 시도 (DOM 렌더링 완료 대기)
      const timeoutId = setTimeout(tryPlay, 200)
      
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [currentIndex, loadedVideos.length])

  // 사용자 상호작용 감지 (백업용 - 자동 재생 실패 시)
  useEffect(() => {
    let hasInteracted = false
    
    const handleUserInteraction = async () => {
      if (!hasInteracted && videoRefs.current[currentIndex]) {
        hasInteracted = true
        const video = videoRefs.current[currentIndex]
        if (video.paused) {
          try {
            await video.play()
          } catch (error) {
            // 재생 실패는 정상
          }
        }
      }
    }

    // 다양한 사용자 상호작용 이벤트 리스너 추가
    const events = ['touchstart', 'touchend', 'click', 'scroll']
    events.forEach(event => {
      window.addEventListener(event, handleUserInteraction, { passive: true })
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserInteraction)
      })
    }
  }, [currentIndex])

  // 동영상이 끝나면 다음으로 이동 (여러 개일 경우)
  const handleVideoEnd = () => {
    if (loadedVideos.length > 1) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % loadedVideos.length)
    }
  }

  // 배너가 없으면 아무것도 표시하지 않음
  if (loadedVideos.length === 0 && !isLoading) {
    return null
  }

  return (
    <section className="main-banner">
      <div className="banner-container">
        {isLoading && (
          <div className="banner-loading">
            <div className="banner-loading-spinner"></div>
          </div>
        )}
        <div className="banner-slider">
          {loadedVideos.map((videoPath, index) => (
            <div key={index} className="banner-slide">
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={videoPath}
                className="banner-video"
                autoPlay
                muted
                loop={loadedVideos.length === 1} // 동영상이 1개일 때만 루프
                playsInline
                preload="auto" // 자동 프리로드
                onEnded={handleVideoEnd}
                onLoadedData={() => {
                  // 비디오 데이터가 로드되면 재생 시도
                  if (videoRefs.current[index] && index === currentIndex) {
                    videoRefs.current[index].play().catch(() => {
                      // 자동 재생 실패는 정상 (모바일 브라우저 정책)
                    })
                  }
                }}
                aria-label={`창일교회 배너 동영상 ${index + 1}`}
              >
                브라우저가 동영상 태그를 지원하지 않습니다.
              </video>
              {/* 텍스트 오버레이 */}
              <div className="banner-text-overlay">
                <div className="banner-text-line banner-text-line-1">
                  성령의 능력 안에 있는 하나님 나라 공동체
                </div>
                <div className="banner-text-line banner-text-line-2">
                  창일교회에 오신 것을 환영합니다.
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MainBanner
