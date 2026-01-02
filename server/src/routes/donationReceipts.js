const express = require('express');
const router = express.Router();
const donationReceiptController = require('../controllers/donationReceiptController');

// 모든 신청 내역 가져오기 (관리자 페이지용)
router.get('/', donationReceiptController.getAllDonationReceipts);

// 특정 신청 내역 가져오기
router.get('/:id', donationReceiptController.getDonationReceiptById);

// 신청 내역 생성
router.post('/', donationReceiptController.createDonationReceipt);

// 신청 내역 업데이트
router.put('/:id', donationReceiptController.updateDonationReceipt);

// 신청 내역 삭제
router.delete('/:id', donationReceiptController.deleteDonationReceipt);

module.exports = router;

