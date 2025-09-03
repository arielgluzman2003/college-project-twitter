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

module.exports = {
    getFollowedUsernames,
    createFollow
};