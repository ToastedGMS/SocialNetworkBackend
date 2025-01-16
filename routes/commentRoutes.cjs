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
router.put('/update/:id', updateComment);
router.delete('/delete/:id', deleteComment);

module.exports = router;
