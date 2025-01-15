const express = require('express');
const router = express.Router();

const {
	createPost,
	readPost,
	deletePost,
	updatePost,
} = require('../controllers/postController.cjs');

router.post('/new', createPost);
router.get('/read', readPost);
router.put('/update', updatePost);
router.delete('/delete', deletePost);

module.exports = router;
