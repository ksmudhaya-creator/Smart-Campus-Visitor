const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_campus_visitor_db';
    
    // Attempt standard connection first with reasonable timeout
    mongoose.set('strictQuery', false);
    
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} / ${conn.connection.name}`);
      return conn;
    } catch (primaryErr) {
      console.warn(`[MongoDB] Primary connection to ${mongoUri} failed (${primaryErr.message}). Attempting in-memory fallback...`);
      
      // Fallback to mongodb-memory-server for zero-friction academic / local demo
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const memUri = mongodInstance.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[MongoDB] Connected to In-Memory MongoDB instance at: ${memUri}`);
        console.log(`[MongoDB] Note: To persist data across restarts, start your local MongoDB service and set MONGO_URI in .env`);
        return conn;
      } catch (memErr) {
        console.error('[MongoDB] Failed to start in-memory MongoDB fallback:', memErr.message);
        throw primaryErr;
      }
    }
  } catch (error) {
    console.error(`[MongoDB] Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('[MongoDB] Error during disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
