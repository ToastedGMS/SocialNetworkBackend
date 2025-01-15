const express = require('express');
const router = express.Router();

const {
	createLike,
	removeLike,
	readLikesForPost,
	readLikesForComment,
	readLikesForUser,
} = require('../controllers/likeController.cjs');

router.post('/new', createLike);
router.delete('/remove', removeLike);
router.get('/post', readLikesForPost);
router.get('/comment', readLikesForComment);
router.get('/user', readLikesForUser);

module.exports = router;
