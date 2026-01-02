const express = require('express');
const router = express.Router();
const popupController = require('../controllers/popupController');

// 활성화된 팝업 가져오기 (메인 페이지용)
router.get('/active', popupController.getActivePopup);

// 모든 팝업 가져오기 (관리자 페이지용)
router.get('/', popupController.getAllPopups);

// 특정 팝업 가져오기
router.get('/:id', popupController.getPopupById);

// 팝업 생성
router.post('/', popupController.createPopup);

// 팝업 업데이트
router.put('/:id', popupController.updatePopup);

// 팝업 삭제
router.delete('/:id', popupController.deletePopup);

module.exports = router;

