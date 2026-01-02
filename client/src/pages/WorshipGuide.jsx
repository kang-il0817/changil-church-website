import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './WorshipGuide.css'

function WorshipGuide() {
  // URL 파라미터에서 탭 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab === 'offering') {
      setActiveTab('offering')
    }
  }, [])

  const [activeTab, setActiveTab] = useState('worship') // 'worship' 또는 'offering'
  const worshipPrograms = [
    {
      id: 1,
      title: '주일예배',
      time: '1부: 주일 오전 9:30 | 2부: 주일 오전 11:00',
      location: '5층 본당',
      description: [
        '하나님께서는 영과 진리로 예배하는 자를 찾으십니다.',
        '하나님의 임재와 진리의 말씀으로 충만한 예배, 창일교회가 꿈꾸는 예배입니다.'
      ]
    },
    {
      id: 2,
      title: '목장 모임(소그룹)',
      time: '주일 오후 2:00',
      location: '목장별 장소',
      description: [
        '창일교회의 주일 예배는 목장모임으로 완성됩니다.',
        '목장 모임을 통해 영적 공동체를 경험해보세요.'
      ]
    },
    {
      id: 3,
      title: '새벽기도회',
      time: '월-금요일 오전 5:30',
      location: '5층 본당',
      description: '새벽말씀은 <매일성경> 본문으로 진행합니다.'
    },
    {
      id: 4,
      title: '금요기도회',
      time: '금요일 저녁 8:30',
      location: '5층 본당',
      description: [
        '성령 안에서 마음을 쏟아놓으며 뜨겁게 기도하는 시간입니다.',
        '현장 금요기도회는 2. 4주에 모이며',
        '1. 3. 5주는 Zoom 금요기도회로 진행됩니다.'
      ]
    },
    {
      id: 5,
      title: '유아유치부',
      time: '주일 오전 11:00',
      location: '4층 상담실',
      description: null
    },
    {
      id: 6,
      title: '유초등부',
      time: '주일 오전 11:00',
      location: '4층 초등부실',
      description: null
    },
    {
      id: 7,
      title: '청소년부',
      time: '주일 오전 11:00',
      location: '6층 청소년부실',
      description: null
    },
    {
      id: 8,
      title: '수요성경공부',
      time: '수요일 오후 8:00',
      location: '6층 청소년부실',
      description: [
        '성경을 책 별로 깊이 있게 공부하는 시간입니다.',
        '개강시 공지합니다.'
      ]
    }
  ]

  const handleCopyAccount = (accountNumber) => {
    navigator.clipboard.writeText(accountNumber).then(() => {
      alert('계좌번호가 복사되었습니다.')
    }).catch(() => {
      // 클립보드 복사 실패 시 대체 방법
      const textArea = document.createElement('textarea')
      textArea.value = accountNumber
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('계좌번호가 복사되었습니다.')
    })
  }

  return (
    <div className="worship-guide-page">
      <Header />
      <div className="worship-guide-container">
        <div className="worship-guide-header">
          <h1 className="worship-guide-title">예배안내</h1>
        </div>
        
        {/* 탭 메뉴 */}
        <div className="worship-tabs">
          <button 
            className={`worship-tab ${activeTab === 'worship' ? 'active' : ''}`}
            onClick={() => setActiveTab('worship')}
          >
            예배시간
          </button>
          <button 
            className={`worship-tab ${activeTab === 'offering' ? 'active' : ''}`}
            onClick={() => setActiveTab('offering')}
          >
            헌금안내
          </button>
        </div>

        {/* 예배시간 탭 내용 */}
        {activeTab === 'worship' && (
          <div className="worship-guide-content">
            {worshipPrograms.map((program, index) => (
              <div key={program.id} className="worship-section">
                <h2 className="worship-section-title">{program.title}</h2>
                <div className="worship-section-details">
                  <div className="worship-time-location">
                    <span className="worship-time">{program.time}</span>
                    {program.location && (
                      <span className="worship-location">장소: {program.location}</span>
                    )}
                  </div>
                  {program.description && (
                    <div className="worship-description">
                      {Array.isArray(program.description) ? (
                        program.description.map((paragraph, idx) => (
                          <p key={idx} className="worship-description-paragraph">{paragraph}</p>
                        ))
                      ) : (
                        <p className="worship-description-paragraph">{program.description}</p>
                      )}
                    </div>
                  )}
                </div>
                {index < worshipPrograms.length - 1 && <div className="worship-divider"></div>}
              </div>
            ))}
          </div>
        )}

        {/* 헌금안내 탭 내용 */}
        {activeTab === 'offering' && (
          <div className="offering-content">
            <h2 className="offering-title">헌금안내</h2>
            <div className="offering-description">
              <p>예배 중 헌금시간이 따로 없습니다. 헌금은 들어오실 때 헌금함에 넣어주세요.</p>
              <p>이외에 온라인 헌금을 원하시면 계좌번호를 복사하여 헌금을 해주세요.</p>
            </div>
            
            <div className="offering-accounts">
              <div className="offering-account-box">
                <div className="offering-account-type">일반헌금</div>
                <div className="offering-account-number">국민은행 866401-04-083897</div>
                <button 
                  className="offering-copy-button"
                  onClick={() => handleCopyAccount('866401-04-083897')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  복사하기
                </button>
              </div>

              <div className="offering-account-box">
                <div className="offering-account-type">미래적립헌금</div>
                <div className="offering-account-note">(창일교회 미래를 위한 적립금입니다)</div>
                <div className="offering-account-number">신한투자증권 041-11-275519</div>
                <button 
                  className="offering-copy-button"
                  onClick={() => handleCopyAccount('041-11-275519')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  복사하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default WorshipGuide

