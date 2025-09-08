const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const followRoutes = require('./routes/followRoutes');
const groupRoutes = require('./routes/groupRoutes');
const visualContentRoutes = require('./routes/visualContentRoutes');

const connectDB = require('./db');
const cors = require('cors');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

// Allow CORS for 127.0.0.1:5500 and localhost:8000
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:8000', 'http://localhost:3000'],
    credentials: true
}));

connectDB().then(() => {
    app.use('/api/users', userRoutes);
    app.use('/api/posts', postRoutes);
    app.use('/api/follows', followRoutes);
    app.use('/api/groups', groupRoutes);
    app.use('/api/visual-content', visualContentRoutes);
    app.listen(3000, () => console.log('Server running on port 3000'));
});