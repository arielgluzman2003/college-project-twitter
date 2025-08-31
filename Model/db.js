const { MongoClient } = require('mongodb');

const uri = 'your_mongodb_connection_string'; // Replace with your MongoDB connection string
let dbInstance;

const connectDB = async () => {
    if (!dbInstance) {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        dbInstance = client.db('your_database_name'); // Replace with your database name
    }
    return dbInstance;
};

module.exports = connectDB;