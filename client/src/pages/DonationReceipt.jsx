import { useState } from 'react';
import { supabase, GALLERY_BUCKET } from '../lib/supabase';
import { optimizeImage } from '../utils/imageOptimizer';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './DonationReceipt.css';

function DonationReceipt() {
  const [type, setType] = useState('개인'); // '개인' or '법인'
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    residentNumber: '',
    address: '',
    corporateName: '',
    businessRegistrationFile: null,
  });
  const [businessRegistrationPreview, setBusinessRegistrationPreview] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleContactChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 3 && value.length <= 7) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 7) {
      value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
    }
    setFormData({ ...formData, contact: value });
  };

  const handleResidentNumberChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    // 앞자리만 입력 (6자리)
    if (value.length > 6) value = value.slice(0, 6);
    setFormData({ ...formData, residentNumber: value });
  };

  const handleBusinessRegistrationSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (!isImage && !isPDF) {
      setMessage({ type: 'error', text: '이미지 파일 또는 PDF 파일만 업로드할 수 있습니다.' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: '파일 크기는 10MB 이하여야 합니다.' });
      return;
    }

    try {
      let fileToUpload = file;
      if (isImage) {
        // 이미지인 경우 최적화
        fileToUpload = await optimizeImage(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
        });
      }

      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `donation-receipts/${fileName}`;

      const { data, error } = await supabase.storage
        .from(GALLERY_BUCKET)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(GALLERY_BUCKET)
        .getPublicUrl(filePath);

      setFormData({ ...formData, businessRegistrationFile: urlData.publicUrl });

      // 미리보기 (이미지인 경우만)
      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBusinessRegistrationPreview(reader.result);
        };
        reader.readAsDataURL(fileToUpload);
      } else {
        setBusinessRegistrationPreview(null);
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      setMessage({ type: 'error', text: '파일 업로드에 실패했습니다.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!agreed) {
      setMessage({ type: 'error', text: '고유식별정보 수집 및 이용 약관에 동의해주세요.' });
      return;
    }

    // 개인일 때 필수 필드 확인
    if (type === '개인') {
      if (!formData.name || !formData.contact || !formData.email || !formData.residentNumber || !formData.address) {
        setMessage({ type: 'error', text: '모든 필수 항목을 입력해주세요.' });
        return;
      }
    }

    // 법인일 때 필수 필드 확인
    if (type === '법인') {
      if (!formData.name || !formData.contact || !formData.email || !formData.corporateName || !formData.businessRegistrationFile) {
        setMessage({ type: 'error', text: '모든 필수 항목을 입력해주세요.' });
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/donation-receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          name: formData.name,
          contact: formData.contact,
          email: formData.email,
          residentNumber: type === '개인' ? formData.residentNumber : '',
          address: type === '개인' ? formData.address : '',
          corporateName: type === '법인' ? formData.corporateName : '',
          businessRegistrationFile: type === '법인' ? formData.businessRegistrationFile : '',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '신청이 완료되었습니다. 감사합니다.' });
        // 폼 초기화
        setFormData({
          name: '',
          contact: '',
          email: '',
          residentNumber: '',
          address: '',
          corporateName: '',
          businessRegistrationFile: null,
        });
        setBusinessRegistrationPreview(null);
        setAgreed(false);
      } else {
        setMessage({ type: 'error', text: data.message || '신청 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버에 연결할 수 없습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="donation-receipt-page">
      <Header />
      <div className="donation-receipt-container">
        <div className="donation-receipt-card">
          <h1 className="donation-receipt-title">기부금 영수증 신청(연말정산)</h1>
          <p className="donation-receipt-subtitle">2025년도 기부금 영수증 발급을 위한 정보를 입력해주세요.</p>

          {/* 탭 버튼 */}
          <div className="donation-receipt-tabs">
            <button
              className={`donation-receipt-tab ${type === '개인' ? 'active' : ''}`}
              onClick={() => {
                setType('개인');
                setFormData({
                  ...formData,
                  corporateName: '',
                  businessRegistrationFile: null,
                });
                setBusinessRegistrationPreview(null);
              }}
            >
              개인 발급
            </button>
            <button
              className={`donation-receipt-tab ${type === '법인' ? 'active' : ''}`}
              onClick={() => {
                setType('법인');
                setFormData({
                  ...formData,
                  residentNumber: '',
                  address: '',
                });
              }}
            >
              법인 발급
            </button>
          </div>

          {/* 메시지 표시 */}
          {message.text && (
            <div className={`donation-receipt-message ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="donation-receipt-form">
            <div className="form-group">
              <label htmlFor="name">성함 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact">연락처 *</label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleContactChange}
                placeholder="010-0000-0000"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일 *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <small className="form-note">
                * 신청하신 연말정산은 이메일로 발송됩니다.
              </small>
            </div>

            {type === '개인' ? (
              <>
                <div className="form-group">
                  <label htmlFor="residentNumber">주민등록번호 앞자리 *</label>
                  <input
                    type="text"
                    id="residentNumber"
                    name="residentNumber"
                    value={formData.residentNumber}
                    onChange={handleResidentNumberChange}
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                  <small className="form-note">
                    * 국세청 간소화 서비스 등록을 위해 주민등록번호 앞자리만 필요합니다. 암호화되어 관리자만 열람 가능합니다.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="address">주소 *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="corporateName">법인명 *</label>
                  <input
                    type="text"
                    id="corporateName"
                    name="corporateName"
                    value={formData.corporateName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="businessRegistration">사업자등록증 *</label>
                  <p className="form-description">사업자등록증 파일을 업로드해주세요. (이미지 또는 PDF)</p>
                  <input
                    type="file"
                    id="businessRegistration"
                    accept="image/*,application/pdf"
                    onChange={handleBusinessRegistrationSelect}
                    required={type === '법인'}
                  />
                  {businessRegistrationPreview && (
                    <div className="file-preview">
                      <img src={businessRegistrationPreview} alt="사업자등록증 미리보기" />
                    </div>
                  )}
                  {formData.businessRegistrationFile && !businessRegistrationPreview && (
                    <div className="file-preview">
                      <div className="pdf-preview">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p>PDF 파일이 업로드되었습니다.</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 약관 동의 */}
            <div className="form-group agreement-group">
              <div className="agreement-box">
                <label className="agreement-label">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    required
                  />
                  <span>고유식별정보 수집 및 이용 약관에 동의합니다.</span>
                </label>
                <button
                  type="button"
                  className="view-terms-button"
                  onClick={() => setShowTerms(true)}
                >
                  내용보기
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={submitting || !agreed}
            >
              {submitting ? '신청 중...' : '신청하기'}
            </button>
          </form>
        </div>
      </div>

      {/* 약관 모달 */}
      {showTerms && (
        <div className="terms-modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="terms-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="terms-modal-close" onClick={() => setShowTerms(false)}>×</button>
            <h2>고유식별정보 수집 및 이용 약관</h2>
            <div className="terms-content">
              <h3>1. 수집하는 개인정보의 항목 및 수집 방법</h3>
              <h4>1) 개인정보 수집항목</h4>
              <p>① 개인회원: 이름, 주민등록번호, 주소, 휴대전화번호, 이메일</p>
              <p>만 14세 미만의 경우 법정대리인 정보</p>
              <p>② 기업회원: 기업명, 사업자등록번호, 대표자명, 연락처, 이메일</p>
              <h4>2) 개인정보 수집 방법</h4>
              <p>기부금영수증 신청 웹사이트를 통한 회원가입, 전화, 서면, 이메일, 팩스 등</p>

              <h3>2. 개인정보의 수집 및 이용 목적</h3>
              <p>창일교회는 수집한 개인정보를 다음의 목적으로 이용합니다.</p>
              <p><strong>회원 관리:</strong> 웹사이트 이용에 따른 본인확인, 개인 식별</p>
              <p><strong>후원 관리:</strong> 후원자의 기부금 납부 증명서 발급 및 후원자 관리, 후원 가입 신청 시 후원자 안내 발송, 연말정산 간소화 신고, 국세청 전자기부금 영수증 발급을 위한 기능 제공</p>

              <h3>3. 개인정보의 보유 및 이용기간</h3>
              <p>재정국에 개인정보 제공 철회를 위한 의사 전달 시까지</p>
            </div>
            <button className="terms-modal-close-button" onClick={() => setShowTerms(false)}>닫기</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default DonationReceipt;

