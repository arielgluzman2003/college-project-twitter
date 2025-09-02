const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./db');
const cors = require('cors');

app.use(express.json());

// Allow CORS for 127.0.0.1:5500
app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));

connectDB().then(() => {
    app.use('/api/users', userRoutes);
    app.listen(3000, () => console.log('Server running on port 3000'));
});