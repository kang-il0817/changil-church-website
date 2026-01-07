const DonationReceipt = require('../models/DonationReceipt');

// 모든 신청 내역 가져오기 (관리자 페이지용)
exports.getAllDonationReceipts = async (req, res) => {
  try {
    const receipts = await DonationReceipt.find()
      .sort({ createdAt: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 특정 신청 내역 가져오기
exports.getDonationReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await DonationReceipt.findById(id);
    
    if (!receipt) {
      return res.status(404).json({ message: '신청 내역을 찾을 수 없습니다.' });
    }
    
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 신청 내역 생성
exports.createDonationReceipt = async (req, res) => {
  try {
    const { type, name, contact, email, residentNumber, address, corporateName, businessRegistrationFile, otherRequests } = req.body;

    if (!type || !name || !contact || !email) {
      return res.status(400).json({ 
        message: '필수 정보가 누락되었습니다.' 
      });
    }

    // 개인일 때 주민등록번호와 주소 필수
    if (type === '개인' && (!residentNumber || !address)) {
      return res.status(400).json({ 
        message: '개인 발급의 경우 주민등록번호와 주소는 필수입니다.' 
      });
    }

    // 법인일 때 법인명과 사업자등록증 필수
    if (type === '법인' && (!corporateName || !businessRegistrationFile)) {
      return res.status(400).json({ 
        message: '법인 발급의 경우 법인명과 사업자등록증은 필수입니다.' 
      });
    }

    const receipt = new DonationReceipt({
      type,
      name,
      contact,
      email,
      residentNumber: type === '개인' ? residentNumber : '',
      address: type === '개인' ? address : '',
      corporateName: type === '법인' ? corporateName : '',
      businessRegistrationFile: type === '법인' ? businessRegistrationFile : '',
      otherRequests: otherRequests || '',
      status: '대기',
    });

    await receipt.save();
    res.status(201).json(receipt);
  } catch (error) {
    console.error('기부금 영수증 신청 생성 오류:', error);
    res.status(500).json({ 
      message: error.message || '신청 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 신청 내역 업데이트 (상태 변경, 메모 추가 등)
exports.updateDonationReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const receipt = await DonationReceipt.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!receipt) {
      return res.status(404).json({ message: '신청 내역을 찾을 수 없습니다.' });
    }

    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 신청 내역 삭제
exports.deleteDonationReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await DonationReceipt.findByIdAndDelete(id);

    if (!receipt) {
      return res.status(404).json({ message: '신청 내역을 찾을 수 없습니다.' });
    }

    res.json({ message: '신청 내역이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

