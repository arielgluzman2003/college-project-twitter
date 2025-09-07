const express = require('express');
const router = express.Router();
const likeController = require('../../controllers/likeController');


// Create a like relationship
router.post('/', likeController.createLike);

module.exports = router;