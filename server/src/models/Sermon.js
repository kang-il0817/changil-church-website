const mongoose = require('mongoose');

const sermonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['주일예배', '새벽기도', '특별영상'],
    required: true,
  },
  youtubeUrl: {
    type: String,
    required: true,
  },
  youtubeId: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    required: true,
  },
  customThumbnail: {
    type: String,
    default: '', // 커스텀 썸네일 이미지 경로 (예: /sermon-thumbnails/sunday1.jpg)
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Sermon', sermonSchema);

