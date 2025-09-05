const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

router.post('/create', userController.createUser);
//router.get('/:username', userController.getUser);
router.put('/:username', userController.updateUser);
router.delete('/:username', userController.deleteUser);
router.post('/authenticate', userController.authenticateUser); // New route for authentication

module.exports = router;