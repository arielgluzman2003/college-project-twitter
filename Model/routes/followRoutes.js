const express = require('express');
const router = express.Router();
const followController = require('../../controllers/followController');

// Get all users followed by the current user
router.get('/', followController.getFollowedUsers);

// Create a follow relationship
router.post('/', followController.createFollow);

module.exports = router;