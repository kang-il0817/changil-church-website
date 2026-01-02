// 이미지 최적화 유틸리티
// browser-image-compression 라이브러리를 사용하여 이미지를 자동으로 최적화합니다.

let imageCompression = null;

// 동적 import를 사용하여 라이브러리가 없어도 오류가 발생하지 않도록 함
const loadImageCompression = async () => {
  if (imageCompression) return imageCompression;
  
  try {
    imageCompression = await import('browser-image-compression');
    return imageCompression;
  } catch (error) {
    console.warn('browser-image-compression 라이브러리를 찾을 수 없습니다. 이미지 최적화를 건너뜁니다.');
    return null;
  }
};

/**
 * 이미지를 최적화합니다.
 * @param {File} file - 최적화할 이미지 파일
 * @param {Object} options - 최적화 옵션
 * @returns {Promise<File>} 최적화된 이미지 파일
 */
export const optimizeImage = async (file, options = {}) => {
  const compression = await loadImageCompression();
  
  if (!compression) {
    // 라이브러리가 없으면 원본 파일 반환
    return file;
  }

  const defaultOptions = {
    maxSizeMB: 1, // 최대 파일 크기 (MB)
    maxWidthOrHeight: 1920, // 최대 너비 또는 높이
    useWebWorker: true, // 웹 워커 사용
    fileType: file.type, // 원본 파일 타입 유지
  };

  const compressionOptions = { ...defaultOptions, ...options };

  try {
    const compressedFile = await compression.default(file, compressionOptions);
    // 이미지 최적화 완료 (프로덕션에서는 로그 제거)
    return compressedFile;
  } catch (error) {
    console.error('이미지 최적화 실패:', error);
    // 최적화 실패 시 원본 파일 반환
    return file;
  }
};


