const express = require('express');
const router = express.Router();
const pastorScheduleController = require('../controllers/pastorScheduleController');

// 모든 목회일정 가져오기
router.get('/', pastorScheduleController.getAllPastorSchedules);

// 목회일정 생성
router.post('/', pastorScheduleController.createPastorSchedule);

// 목회일정 업데이트
router.put('/:id', pastorScheduleController.updatePastorSchedule);

// 목회일정 삭제
router.delete('/:id', pastorScheduleController.deletePastorSchedule);

module.exports = router;

