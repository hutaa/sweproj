import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkSchema() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get a sample document to see the actual structure
    const sampleCourse = await db.collection('courses').findOne();
    console.log('📋 Sample course structure:');
    console.log(JSON.stringify(sampleCourse, null, 2));
    
    const sampleProgram = await db.collection('programs').findOne();
    console.log('📋 Sample program structure:');
    console.log(JSON.stringify(sampleProgram, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkSchema();