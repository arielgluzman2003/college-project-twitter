const postService = require('../Model/services/postService');
const followService = require('../Model/services/followService');
const sessionService = require('../Model/services/sessionService');

// Get posts from users followed by :username
async function getFeedPosts(req, res) {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const session = await sessionService.getSessionById(sessionId);
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const sessionExpiryDate = session.expiryDate;
        if (sessionExpiryDate < new Date()) {
            return res.status(401).json({ error: 'Session expired' });
        }
        const followedUsernames = await followService.getFollowedUsernames(session.user);
        if (followedUsernames.length === 0) {
            return res.json([]); // No follows, return empty array
        }
        const posts = await postService.getPostsByUsernames(followedUsernames);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
}

// Create a new post
async function createPost(req, res) {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const session = await sessionService.getSessionById(sessionId);
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const sessionExpiryDate = session.expiryDate;
        if (sessionExpiryDate < new Date()) {
            return res.status(401).json({ error: 'Session expired' });
        }
        const user = session.user;
        const post = await postService.createPost(req.body);
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { getFeedPosts, createPost };