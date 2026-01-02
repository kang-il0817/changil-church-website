import Header from '../components/Header'
import Footer from '../components/Footer'
import './ComingSoon.css'

function ComingSoon() {
  return (
    <div className="coming-soon-page">
      <Header />
      <div className="coming-soon-container">
        <div className="coming-soon-content">
          <h1 className="coming-soon-title">준비중입니다</h1>
          <p className="coming-soon-message">곧 만나요!</p>
          <button 
            className="coming-soon-button"
            onClick={() => {
              if (window.navigate) {
                window.navigate('/')
              } else {
                window.location.href = '/'
              }
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ComingSoon

