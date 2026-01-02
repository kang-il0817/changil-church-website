import { useState, useEffect } from 'react'
import Header from './components/Header'
import MainBanner from './components/MainBanner'
import SermonVideoSection from './components/SermonVideoSection'
import ChurchCards from './components/ChurchCards'
import EventSection from './components/EventSection'
import ChangilWindow from './components/ChangilWindow'
import Footer from './components/Footer'
import Popup from './components/Popup'
import Admin from './pages/Admin'
import Login from './pages/Login'
import SermonDetail from './pages/SermonDetail'
import ChurchIntro from './pages/ChurchIntro'
import Directions from './pages/Directions'
import Bulletin from './pages/Bulletin'
import BulletinDetail from './pages/BulletinDetail'
import WorshipGuide from './pages/WorshipGuide'
import NewFamilyVisit from './pages/NewFamilyVisit'
import GalleryList from './pages/GalleryList'
import GalleryPost from './pages/GalleryPost'
import EventList from './pages/EventList'
import ComingSoon from './pages/ComingSoon'
import DonationReceipt from './pages/DonationReceipt'
import './App.css'

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }

    // 브라우저 뒤로/앞으로 버튼 처리
    window.addEventListener('popstate', handleLocationChange)
    
    // 전역 navigate 함수 설정
    window.navigate = (path) => {
      window.history.pushState({}, '', path)
      setCurrentPath(path)
    }
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      delete window.navigate
    }
  }, [])

  // 로그인 페이지
  if (currentPath === '/login') {
    return <Login />
  }

  // 관리자 페이지 - 로그인 확인
  if (currentPath === '/admin') {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    const loginTime = localStorage.getItem('adminLoginTime')
    
    // 로그인하지 않았거나 24시간이 지났으면 로그인 페이지로 리다이렉트
    if (!isLoggedIn || !loginTime) {
      if (window.navigate) {
        window.navigate('/login')
      } else {
        window.location.href = '/login'
      }
      return null
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
      return null
    }
    
    return <Admin />
  }

  // 교회소개 페이지
  if (currentPath === '/church-intro') {
    return <ChurchIntro />
  }

  // 오시는 길 페이지
  if (currentPath === '/directions') {
    return <Directions />
  }

  // 주보 상세 페이지
  const bulletinMatch = currentPath.match(/^\/bulletin\/(.+)$/)
  if (bulletinMatch) {
    return <BulletinDetail id={bulletinMatch[1]} />
  }

  // 주보 페이지
  if (currentPath === '/bulletin') {
    return <Bulletin />
  }

  // 예배안내 페이지
  if (currentPath === '/worship-guide') {
    return <WorshipGuide />
  }

  // 새가족 방문 페이지
  if (currentPath === '/new-family-visit') {
    return <NewFamilyVisit />
  }

  // 설교 상세 페이지
  const sermonMatch = currentPath.match(/^\/sermon\/(.+)$/)
  if (sermonMatch) {
    return <SermonDetail id={sermonMatch[1]} />
  }

  // 갤러리 상세 페이지
  const galleryMatch = currentPath.match(/^\/gallery\/(.+)$/)
  if (galleryMatch) {
    return <GalleryPost id={galleryMatch[1]} />
  }

  // 갤러리 목록 페이지
  if (currentPath === '/gallery') {
    return <GalleryList />
  }

  // 행사 목록 페이지
  if (currentPath === '/events') {
    return <EventList />
  }

  // 준비중 페이지
  if (currentPath === '/coming-soon') {
    return <ComingSoon />
  }

  // 연말정산 신청 페이지
  if (currentPath === '/donation-receipt') {
    return <DonationReceipt />
  }

  // 메인 페이지
  return (
    <div className="App">
      <Popup />
      <Header />
      <MainBanner />
      <main>
        <div id="worship">
          <SermonVideoSection />
        </div>
        <div id="welcome">
          <ChurchCards />
        </div>
        <div id="together">
          <EventSection />
        </div>
        <div id="live">
          <ChangilWindow />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
