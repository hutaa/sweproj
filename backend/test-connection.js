import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Connecting with URI:', process.env.MONGO_URI.replace(/:[^:]*@/, ':****@')); // Hide password
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    
    // Test if we can access your data
    const db = mongoose.connection.db;
    const courseCount = await db.collection('courses').countDocuments();
    console.log(`📚 Courses in database: ${courseCount}`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testConnection();