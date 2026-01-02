const express = require('express');
const router = express.Router();
const galleryPostController = require('../controllers/galleryPostController');

// 모든 갤러리 포스트 가져오기 (목록용)
router.get('/', galleryPostController.getAllGalleryPosts);

// 최신 포스트만 가져오기 (메인 페이지용)
router.get('/latest', galleryPostController.getLatestGalleryPosts);

// 특정 포스트 가져오기 (상세 페이지용)
router.get('/:id', galleryPostController.getGalleryPostById);

// 갤러리 포스트 생성
router.post('/', galleryPostController.createGalleryPost);

// 갤러리 포스트 업데이트
router.put('/:id', galleryPostController.updateGalleryPost);

// 갤러리 포스트 삭제
router.delete('/:id', galleryPostController.deleteGalleryPost);

module.exports = router;

