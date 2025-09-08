const groupService = require('../Model/services/groupService');

// Create a new group
async function createGroup(req, res) {
    try {
        const group = await groupService.createGroup(req.body);
        res.status(201).json(group);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Get all groups
async function getAllGroups(req, res) {
    try {
        const groups = await groupService.getAllGroups();
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get group by ID
async function getGroupById(req, res) {
    try {
        const group = await groupService.getGroupById(req.params.id);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get groups by creator
async function getGroupsByCreator(req, res) {
    try {
        const groups = await groupService.getGroupsByCreator(req.params.username);
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get groups user is member of
async function getGroupsByMember(req, res) {
    try {
        const groups = await groupService.getGroupsByMember(req.params.username);
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Join a group
async function joinGroup(req, res) {
    try {
        const { groupId, username } = req.body;
        const group = await groupService.joinGroup(groupId, username);
        res.json(group);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Leave a group
async function leaveGroup(req, res) {
    try {
        const { groupId, username } = req.body;
        const group = await groupService.leaveGroup(groupId, username);
        res.json(group);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Update group
async function updateGroup(req, res) {
    try {
        const group = await groupService.updateGroup(req.params.id, req.body);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.json(group);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Delete group
async function deleteGroup(req, res) {
    try {
        const group = await groupService.deleteGroup(req.params.id);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.json({ message: 'Group deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Search groups
async function searchGroups(req, res) {
    try {
        const { query, filters } = req.body;
        const groups = await groupService.searchGroups(query, filters);
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get group statistics
async function getGroupStats(req, res) {
    try {
        const [creatorStats, memberStats] = await Promise.all([
            groupService.getGroupsByCreatorCount(),
            groupService.getGroupsByMemberCount()
        ]);
        res.json({ creatorStats, memberStats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
    getGroupStats
};
