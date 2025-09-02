const userService = require('../Model/services/userService');

async function authenticateUser(req, res) {
    try {
        const user = await userService.getUser(req.body.username);
        if (user && user.password === req.body.password) {
            res.status(200).json({ success: true, message: 'Authentication successful' });
        } else {
            res.status(401).json({ success: true, message: 'Authentication failed' });
    }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Create user
async function createUser(req, res) {
    try {
        const user = await userService.createUser(req.body);
        res.status(200);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Get all users
async function getUser(req, res) {
    try {
        const user = await userService.getUser(req.params.username);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Update user by username
async function updateUser(req, res) {
    try {
        const user = await userService.updateUser(req.params.username, req.body);
        res.status(200).json(user); 
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Delete user by username
async function deleteUser(req, res) {
    try {
        await userService.deleteUser(req.params.username);
        res.status(200).json({ message: 'User deleted' }); 
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { createUser, getUser, updateUser, authenticateUser, deleteUser };
