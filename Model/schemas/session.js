const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: String,
        required: true,
    },
    expiryDate: {
        type: Date,
        default: Date.now() + 600000 // 10 minutes from creation
    }
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;