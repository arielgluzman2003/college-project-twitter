const express = require('express');
const router = express.Router();
const postController = require('../../controllers/postController');

router.post('/', postController.createPost);
router.get('/:username', postController.getFeedPosts);
// router.put('/:postId', postController.updatePost);
// router.delete('/:postId', postController.deletePost);

module.exports = router;