const followService = require('../Model/services/followService');

// Follow a user
async function followUser(req, res) {
    try {
        const { followingUser, followedUser } = req.body;
        const follow = await followService.followUser(followingUser, followedUser);
        res.status(201).json(follow);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Unfollow a user
async function unfollowUser(req, res) {
    try {
        const { followingUser, followedUser } = req.body;
        const result = await followService.unfollowUser(followingUser, followedUser);
        if (!result) {
            return res.status(404).json({ error: 'Follow relationship not found' });
        }
        res.json({ message: 'Unfollowed successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Get users that a user follows
async function getFollowing(req, res) {
    try {
        const following = await followService.getFollowingUsernames(req.params.username);
        res.json(following);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get users that follow a user
async function getFollowers(req, res) {
    try {
        const followers = await followService.getFollowerUsernames(req.params.username);
        res.json(followers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Check if user A follows user B
async function checkFollowStatus(req, res) {
    try {
        const { followingUser, followedUser } = req.query;
        const isFollowing = await followService.isFollowing(followingUser, followedUser);
        res.json({ isFollowing });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get follow statistics
async function getFollowStats(req, res) {
    try {
        const stats = await followService.getFollowStats(req.params.username);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    followUser,
    unfollowUser,
    getFollowing,
    getFollowers,
    checkFollowStatus,
    getFollowStats
};
