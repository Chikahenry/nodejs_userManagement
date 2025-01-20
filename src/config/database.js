const mongoose = require('mongoose');
const logger = require('./logger');
require('dotenv').config({ path: './.env' });

const connectDB = async () => {
  const mongoURI = 'mongodb://127.0.0.1:27017/user-management';
  //console.log('MongoDB URI:', process.env.MONGODB);
  try {
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;