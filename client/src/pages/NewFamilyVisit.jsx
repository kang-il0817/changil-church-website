import Header from '../components/Header'
import Footer from '../components/Footer'
import './NewFamilyVisit.css'

function NewFamilyVisit() {
  // Google Forms URL을 iframe embed 형식으로 변환
  const formId = '1FAIpQLSfACrLDMbiAD9zBHHEaLZeZm6GQn0kVjFW8Zh0jt8xmkdZF-A'
  const embedUrl = `https://docs.google.com/forms/d/e/${formId}/viewform?embedded=true`

  return (
    <div className="new-family-visit-page">
      <Header />
      <div className="new-family-visit-container">
        <h1 className="new-family-visit-title">새가족 방문</h1>
        <div className="new-family-visit-content">
          <div className="form-wrapper">
            <iframe
              src={embedUrl}
              className="google-form-iframe"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              title="새가족 방문 신청서"
            >
              로딩 중...
            </iframe>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default NewFamilyVisit

