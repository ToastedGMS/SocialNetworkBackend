const express = require('express');
const router = express.Router();

const {
	createLike,
	removeLike,
	readLikesForPost,
	readLikesForComment,
	readLikesForUser,
} = require('../controllers/likeController.cjs');
const { verifyToken } = require('../auth/auth.cjs');

router.post('/new', verifyToken, createLike);
router.delete('/remove', verifyToken, removeLike);
router.get('/post', readLikesForPost);
router.get('/comment', readLikesForComment);
router.get('/user', readLikesForUser);

module.exports = router;
