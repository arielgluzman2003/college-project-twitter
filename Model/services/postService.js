const Post = require('../schemas/post');

// Create a post
async function createPost(data) {
    const post = new Post(data);
    return await post.save();
}

// Get all posts
async function getAllPosts() {
    return await Post.find().sort({ date: -1 }); // Sort by date, newest first
}

// Get posts by an array of usernames
async function getPostsByUsernames(usernames) {
    return await Post.find({ username: { $in: usernames } });
}

// Get posts by group
async function getPostsByGroup(groupId) {
    return await Post.find({ groupId: groupId }).sort({ date: -1 });
}

// Get posts by user
async function getPostsByUser(username) {
    return await Post.find({ username: username }).sort({ date: -1 });
}

// Get post by ID
async function getPostById(id) {
    return await Post.findById(id);
}

// Update post
async function updatePost(id, data) {
    return await Post.findByIdAndUpdate(id, data, { new: true });
}

// Delete post
async function deletePost(id) {
    return await Post.findByIdAndDelete(id);
}

// Search posts with filters
async function searchPosts(query, filters = {}) {
    const searchQuery = {
        $or: [
            { textContent: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
        ]
    };

    // Add filters
    if (filters.username) {
        searchQuery.username = filters.username;
    }
    if (filters.groupId) {
        searchQuery.groupId = filters.groupId;
    }
    if (filters.postType) {
        searchQuery.postType = filters.postType;
    }
    if (filters.dateFrom || filters.dateTo) {
        searchQuery.date = {};
        if (filters.dateFrom) {
            searchQuery.date.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
            searchQuery.date.$lte = new Date(filters.dateTo);
        }
    }
    if (filters.hasMedia) {
        searchQuery.visualContent = { $exists: true, $ne: null };
    }

    return await Post.find(searchQuery).sort({ date: -1 });
}

// GroupBy queries for statistics
async function getPostsByUserCount() {
    return await Post.aggregate([
        { $group: { _id: '$username', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
}

async function getPostsByGroupCount() {
    return await Post.aggregate([
        { $match: { groupId: { $exists: true, $ne: null } } },
        { $group: { _id: '$groupId', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
}

async function getPostsByDateCount() {
    return await Post.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' },
                    day: { $dayOfMonth: '$date' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
    ]);
}

async function getPostsByMediaType() {
    return await Post.aggregate([
        {
            $lookup: {
                from: 'visualcontents',
                localField: 'visualContent',
                foreignField: '_id',
                as: 'media'
            }
        },
        { $unwind: { path: '$media', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$media.mediaType',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);
}

module.exports = {
    createPost,
    getAllPosts,
    getPostsByUsernames,
    getPostsByGroup,
    getPostsByUser,
    getPostById,
    updatePost,
    deletePost,
    searchPosts,
    getPostsByUserCount,
    getPostsByGroupCount,
    getPostsByDateCount,
    getPostsByMediaType
};
