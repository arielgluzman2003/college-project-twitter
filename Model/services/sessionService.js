const Session = require('../schemas/session');

// Get all users followed by a username
async function getSessionById(sessionId) {
    const session = await Session.findOne({ sessionId });
    return session;
}

// Create a session
async function createSession(username) {
    const maxSessionId = await Session.findOne().sort({ sessionId: -1 });
    const session = new Session({ sessionId: maxSessionId ? parseInt(maxSessionId.sessionId) + 1 : 1, user: username, expiryDate: Date.now() + 86400000 });
    return await session.save();
}


module.exports = {
    getSessionById,
    createSession
};