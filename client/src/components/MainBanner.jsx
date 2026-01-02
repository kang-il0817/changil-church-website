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
  const videoRefs = useRef([])

  // 동영상 로드 확인
  useEffect(() => {
    const checkVideos = async () => {
      const loaded = []
      
      for (const path of videoPaths) {
        try {
          const video = document.createElement('video')
          await new Promise((resolve, reject) => {
            video.oncanplaythrough = () => {
              loaded.push(path)
              resolve()
            }
            video.onerror = () => reject()
            video.src = path
            video.load()
            // 타임아웃 설정 (3초)
            setTimeout(() => reject(), 3000)
          })
        } catch {
          // 동영상 로드 실패 시 무시
        }
      }
      
      setLoadedVideos(loaded)
    }

    checkVideos()
  }, [])

  // 동영상 자동 재생 및 루프 설정
  useEffect(() => {
    if (videoRefs.current[currentIndex]) {
      const video = videoRefs.current[currentIndex]
      video.play().catch((error) => {
        // 동영상 자동 재생 실패 (프로덕션에서는 로그 제거)
      })
    }
  }, [currentIndex, loadedVideos.length])

  // 동영상이 끝나면 다음으로 이동 (여러 개일 경우)
  const handleVideoEnd = () => {
    if (loadedVideos.length > 1) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % loadedVideos.length)
    }
  }

  // 배너가 없으면 아무것도 표시하지 않음
  if (loadedVideos.length === 0) {
    return null
  }

  return (
    <section className="main-banner">
      <div className="banner-container">
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
                onEnded={handleVideoEnd}
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
