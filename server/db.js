import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('MongoDB connection error: MONGO_URI or MONGODB_URI is not defined in .env file');
    process.exit(1);
  }
  
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
