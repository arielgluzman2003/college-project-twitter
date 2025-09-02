require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DBNAME;

mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
        await mongoose.connect(`${uri}/${dbName}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB:', dbName);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;