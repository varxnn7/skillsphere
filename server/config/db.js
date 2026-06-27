const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skillsphere';
  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed: ${error.message}`);
    console.warn('Attempting fallback to in-memory MongoDB server...');
    try {
      await mongoose.disconnect();
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        binary: {
          version: '4.4.29'
        },
        instance: {
          storageEngine: 'ephemeralForTest'
        }
      });
      const inMemoryUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`In-Memory MongoDB Connected successfully: ${conn.connection.host}`);
      
      global.mongoServer = mongoServer;
    } catch (fallbackError) {
      console.error(`Database connection error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
