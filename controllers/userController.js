const userService = require('../Model/services/userService');
const sessionService = require('../Model/services/sessionService');

async function getAllUsers(req, res) {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const session = await sessionService.getSessionById(sessionId);
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const username = session.user;
        if (!username) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const users = await userService.getAllUsersExcept(username);
        res.status(200).json(users); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

async function authenticateUser(req, res) {
    try {
        const user = await userService.getUser(req.body.username);
        if (user && user.password === req.body.password) {
            const session = await sessionService.createSession(user.username);
            res.cookie('sessionId', session.sessionId, {
                sameSite: 'none',
                secure: true

            });
            res.status(200).json({ success: true, message: 'Authentication Successful' });
        } else {
            res.status(401).json({ success: false, message: 'Authentication failed' });
    }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getMe(req, res) {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const session = await sessionService.getSessionById(sessionId);
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const username = session.user;
        if (!username) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await userService.getUser(username);
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Create user
async function createUser(req, res) {
    try {
        const user = await userService.createUser(req.body);
        const session = await sessionService.createSession(user.username);
        res.cookie('sessionId', session.sessionId, {
        sameSite: 'none',
        secure: true
        });
        res.status(200).json({ success: true, message: 'User created successfully' });
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

module.exports = { createUser, getUser, getMe, updateUser, authenticateUser, deleteUser, getAllUsers };
