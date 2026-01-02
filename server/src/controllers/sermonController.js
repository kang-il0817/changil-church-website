const Sermon = require('../models/Sermon');

// YouTube URL에서 Video ID 추출
const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// YouTube 썸네일 URL 생성
const getThumbnailUrl = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// 모든 설교 가져오기
exports.getAllSermons = async (req, res) => {
  try {
    const sermons = await Sermon.find().sort({ order: 1, date: -1 });
    res.json(sermons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 타입별 설교 가져오기
exports.getSermonsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const sermons = await Sermon.find({ type })
      .sort({ order: 1, date: -1 })
      .limit(1); // 각 타입당 최신 1개만
    
    res.json(sermons[0] || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 설교 생성
exports.createSermon = async (req, res) => {
  try {
    const { title, type, youtubeUrl, description, order, customThumbnail, date } = req.body;

    if (!title || !type || !youtubeUrl) {
      return res.status(400).json({ 
        message: '제목, 타입, YouTube URL은 필수입니다.' 
      });
    }

    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      return res.status(400).json({ 
        message: '유효한 YouTube URL이 아닙니다.' 
      });
    }

    // 중복 체크: 같은 YouTube ID가 이미 존재하는지 확인
    const existingSermon = await Sermon.findOne({ youtubeId });
    if (existingSermon) {
      return res.status(400).json({ 
        message: '이미 같은 YouTube 영상의 설교가 등록되어 있습니다.' 
      });
    }

    const thumbnailUrl = getThumbnailUrl(youtubeId);

    const sermon = new Sermon({
      title,
      type,
      youtubeUrl,
      youtubeId,
      thumbnailUrl,
      customThumbnail: customThumbnail || '',
      description: description || '',
      order: order || 0,
      date: date ? new Date(date) : new Date(),
    });

    await sermon.save();
    res.status(201).json(sermon);
  } catch (error) {
    console.error('설교 생성 오류:', error);
    res.status(500).json({ 
      message: error.message || '설교 생성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 설교 업데이트
exports.updateSermon = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, youtubeUrl, description, order, customThumbnail, date } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (type) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (customThumbnail !== undefined) updateData.customThumbnail = customThumbnail;
    if (date) updateData.date = new Date(date);

    if (youtubeUrl) {
      const youtubeId = extractYouTubeId(youtubeUrl);
      if (!youtubeId) {
        return res.status(400).json({ 
          message: '유효한 YouTube URL이 아닙니다.' 
        });
      }
      updateData.youtubeUrl = youtubeUrl;
      updateData.youtubeId = youtubeId;
      updateData.thumbnailUrl = getThumbnailUrl(youtubeId);
    }

    const sermon = await Sermon.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!sermon) {
      return res.status(404).json({ message: '설교를 찾을 수 없습니다.' });
    }

    res.json(sermon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 설교 삭제
exports.deleteSermon = async (req, res) => {
  try {
    const { id } = req.params;
    const sermon = await Sermon.findByIdAndDelete(id);

    if (!sermon) {
      return res.status(404).json({ message: '설교를 찾을 수 없습니다.' });
    }

    res.json({ message: '설교가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

