const mongoose = require('mongoose');

const popupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '', // 텍스트 내용
  },
  imageUrl: {
    type: String,
    default: '', // 이미지 URL (선택사항)
  },
  linkUrl: {
    type: String,
    default: '', // 클릭 시 이동할 링크 (선택사항)
  },
  linkText: {
    type: String,
    default: '자세히 보기', // 링크 버튼 텍스트
  },
  isActive: {
    type: Boolean,
    default: true, // 활성화 여부
  },
  startDate: {
    type: Date,
    default: Date.now, // 시작 날짜
  },
  endDate: {
    type: Date,
    default: null, // 종료 날짜 (null이면 무제한)
  },
  order: {
    type: Number,
    default: 0, // 표시 순서
  },
}, {
  timestamps: true,
});

// 활성화된 팝업 조회를 위한 인덱스
popupSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Popup', popupSchema);

