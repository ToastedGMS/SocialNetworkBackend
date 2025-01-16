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
router.get('/post/:postID', readLikesForPost);
router.get('/comment/:commentID', readLikesForComment);
router.get('/user/:authorID', readLikesForUser);

module.exports = router;
