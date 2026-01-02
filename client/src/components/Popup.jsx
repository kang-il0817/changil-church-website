import { useState, useEffect } from 'react';
import './Popup.css';

function Popup() {
  const [popup, setPopup] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    fetchActivePopup();
  }, []);

  const fetchActivePopup = async () => {
    try {
      const response = await fetch('/api/popups/active');
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (data) {
        // localStorage에서 닫힌 팝업 ID와 시간 확인
        const closedPopupId = localStorage.getItem('closedPopupId');
        const closedPopupTime = localStorage.getItem('closedPopupTime');
        const now = Date.now();
        
        // 같은 팝업이고 12시간이 지나지 않았으면 표시하지 않음
        if (closedPopupId === data._id && closedPopupTime) {
          const timeUntilShow = parseInt(closedPopupTime) - now;
          if (timeUntilShow > 0) {
            // 아직 12시간이 지나지 않음
            return;
          }
        }
        
        setPopup(data);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('팝업을 불러오는 중 오류:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setIsClosed(true);
  };

  const handleDontShow12Hours = () => {
    setIsVisible(false);
    setIsClosed(true);
    // 팝업 ID와 시간을 localStorage에 저장하여 12시간 동안 보지 않기
    if (popup) {
      const now = Date.now();
      const twelveHoursLater = now + (12 * 60 * 60 * 1000); // 12시간 후
      localStorage.setItem('closedPopupId', popup._id);
      localStorage.setItem('closedPopupTime', twelveHoursLater.toString());
    }
  };

  const handleLinkClick = () => {
    if (popup && popup.linkUrl) {
      window.open(popup.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!popup || !isVisible || isClosed) {
    return null;
  }

  return (
    <div className="popup-overlay" onClick={handleClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        {popup.imageUrl && (
          <>
            <div className="popup-image-container">
              <img 
                src={popup.imageUrl} 
                alt={popup.title || '팝업 이미지'} 
                className="popup-image"
              />
            </div>
            <div className="popup-footer">
              <button 
                className="popup-dont-show-btn"
                onClick={handleDontShow12Hours}
              >
                12시간 동안 열지 않기
              </button>
              <button 
                className="popup-close-btn"
                onClick={handleClose}
              >
                닫기
              </button>
            </div>
          </>
        )}
        
        {!popup.imageUrl && (
          <div className="popup-content">
            {popup.title && (
              <h2 className="popup-title">{popup.title}</h2>
            )}
            {popup.linkUrl && (
              <button 
                className="popup-link-button"
                onClick={handleLinkClick}
              >
                {popup.linkText || '자세히 보기'}
              </button>
            )}
            <div className="popup-footer">
              <button 
                className="popup-dont-show-btn"
                onClick={handleDontShow12Hours}
              >
                12시간 동안 열지 않기
              </button>
              <button 
                className="popup-close-btn"
                onClick={handleClose}
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Popup;

