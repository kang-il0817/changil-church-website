const mongoose = require('mongoose');

const donationReceiptSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['개인', '법인'],
    required: true,
  },
  // 개인 정보
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  residentNumber: {
    type: String,
    default: '', // 개인일 때만 사용, 암호화 필요
  },
  address: {
    type: String,
    default: '', // 개인일 때만 사용
  },
  // 법인 정보
  corporateName: {
    type: String,
    default: '', // 법인일 때만 사용
  },
  businessRegistrationFile: {
    type: String,
    default: '', // 법인일 때만 사용 (파일 URL)
  },
  otherRequests: {
    type: String,
    default: '', // 기타 요청사항
  },
  status: {
    type: String,
    enum: ['대기', '처리중', '완료', '거부'],
    default: '대기',
  },
  notes: {
    type: String,
    default: '', // 관리자 메모
  },
}, {
  timestamps: true,
});

// 날짜 기준 내림차순 정렬 인덱스
donationReceiptSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DonationReceipt', donationReceiptSchema);

