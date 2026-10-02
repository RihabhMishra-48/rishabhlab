import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async () => {
  const customUri = process.env.MONGODB_URI;

  if (customUri) {
    try {
      console.log(`[Database] Connecting to configured MongoDB: ${customUri}`);
      await mongoose.connect(customUri, { serverSelectionTimeoutMS: 4000 });
      console.log('✅ [Database] Connected to external MongoDB successfully');
      return;
    } catch (err: any) {
      console.warn('⚠️ [Database] External MongoDB connection failed, falling back to local/in-memory instance:', err.message);
    }
  }

  // Attempt local MongoDB on standard port
  const defaultLocalUri = 'mongodb://127.0.0.1:27017/rishabhlabs';
  try {
    console.log(`[Database] Attempting connection to local MongoDB at ${defaultLocalUri}...`);
    await mongoose.connect(defaultLocalUri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ [Database] Connected to local MongoDB successfully');
  } catch (localErr: any) {
    console.log('ℹ️ [Database] Local MongoDB daemon not running. Bootstrapping zero-config MongoMemoryServer...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create({
        binary: {
          version: '7.0.14',
        },
      });
      const inMemoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`✅ [Database] Connected to in-memory MongoDB (${inMemoryUri})`);
    } catch (memErr: any) {
      console.error('❌ [Database] Failed to initialize MongoMemoryServer:', memErr);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
