const Post = require('../schemas/post');
const Like = require('../schemas/like');
const { post } = require('../routes/postRoutes');


// Create a post
async function createPost(data) {
    const post = new Post(data);
    return await post.save();
}

// Get posts by an array of usernames
async function getPostsByUsernames(usernames) {
    const posts = await Post.find({ username: { $in: usernames } });
    let postsBuffer = [];
    for (const post of posts) {
        const likes = await Like.find({ postId: post._id });
        postsBuffer.push({
            postId: post._id.toString(),
            username: post.username,
            date: post.date,
            textContent: post.textContent,
            likes: likes.length,
            likesDetails: likes
        });
    }
    return postsBuffer;
}

module.exports = { createPost, getPostsByUsernames };