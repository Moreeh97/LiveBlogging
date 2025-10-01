import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
        
    } catch (error) {
        console.error('❌ Database connection error:', error);
        process.exit(1);
    }
};

// معالجة الأخطاء
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 MongoDB disconnected');
});

// إغلاق نظيف عند إيقاف التطبيق
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

export default connectDB;