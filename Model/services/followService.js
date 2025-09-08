const Follows = require('../schemas/follows');

// Follow a user
async function followUser(followingUser, followedUser) {
    const follow = new Follows({ followingUser, followedUser });
    return await follow.save();
}

// Unfollow a user
async function unfollowUser(followingUser, followedUser) {
    return await Follows.findOneAndDelete({ followingUser, followedUser });
}

// Get users that a user follows
async function getFollowingUsernames(username) {
    const follows = await Follows.find({ followingUser: username });
    return follows.map(follow => follow.followedUser);
}

// Get users that follow a user
async function getFollowerUsernames(username) {
    const follows = await Follows.find({ followedUser: username });
    return follows.map(follow => follow.followingUser);
}

// Get followed usernames (alias for getFollowingUsernames)
async function getFollowedUsernames(username) {
    return await getFollowingUsernames(username);
}

// Check if user A follows user B
async function isFollowing(followingUser, followedUser) {
    const follow = await Follows.findOne({ followingUser, followedUser });
    return !!follow;
}

// Get follow statistics
async function getFollowStats(username) {
    const [following, followers] = await Promise.all([
        getFollowingUsernames(username),
        getFollowerUsernames(username)
    ]);
    
    return {
        followingCount: following.length,
        followersCount: followers.length,
        following: following,
        followers: followers
    };
}

module.exports = {
    followUser,
    unfollowUser,
    getFollowingUsernames,
    getFollowerUsernames,
    getFollowedUsernames,
    isFollowing,
    getFollowStats
};
