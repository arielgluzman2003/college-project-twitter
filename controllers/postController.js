const postService = require('../Model/services/postService');
const followService = require('../Model/services/followService');
const sessionService = require('../Model/services/sessionService');
const likesService = require('../Model/services/likeService');


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
        let followedUsernames = await followService.getFollowedUsernames(session.user);
        // if (followedUsernames.length === 0) {
        //     return res.json([]); // No follows, return empty array
        // }
        followedUsernames.push(session.user); // Include user's own posts
        const posts = await postService.getPostsByUsernames(followedUsernames);
        let newPosts = [];
        for (const post of posts) {
            const postLikes = await likesService.getLikesByPostId(post.postId);
            post.isLikedByUser = postLikes.some(like => like.username === session.user);
            newPosts.push(post);
        }
        res.json(newPosts);
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
        const postData = req.body;
        postData.username = session.user;
        const post = await postService.createPost(postData);
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { getFeedPosts, createPost };