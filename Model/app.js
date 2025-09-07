const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const followRoutes = require('./routes/followRoutes');

const cookieParser = require('cookie-parser');


const connectDB = require('./db');
const cors = require('cors');
app.use(cookieParser());


app.use(express.json());

// Allow CORS for 127.0.0.1:5500
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));

connectDB().then(() => {
    app.use('/api/users', userRoutes);
    app.use('/api/posts', postRoutes);
    app.use('/api/follows', followRoutes);
    app.listen(3000, () => console.log('Server running on port 3000'));
});