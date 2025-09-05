const express = require('express');
const router = express.Router();
const followController = require('../../controllers/followController');

// Get all users followed by :username
router.get('/:username', followController.getFollowedUsers);

// Create a follow relationship
router.post('/', followController.createFollow);

module.exports = router;