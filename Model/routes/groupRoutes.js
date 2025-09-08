const express = require('express');
const router = express.Router();
const groupController = require('../../controllers/groupController');

// Group CRUD operations
router.post('/', groupController.createGroup);
router.get('/', groupController.getAllGroups);
router.get('/stats', groupController.getGroupStats);
router.get('/:id', groupController.getGroupById);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

// Group membership
router.post('/join', groupController.joinGroup);
router.post('/leave', groupController.leaveGroup);

// Group queries
router.get('/creator/:username', groupController.getGroupsByCreator);
router.get('/member/:username', groupController.getGroupsByMember);
router.post('/search', groupController.searchGroups);

module.exports = router;
