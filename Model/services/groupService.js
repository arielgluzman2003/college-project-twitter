const Group = require('../schemas/group');

// Create a new group
async function createGroup(data) {
    const group = new Group(data);
    return await group.save();
}

// Get all groups
async function getAllGroups() {
    return await Group.find().sort({ createdAt: -1 });
}

// Get group by ID
async function getGroupById(id) {
    return await Group.findById(id);
}

// Get groups by creator
async function getGroupsByCreator(username) {
    return await Group.find({ creator: username });
}

// Get groups user is member of
async function getGroupsByMember(username) {
    return await Group.find({ 'members.username': username });
}

// Join a group
async function joinGroup(groupId, username) {
    return await Group.findByIdAndUpdate(
        groupId,
        { $addToSet: { members: { username: username } } },
        { new: true }
    );
}

// Leave a group
async function leaveGroup(groupId, username) {
    return await Group.findByIdAndUpdate(
        groupId,
        { $pull: { members: { username: username } } },
        { new: true }
    );
}

// Update group
async function updateGroup(id, data) {
    return await Group.findByIdAndUpdate(id, data, { new: true });
}

// Delete group
async function deleteGroup(id) {
    return await Group.findByIdAndDelete(id);
}

// Search groups
async function searchGroups(query, filters = {}) {
    const searchQuery = {
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
        ]
    };

    // Add filters
    if (filters.creator) {
        searchQuery.creator = filters.creator;
    }
    if (filters.isPrivate !== undefined) {
        searchQuery.isPrivate = filters.isPrivate;
    }
    if (filters.dateFrom || filters.dateTo) {
        searchQuery.createdAt = {};
        if (filters.dateFrom) {
            searchQuery.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
            searchQuery.createdAt.$lte = new Date(filters.dateTo);
        }
    }

    return await Group.find(searchQuery).sort({ createdAt: -1 });
}

// GroupBy queries
async function getGroupsByCreatorCount() {
    return await Group.aggregate([
        { $group: { _id: '$creator', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
}

async function getGroupsByMemberCount() {
    return await Group.aggregate([
        { $unwind: '$members' },
        { $group: { _id: '$_id', name: { $first: '$name' }, memberCount: { $sum: 1 } } },
        { $sort: { memberCount: -1 } }
    ]);
}

module.exports = {
    createGroup,
    getAllGroups,
    getGroupById,
    getGroupsByCreator,
    getGroupsByMember,
    joinGroup,
    leaveGroup,
    updateGroup,
    deleteGroup,
    searchGroups,
    getGroupsByCreatorCount,
    getGroupsByMemberCount
};
