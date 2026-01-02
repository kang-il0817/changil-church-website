const express = require('express');
const router = express.Router();
const sermonController = require('../controllers/sermonController');

// 모든 설교 가져오기
router.get('/', sermonController.getAllSermons);

// 타입별 설교 가져오기
router.get('/type/:type', sermonController.getSermonsByType);

// 설교 생성
router.post('/', sermonController.createSermon);

// 설교 업데이트
router.put('/:id', sermonController.updateSermon);

// 설교 삭제
router.delete('/:id', sermonController.deleteSermon);

module.exports = router;

