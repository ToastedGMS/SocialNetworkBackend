const express = require('express');
const router = express.Router();

const {
	createPost,
	readPost,
	deletePost,
	updatePost,
} = require('../controllers/postController.cjs');

router.post('/new', createPost);
router.get('/read/:id', readPost);
router.put('/update/:id', updatePost);
router.delete('/delete/:id', deletePost);

module.exports = router;
