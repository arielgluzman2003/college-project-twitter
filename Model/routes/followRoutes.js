const express = require('express');
const router = express.Router();
const followController = require('../../controllers/followController');

// Follow operations
router.post('/', followController.followUser);
router.delete('/', followController.unfollowUser);

// Get follow relationships
router.get('/following/:username', followController.getFollowing);
router.get('/followers/:username', followController.getFollowers);
router.get('/status', followController.checkFollowStatus);
router.get('/stats/:username', followController.getFollowStats);

module.exports = router;
