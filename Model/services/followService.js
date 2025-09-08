const Follow = require('../schemas/follows');

// Get all users followed by a username
async function getFollowedUsernames(username) {
    const follows = await Follow.find({ followingUser: username });
    return follows.map(f => f.followedUser);
}

// Create a follow relationship
async function createFollow(follower, followed) {
    const follow = new Follow({ followingUser: follower, followedUser: followed });
    return await follow.save();
}

async function deleteFollow(follower, followed) {
    return await Follow.deleteOne({ followingUser: follower, followedUser: followed });
}

async function isFollowing(follower, followed) {
    const follow = await Follow.findOne({ followingUser: follower, followedUser: followed });
    return !!follow;
}

module.exports = {
    getFollowedUsernames,
    createFollow,
    deleteFollow,
    isFollowing
};