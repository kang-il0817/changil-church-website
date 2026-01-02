const Gallery = require('../models/Gallery');

// 모든 갤러리 이미지 가져오기
exports.getAllGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(10); // 최대 10개만 표시
    
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 그룹별 첫 번째 이미지만 가져오기 (메인 페이지용)
exports.getGalleryGroups = async (req, res) => {
  try {
    // 모든 활성 이미지 가져오기
    const allImages = await Gallery.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });

    // title별로 그룹화하고 각 그룹의 첫 번째 이미지만 선택
    const groupMap = new Map();
    
    allImages.forEach(image => {
      const groupKey = image.title || '제목 없음';
      
      // 같은 제목의 이미지가 아직 없으면 추가
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, image);
      }
    });

    // Map을 배열로 변환하고 최대 3개만 반환
    const groupedImages = Array.from(groupMap.values()).slice(0, 3);
    
    res.json(groupedImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 특정 제목의 모든 이미지 가져오기
exports.getImagesByTitle = async (req, res) => {
  try {
    const { title } = req.params;
    
    const images = await Gallery.find({ 
      isActive: true,
      title: decodeURIComponent(title)
    })
      .sort({ order: 1, createdAt: -1 });
    
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 갤러리 이미지 생성
exports.createGalleryImage = async (req, res) => {
  try {
    const { imageUrl, title, description, order } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ 
        message: '이미지 URL은 필수입니다.' 
      });
    }

    const gallery = new Gallery({
      imageUrl,
      title: title || '',
      description: description || '',
      order: order || 0,
      isActive: true,
    });

    await gallery.save();
    res.status(201).json(gallery);
  } catch (error) {
    console.error('갤러리 이미지 생성 오류:', error);
    res.status(500).json({ 
      message: error.message || '갤러리 이미지 생성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 갤러리 이미지 업데이트
exports.updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, title, description, order, isActive } = req.body;

    const updateData = {};
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const gallery = await Gallery.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!gallery) {
      return res.status(404).json({ message: '갤러리 이미지를 찾을 수 없습니다.' });
    }

    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 갤러리 이미지 삭제
exports.deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findByIdAndDelete(id);

    if (!gallery) {
      return res.status(404).json({ message: '갤러리 이미지를 찾을 수 없습니다.' });
    }

    res.json({ message: '갤러리 이미지가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

