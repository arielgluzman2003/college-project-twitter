const Like = require('../schemas/like');

// Create a like relationship
async function createLike(postId, username) {
    const like = new Like({ postId: postId, username: username }); // postId is ObjectId
    return await like.save();
}

async function removeLike(postId, username) {
    return await Like.deleteOne({ postId: postId, username: username });
}

async function getLikesByPostId(postId) {
    return await Like.find({ postId: postId });
}

module.exports = {
    createLike,
    removeLike,
    getLikesByPostId
};