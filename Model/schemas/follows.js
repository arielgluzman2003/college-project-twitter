const mongoose = require('mongoose');

const followsSchema = new mongoose.Schema({
    followingUser: {
        type: String,
        required: true,
    },
    followedUser: {
        type: String,
        required: true,
    },
    followDate: {
        type: Date,
        default: Date.now
    }
});

followsSchema.index({ followingUser: 1, followedUser: 1 }, { unique: true });

const Follows = mongoose.model('Follows', followsSchema);

module.exports = Follows;
