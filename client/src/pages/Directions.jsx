import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Directions.css'

function Directions() {
  const [copied, setCopied] = useState(false)
  const address = '서울시 강동구 선사로 58'

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('주소 복사 실패:', err)
    }
  }

  return (
    <div className="directions-page">
      <Header />
      <div className="directions-container">
        <h1 className="directions-title">오시는 길</h1>
        <p className="directions-subtitle">        </p>
        
        <div className="directions-content">
          <div className="directions-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3164.5!2d127.1209807!3d37.5437577!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca5574f3eb95f%3A0x34a8fb53f2dd20e7!2z7Lm07Yq47IKs7J207Iuc6rSA7Iuc7Iuc7J207Iuc!5e0!3m2!1sko!2skr!4v1735123456789!5m2!1sko!2skr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="창일침례교회 위치"
            ></iframe>
            <div className="map-link-container">
              <a 
                href="https://maps.app.goo.gl/EYMZoeD8TRpUoCxJ6" 
                target="_blank" 
                rel="noopener noreferrer"
                className="map-link-button"
              >
                Google 지도에서 크게 보기
              </a>
            </div>
          </div>
          
          <div className="directions-info">
            <div className="info-section">
              <h2 className="info-section-title">
                <svg className="info-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
                주소 (Address)
              </h2>
              <div className="info-address-wrapper">
                <p className="info-address">
                  서울시 강동구 선사로 58
                </p>
                <button 
                  className="copy-address-button"
                  onClick={handleCopyAddress}
                  title="주소 복사"
                >
                  {copied ? (
                    <svg className="copy-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg className="copy-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
                    </svg>
                  )}
                  <span className="copy-address-text">(주소복사하기)</span>
                </button>
              </div>
              {copied && (
                <div className="copy-toast-message">
                  주소가 클립보드에 복사되었습니다.
                </div>
              )}
              <div className="info-box">
                <h3 className="info-box-title">오시는 방법</h3>
                <ul className="info-list">
                  <li>네비게이션에 "창일침례교회" 검색하여 오세요.</li>
                  <li>본당은 건물 5층입니다.</li>
                </ul>
              </div>
            </div>

            <div className="info-section">
              <h2 className="info-section-title">
                <svg className="info-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" fill="currentColor"/>
                </svg>
                주차 (Parking)
              </h2>
              <ul className="info-list">
                <li>건물 내 주차장이 있습니다.</li>
                <li>교회 옆 천호유수지공영주차장에 주차하시면 편리합니다.</li>
                <li>주일예배 시 안내위원이 안내해드립니다.</li>
              </ul>
            </div>

            <div className="info-section">
              <h2 className="info-section-title">
                <svg className="info-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-4.5H4V6c0-.72.12-1.34.34-1.78C5.5 4.5 7.5 4.5 12 4.5s6.5 0 7.66.72c.22.44.34 1.06.34 1.78v6.5z" fill="currentColor"/>
                </svg>
                대중교통 (Public Transport)
              </h2>
              <h3 className="info-subtitle">지하철 (Subway)</h3>
              <ul className="info-list">
                <li>
                  <span className="subway-line subway-line-5">5</span>
                  <span className="subway-line subway-line-8">8</span>
                  천호역 2번출구 (도보 10분)
                </li>
              </ul>
              <h3 className="info-subtitle">버스 (Bus)</h3>
              <ul className="info-list">
                <li>
                  <span className="bus-number bus-number-blue">340</span>번,
                  <span className="bus-number bus-number-green">3318</span>번,
                  <span className="bus-number bus-number-green">3321</span>번 현대요양병원역 하차 (도보 5분)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Directions

