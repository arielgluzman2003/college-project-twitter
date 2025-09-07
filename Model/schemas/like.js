const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    username: {
        type: String,
        ref: 'User',
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId, // <-- Change here
        ref: 'Post',
        required: true
    }
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;