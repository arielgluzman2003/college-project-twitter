const express = require('express');
const router = express.Router();
const postController = require('../../controllers/postController');

// Post CRUD operations
router.post('/', postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/stats', postController.getPostStats);
router.get('/:id', postController.getPostById);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

// Post queries
router.get('/user/:username', postController.getPostsByUser);
router.get('/group/:groupId', postController.getPostsByGroup);
router.get('/feed/:username', postController.getFeedPosts);
router.post('/search', postController.searchPosts);

module.exports = router;