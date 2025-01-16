const express = require('express');
const router = express.Router();

const {
	createPost,
	readPost,
	deletePost,
	updatePost,
} = require('../controllers/postController.cjs');
const { verifyToken } = require('../auth/auth.cjs');

router.post('/new', verifyToken, createPost);
router.get('/read/:id', readPost);
router.put('/update/:id', verifyToken, updatePost);
router.delete('/delete/:id', verifyToken, deletePost);

module.exports = router;
