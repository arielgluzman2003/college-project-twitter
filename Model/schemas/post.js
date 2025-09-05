const mongoose = require('mongoose');
const VisualContent = require('./visualcontent'); 

const postSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    textContent: {
        type: String,
        required: true
    },
    visualContent: { type: mongoose.Schema.Types.ObjectId, ref: 'VisualContent' }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;