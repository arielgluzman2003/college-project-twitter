const Post = require('../schemas/post');

// Create a post
async function createPost(data) {
    const post = new Post(data);
    return await post.save();
}

// Get posts by an array of usernames
async function getPostsByUsernames(usernames) {
    return await Post.find({ username: { $in: usernames } });
}

module.exports = { createPost, getPostsByUsernames };