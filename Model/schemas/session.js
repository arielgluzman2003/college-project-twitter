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
        default: Date.now() + 86400000 // 24 hours from creation
    }
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;