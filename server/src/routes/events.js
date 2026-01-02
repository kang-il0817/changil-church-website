const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// 모든 행사 포스터 가져오기
router.get('/', eventController.getAllEvents);

// 행사 포스터 생성
router.post('/', eventController.createEvent);

// 행사 포스터 업데이트
router.put('/:id', eventController.updateEvent);

// 행사 포스터 삭제
router.delete('/:id', eventController.deleteEvent);

module.exports = router;

