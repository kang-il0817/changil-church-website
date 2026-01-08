const mongoose = require('mongoose');

const pastorScheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    default: null, // null이면 하루짜리 이벤트
  },
  description: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#ff6b35', // 기본 오렌지색
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PastorSchedule', pastorScheduleSchema);

