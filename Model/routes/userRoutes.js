const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

// User CRUD operations
router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:username', userController.getUser);
router.put('/:username', userController.updateUser);
router.delete('/:username', userController.deleteUser);

// Authentication
router.post('/authenticate', userController.authenticateUser);

// Search
router.post('/search', userController.searchUsers);

module.exports = router;
