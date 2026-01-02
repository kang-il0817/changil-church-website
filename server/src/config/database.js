const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 기본값: MongoDB Atlas 주소 (프로덕션)
    const defaultMongoURI = 'mongodb+srv://kangil0817_db_user:af04%402839R@cluster0.jflvwnu.mongodb.net/changilweb?authSource=admin';
    
    // 환경 변수가 있으면 사용, 없으면 기본값(Atlas), 그것도 없으면 로컬
    const mongoURI = process.env.MONGODB_URI || defaultMongoURI || 'mongodb://localhost:27017/changilweb';
    
    if (!mongoURI) {
      throw new Error('MongoDB URI가 설정되지 않았습니다.');
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB 연결 오류: ${error.message}`);
    console.error('MongoDB 연결을 확인하세요.');
    process.exit(1);
  }
};

module.exports = connectDB;

