const PastorSchedule = require('../models/PastorSchedule');

// 모든 목회일정 가져오기
exports.getAllPastorSchedules = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let query = { isActive: true };
    
    // 특정 년도/월 필터링
    if (year && month) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      
      query.$or = [
        // 시작일이 해당 월에 있는 경우
        { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
        // 종료일이 해당 월에 있는 경우
        { endDate: { $gte: startOfMonth, $lte: endOfMonth } },
        // 시작일과 종료일이 해당 월을 포함하는 경우
        { 
          startDate: { $lte: startOfMonth },
          endDate: { $gte: endOfMonth }
        },
        // 종료일이 없고 시작일이 해당 월에 있는 경우
        { 
          startDate: { $gte: startOfMonth, $lte: endOfMonth },
          endDate: null
        }
      ];
    }
    
    const schedules = await PastorSchedule.find(query)
      .sort({ startDate: 1, order: 1, createdAt: 1 });
    
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 목회일정 생성
exports.createPastorSchedule = async (req, res) => {
  try {
    const { title, startDate, endDate, description, color, order } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({ 
        message: '제목과 시작일은 필수입니다.' 
      });
    }

    const schedule = new PastorSchedule({
      title,
      startDate,
      endDate: endDate || null,
      description: description || '',
      color: color || '#718096',
      order: order || 0,
      isActive: true,
    });

    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    console.error('목회일정 생성 오류:', error);
    res.status(500).json({ 
      message: error.message || '목회일정 생성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 목회일정 업데이트
exports.updatePastorSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, startDate, endDate, description, color, order, isActive } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const schedule = await PastorSchedule.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ message: '목회일정을 찾을 수 없습니다.' });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 목회일정 삭제
exports.deletePastorSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await PastorSchedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({ message: '목회일정을 찾을 수 없습니다.' });
    }

    res.json({ message: '목회일정이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

