import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

let mongoMemoryServer: any = null;

export const connectDB = async () => {
  const customUri = process.env.MONGODB_URI;

  if (customUri) {
    try {
      console.log(`[Database] Connecting to configured MongoDB: ${customUri}`);
      await mongoose.connect(customUri, { serverSelectionTimeoutMS: 4000 });
      console.log('✅ [Database] Connected to external MongoDB successfully');
      return;
    } catch (err: any) {
      console.warn('⚠️ [Database] External MongoDB connection failed:', err.message);
    }
  }

  // On Vercel or production serverless, DO NOT bootstrap MongoMemoryServer
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    console.log('ℹ️ [Database] Running in production/serverless environment without MONGODB_URI. Operating with Supabase as primary datastore.');
    return;
  }

  // Attempt local MongoDB on standard port (Development only)
  const defaultLocalUri = 'mongodb://127.0.0.1:27017/rishabhlabs';
  try {
    console.log(`[Database] Attempting connection to local MongoDB at ${defaultLocalUri}...`);
    await mongoose.connect(defaultLocalUri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ [Database] Connected to local MongoDB successfully');
  } catch (localErr: any) {
    console.log('ℹ️ [Database] Local MongoDB daemon not running. Bootstrapping zero-config MongoMemoryServer with persistent disk storage...');
    try {
      // Dynamic import so mongodb-memory-server is never bundled or required in production builds
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const dbPath = path.resolve(process.cwd(), '.mongo_data');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbPath,
          storageEngine: 'wiredTiger',
        },
        binary: {
          version: '7.0.14',
        },
      });
      const inMemoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`✅ [Database] Connected to persistent MongoDB (${inMemoryUri})`);
    } catch (memErr: any) {
      console.warn('⚠️ [Database] MongoMemoryServer not available:', memErr.message);
    }
  }
};

export const closeDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch {
    // Ignore close errors
  }
};
