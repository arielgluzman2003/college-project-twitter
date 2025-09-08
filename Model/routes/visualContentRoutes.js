const express = require('express');
const router = express.Router();
const visualContentController = require('../../controllers/visualContentController');

router.post('/', visualContentController.createVisualContent);
router.get('/:id', visualContentController.getVisualContent);

module.exports = router;
