const Like = require('../schemas/like');

// Create a like relationship
async function createLike(postId, username) {
    const like = new Like({ postId: postId, username: username }); // postId is ObjectId
    return await like.save();
}


module.exports = {
    createLike
};