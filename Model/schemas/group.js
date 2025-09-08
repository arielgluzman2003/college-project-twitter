const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    creator: {
        type: String, // username of creator
        required: true
    },
    members: [{
        username: {
            type: String,
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }]
});

// Update the updatedAt field before saving
groupSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
