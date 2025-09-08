const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    birthYear: {
        type: Number,
        required: true
    },
    birthMonth: {
        type: Number,
        required: true
    },
    birthDay: {
        type: Number,
        required: true
    },
    userPhotoUrl: {
        type: String,
        default: 'https://cdn-icons-png.freepik.com/512/4159/4159471.png'
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;