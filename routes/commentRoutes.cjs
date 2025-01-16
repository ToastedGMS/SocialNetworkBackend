const express = require('express');
const router = express.Router();

const {
	createComment,
	readComment,
	deleteComment,
	updateComment,
} = require('../controllers/commentController.cjs');
const { verifyToken } = require('../auth/auth.cjs');

router.post('/new', verifyToken, createComment);
router.get('/read', readComment);
router.put('/update/:id', verifyToken, updateComment);
router.delete('/delete/:id', verifyToken, deleteComment);

module.exports = router;
