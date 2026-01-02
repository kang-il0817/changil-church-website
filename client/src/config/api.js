// API URL 설정
const API_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (path) => {
  // 프로덕션 환경에서 API URL이 설정되어 있으면 사용
  if (API_URL && import.meta.env.PROD) {
    return `${API_URL}${path}`;
  }
  // 개발 환경에서는 상대 경로 사용 (Vite 프록시 활용)
  return path;
};

