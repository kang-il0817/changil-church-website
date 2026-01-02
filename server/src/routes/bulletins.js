const express = require('express');
const router = express.Router();
const bulletinController = require('../controllers/bulletinController');

// 모든 주보 가져오기
router.get('/', bulletinController.getAllBulletins);

// 최신 주보 1개 가져오기
router.get('/latest', bulletinController.getLatestBulletin);

// 특정 주보 가져오기
router.get('/:id', bulletinController.getBulletinById);

// 주보 생성
router.post('/', bulletinController.createBulletin);

// 주보 업데이트
router.put('/:id', bulletinController.updateBulletin);

// 주보 삭제
router.delete('/:id', bulletinController.deleteBulletin);

// 주보 조회수 증가
router.post('/:id/view', bulletinController.incrementViews);

module.exports = router;

