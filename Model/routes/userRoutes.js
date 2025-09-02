const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

router.post('/', userController.createUser);
router.get('/:username', userController.getUser);
router.put('/:username', userController.updateUser);
router.delete('/:username', userController.deleteUser);

module.exports = router;