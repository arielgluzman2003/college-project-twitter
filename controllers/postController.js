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

// Get all posts (for demo purposes)
async function getAllPosts(req, res) {
    try {
        const posts = await postService.getAllPosts();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get posts by group
async function getPostsByGroup(req, res) {
    try {
        const posts = await postService.getPostsByGroup(req.params.groupId);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get posts by user
async function getPostsByUser(req, res) {
    try {
        const posts = await postService.getPostsByUser(req.params.username);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get post by ID
async function getPostById(req, res) {
    try {
        const post = await postService.getPostById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
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

// Update post
async function updatePost(req, res) {
    try {
        const post = await postService.updatePost(req.params.id, req.body);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Delete post
async function deletePost(req, res) {
    try {
        const post = await postService.deletePost(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Search posts
async function searchPosts(req, res) {
    try {
        const { query, filters } = req.body;
        const posts = await postService.searchPosts(query, filters);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get post statistics
async function getPostStats(req, res) {
    try {
        const [userStats, groupStats, dateStats, mediaStats] = await Promise.all([
            postService.getPostsByUserCount(),
            postService.getPostsByGroupCount(),
            postService.getPostsByDateCount(),
            postService.getPostsByMediaType()
        ]);
        res.json({ userStats, groupStats, dateStats, mediaStats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getFeedPosts,
    getAllPosts,
    getPostsByGroup,
    getPostsByUser,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    searchPosts,
    getPostStats
};