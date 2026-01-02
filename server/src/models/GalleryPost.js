const mongoose = require('mongoose');

const galleryPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  thumbnail: {
    type: String,
    required: true, // 대표 이미지 (목록에서 표시)
  },
  sections: [{
    type: {
      type: String,
      enum: ['text', 'image-grid'],
      required: true,
    },
    content: {
      type: String,
      default: '', // type이 'text'일 때
    },
    images: [{
      type: String,
      default: [], // type이 'image-grid'일 때
    }],
    gridType: {
      type: String,
      enum: ['4-grid', '6-grid'],
      default: '4-grid', // type이 'image-grid'일 때
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// 날짜 기준 내림차순 정렬 인덱스
galleryPostSchema.index({ date: -1 });

module.exports = mongoose.model('GalleryPost', galleryPostSchema);

