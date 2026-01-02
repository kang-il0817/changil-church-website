const Event = require('../models/Event');

// 모든 행사 포스터 가져오기
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true })
      .sort({ order: 1, eventDate: -1, createdAt: -1 })
      .limit(10); // 최대 10개만 표시
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 행사 포스터 생성
exports.createEvent = async (req, res) => {
  try {
    const { imageUrl, title, description, eventDate, order } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ 
        message: '이미지 URL은 필수입니다.' 
      });
    }

    const event = new Event({
      imageUrl,
      title: title || '',
      description: description || '',
      eventDate: eventDate || null,
      order: order || 0,
      isActive: true,
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('행사 포스터 생성 오류:', error);
    res.status(500).json({ 
      message: error.message || '행사 포스터 생성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 행사 포스터 업데이트
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, title, description, eventDate, order, isActive } = req.body;

    const updateData = {};
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (eventDate !== undefined) updateData.eventDate = eventDate;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const event = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: '행사 포스터를 찾을 수 없습니다.' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 행사 포스터 삭제
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: '행사 포스터를 찾을 수 없습니다.' });
    }

    res.json({ message: '행사 포스터가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

