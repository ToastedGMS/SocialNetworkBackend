const express = require('express');
const router = express.Router();

const {
	createComment,
	readComment,
	deleteComment,
	updateComment,
} = require('../controllers/commentController.cjs');

router.post('/new', createComment);
router.get('/read', readComment);
router.put('/update', updateComment);
router.delete('/delete', deleteComment);

module.exports = router;
