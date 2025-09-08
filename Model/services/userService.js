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

// Get user by email
async function getUserByEmail(email) {
    return await User.findOne({ email });
}

// Update user by username
async function updateUser(username, data) {
    return await User.findOneAndUpdate({ username }, data, { new: true });
}

// Delete user by username
async function deleteUser(username) {
    return await User.findOneAndDelete({ username });
}

// Search users
async function searchUsers(query, filters = {}) {
    const searchQuery = {
        $or: [
            { username: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } },
            { bio: { $regex: query, $options: 'i' } }
        ]
    };

    // Add filters
    if (filters.isVerified !== undefined) {
        searchQuery.isVerified = filters.isVerified;
    }
    if (filters.location) {
        searchQuery.location = { $regex: filters.location, $options: 'i' };
    }

    return await User.find(searchQuery);
}

module.exports = { 
    createUser, 
    getUsers, 
    getUser, 
    getUserByEmail,
    updateUser, 
    deleteUser,
    searchUsers
};
