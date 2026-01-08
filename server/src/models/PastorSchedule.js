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
    default: '#718096', // 기본 회색 (R 113, G 128, B 150)
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

