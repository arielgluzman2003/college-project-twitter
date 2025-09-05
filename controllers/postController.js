const userService = require('../Model/services/userService');
const postService = require('../Model/services/postService');
const followService = require('../Model/services/followService');

// Get posts from users followed by :username
async function getFeedPosts(req, res) {
    try {
        const username = req.params.username;
        const followedUsernames = await followService.getFollowedUsernames(username);
        if (followedUsernames.length === 0) {
            return res.json([]); // No follows, return empty array
        }
        const posts = await postService.getPostsByUsernames(followedUsernames);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Create a new post
async function createPost(req, res) {
    try {
        const post = await postService.createPost(req.body);
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { getFeedPosts, createPost };