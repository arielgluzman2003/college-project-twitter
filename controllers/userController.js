const userService = require('../Model/services/userService');

async function authenticateUser(req, res) {
    try {
        const user = await userService.getUser(req.body.username);
        if (user && user.password === req.body.password) {
            res.status(200).json({ success: true, message: 'Authentication successful', user: { username: user.username, name: user.name, email: user.email } });
        } else {
            res.status(401).json({ success: false, message: 'Authentication failed' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Create user
async function createUser(req, res) {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ success: true, user: { username: user.username, name: user.name, email: user.email } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Get all users
async function getUsers(req, res) {
    try {
        const users = await userService.getUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get user by username
async function getUser(req, res) {
    try {
        const user = await userService.getUser(req.params.username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Update user by username
async function updateUser(req, res) {
    try {
        const user = await userService.updateUser(req.params.username, req.body);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
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

// Search users
async function searchUsers(req, res) {
    try {
        const { query, filters } = req.body;
        const users = await userService.searchUsers(query, filters);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { 
    createUser, 
    getUsers, 
    getUser, 
    updateUser, 
    authenticateUser, 
    deleteUser,
    searchUsers
};
