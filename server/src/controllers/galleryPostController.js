const GalleryPost = require('../models/GalleryPost');

// 모든 갤러리 포스트 가져오기 (목록용) - 게시 순서대로 정렬 (최신순)
exports.getAllGalleryPosts = async (req, res) => {
  try {
    const posts = await GalleryPost.find({ isActive: true })
      .sort({ createdAt: -1 }); // 생성 날짜 기준 최신순
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 최신 포스트만 가져오기 (메인 페이지용 - 첫 번째 사진과 제목) - 게시 순서대로 정렬
exports.getLatestGalleryPosts = async (req, res) => {
  try {
    const posts = await GalleryPost.find({ isActive: true })
      .sort({ createdAt: -1 }) // 생성 날짜 기준 최신순
      .limit(3); // 최대 3개
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 특정 포스트 가져오기 (상세 페이지용)
exports.getGalleryPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await GalleryPost.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: '갤러리 포스트를 찾을 수 없습니다.' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 갤러리 포스트 생성
exports.createGalleryPost = async (req, res) => {
  try {
    const { title, date, thumbnail, sections, order } = req.body;

    if (!title || !thumbnail) {
      return res.status(400).json({ 
        message: '제목과 대표 이미지는 필수입니다.' 
      });
    }

    const post = new GalleryPost({
      title,
      date: date ? new Date(date) : new Date(),
      thumbnail,
      sections: sections || [],
      order: order || 0,
      isActive: true,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('갤러리 포스트 생성 오류:', error);
    res.status(500).json({ 
      message: error.message || '갤러리 포스트 생성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 갤러리 포스트 업데이트
exports.updateGalleryPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, thumbnail, sections, order, isActive } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (date !== undefined) updateData.date = new Date(date);
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (sections !== undefined) updateData.sections = sections;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const post = await GalleryPost.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: '갤러리 포스트를 찾을 수 없습니다.' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 갤러리 포스트 삭제
exports.deleteGalleryPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await GalleryPost.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({ message: '갤러리 포스트를 찾을 수 없습니다.' });
    }

    res.json({ message: '갤러리 포스트가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

