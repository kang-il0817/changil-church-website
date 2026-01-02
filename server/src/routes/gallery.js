const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

// 모든 갤러리 이미지 가져오기
router.get('/', galleryController.getAllGalleryImages);

// 그룹별 첫 번째 이미지만 가져오기 (메인 페이지용)
router.get('/groups', galleryController.getGalleryGroups);

// 특정 제목의 모든 이미지 가져오기
router.get('/title/:title', galleryController.getImagesByTitle);

// 갤러리 이미지 생성
router.post('/', galleryController.createGalleryImage);

// 갤러리 이미지 업데이트
router.put('/:id', galleryController.updateGalleryImage);

// 갤러리 이미지 삭제
router.delete('/:id', galleryController.deleteGalleryImage);

module.exports = router;

