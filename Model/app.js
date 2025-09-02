const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./db');

app.use(express.json());

connectDB().then(() => {
    app.use('/api/users', userRoutes);
    app.listen(3000, () => console.log('Server running on port 3000'));
});