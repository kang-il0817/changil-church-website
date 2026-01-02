const mongoose = require('mongoose');

const bulletinSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imageUrls: {
    type: [String],
    required: true, // Supabase Storage URL 배열 (최대 2개)
    validate: {
      validator: function(v) {
        return v.length > 0 && v.length <= 2;
      },
      message: '이미지는 1개 이상 2개 이하여야 합니다.'
    }
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  order: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// 날짜 기준 내림차순 정렬 인덱스
bulletinSchema.index({ date: -1 });

module.exports = mongoose.model('Bulletin', bulletinSchema);

