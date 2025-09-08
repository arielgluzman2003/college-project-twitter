const express = require('express');
const router = express.Router();
const likeController = require('../../controllers/likeController');


// Create a like relationship
router.post('/', likeController.createLike);
router.delete('/', likeController.removeLike);

module.exports = router;