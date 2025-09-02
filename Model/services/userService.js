const User = require('../schemas/user');

// Create user
async function createUser(data) {
    const user = new User(data);
    return await user.save();
}

// Get all users
async function getUsers() {
    return await User.find();
}

// Get user by username
async function getUser(username) {
    return await User.findOne({ username });
}

// Update user by username
async function updateUser(username, data) {
    return await User.findOneAndUpdate({ username }, data, { new: true });
}

// Delete user by username
async function deleteUser(username) {
    return await User.findOneAndDelete({ username });
}

module.exports = { createUser, getUsers, getUser, updateUser, deleteUser };