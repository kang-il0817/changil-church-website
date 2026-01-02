const Popup = require('../models/Popup');

// 활성화된 팝업 가져오기 (메인 페이지용)
exports.getActivePopup = async (req, res) => {
  try {
    const now = new Date();
    const popup = await Popup.findOne({
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    })
    .sort({ order: 1, createdAt: -1 })
    .limit(1);

    res.json(popup || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 모든 팝업 가져오기 (관리자 페이지용)
exports.getAllPopups = async (req, res) => {
  try {
    const popups = await Popup.find()
      .sort({ order: 1, createdAt: -1 });
    res.json(popups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 특정 팝업 가져오기
exports.getPopupById = async (req, res) => {
  try {
    const { id } = req.params;
    const popup = await Popup.findById(id);
    
    if (!popup) {
      return res.status(404).json({ message: '팝업을 찾을 수 없습니다.' });
    }
    
    res.json(popup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 팝업 생성
exports.createPopup = async (req, res) => {
  try {
    const { title, content, imageUrl, linkUrl, linkText, isActive, startDate, endDate, order } = req.body;

    if (!title) {
      return res.status(400).json({ 
        message: '제목은 필수입니다.' 
      });
    }

    const popup = new Popup({
      title,
      content: content || '',
      imageUrl: imageUrl || '',
      linkUrl: linkUrl || '',
      linkText: linkText || '자세히 보기',
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      order: order || 0,
    });

    await popup.save();
    res.status(201).json(popup);
  } catch (error) {
    console.error('팝업 생성 오류:', error);
    res.status(500).json({ 
      message: error.message || '팝업 생성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 팝업 업데이트
exports.updatePopup = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, imageUrl, linkUrl, linkText, isActive, startDate, endDate, order } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (linkText !== undefined) updateData.linkText = linkText;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : new Date();
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (order !== undefined) updateData.order = order;

    const popup = await Popup.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!popup) {
      return res.status(404).json({ message: '팝업을 찾을 수 없습니다.' });
    }

    res.json(popup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 팝업 삭제
exports.deletePopup = async (req, res) => {
  try {
    const { id } = req.params;
    const popup = await Popup.findByIdAndDelete(id);

    if (!popup) {
      return res.status(404).json({ message: '팝업을 찾을 수 없습니다.' });
    }

    res.json({ message: '팝업이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

