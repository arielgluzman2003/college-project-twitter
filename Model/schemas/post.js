const mongoose = require('mongoose');
const VisualContent = require('./visualcontent'); 

const postSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    username: {
        type: String,
        required: true
    },
    textContent: {
        type: String,
        required: true
    },
    visualContent: { type: mongoose.Schema.Types.ObjectId, ref: 'VisualContent' },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: false // Posts can be in groups or personal
    },
    postType: {
        type: String,
        enum: ['personal', 'group'],
        default: 'personal'
    },
    tags: [{
        type: String,
        trim: true
    }],
    location: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;