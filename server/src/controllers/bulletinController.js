const Bulletin = require('../models/Bulletin');

// 모든 주보 가져오기 (최신순)
exports.getAllBulletins = async (req, res) => {
  try {
    const bulletins = await Bulletin.find()
      .sort({ date: -1, order: -1 })
      .exec();
    res.json(bulletins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 최신 주보 1개 가져오기
exports.getLatestBulletin = async (req, res) => {
  try {
    const bulletin = await Bulletin.findOne()
      .sort({ date: -1, order: -1 })
      .exec();
    res.json(bulletin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 특정 주보 가져오기
exports.getBulletinById = async (req, res) => {
  try {
    const bulletin = await Bulletin.findById(req.params.id);
    if (!bulletin) {
      return res.status(404).json({ message: '주보를 찾을 수 없습니다.' });
    }
    res.json(bulletin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 주보 생성
exports.createBulletin = async (req, res) => {
  try {
    const { title, imageUrls, date, order } = req.body;

    // imageUrls가 배열이 아니거나 비어있으면 오류
    if (!title || !imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ 
        message: '제목과 이미지 URL(최소 1개)은 필수입니다.' 
      });
    }

    // 최대 2개까지만 허용
    if (imageUrls.length > 2) {
      return res.status(400).json({ 
        message: '이미지는 최대 2개까지 업로드할 수 있습니다.' 
      });
    }

    const bulletin = new Bulletin({
      title,
      imageUrls: imageUrls.filter(url => url && url.trim() !== ''), // 빈 문자열 제거
      date: date ? new Date(date) : new Date(),
      order: order || 0,
    });

    await bulletin.save();
    res.status(201).json(bulletin);
  } catch (error) {
    console.error('주보 생성 오류:', error);
    res.status(500).json({ 
      message: error.message || '주보 생성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 주보 업데이트
exports.updateBulletin = async (req, res) => {
  try {
    const { title, imageUrls, date, order } = req.body;

    const bulletin = await Bulletin.findById(req.params.id);
    if (!bulletin) {
      return res.status(404).json({ message: '주보를 찾을 수 없습니다.' });
    }

    if (title) bulletin.title = title;
    if (imageUrls && Array.isArray(imageUrls)) {
      if (imageUrls.length > 2) {
        return res.status(400).json({ 
          message: '이미지는 최대 2개까지 업로드할 수 있습니다.' 
        });
      }
      bulletin.imageUrls = imageUrls.filter(url => url && url.trim() !== '');
    }
    if (date) bulletin.date = new Date(date);
    if (order !== undefined) bulletin.order = order;

    await bulletin.save();
    res.json(bulletin);
  } catch (error) {
    console.error('주보 업데이트 오류:', error);
    res.status(500).json({ 
      message: error.message || '주보 업데이트 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 주보 삭제
exports.deleteBulletin = async (req, res) => {
  try {
    const bulletin = await Bulletin.findById(req.params.id);
    if (!bulletin) {
      return res.status(404).json({ message: '주보를 찾을 수 없습니다.' });
    }

    await Bulletin.findByIdAndDelete(req.params.id);
    res.json({ message: '주보가 삭제되었습니다.' });
  } catch (error) {
    console.error('주보 삭제 오류:', error);
    res.status(500).json({ 
      message: error.message || '주보 삭제 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 주보 조회수 증가
exports.incrementViews = async (req, res) => {
  try {
    const bulletin = await Bulletin.findById(req.params.id);
    if (!bulletin) {
      return res.status(404).json({ message: '주보를 찾을 수 없습니다.' });
    }

    bulletin.views = (bulletin.views || 0) + 1;
    await bulletin.save();
    res.json({ views: bulletin.views });
  } catch (error) {
    console.error('조회수 증가 오류:', error);
    res.status(500).json({ 
      message: error.message || '조회수 증가 중 오류가 발생했습니다.'
    });
  }
};

