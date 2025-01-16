const express = require('express');
const router = express.Router();

const {
	createFriendship,
	getFriendshipStatus,
	updateFriendshipStatus,
} = require('../controllers/friendshipController.cjs');
const { verifyToken } = require('../auth/auth.cjs');

router.post('/new', verifyToken, createFriendship);
router.get('/status', getFriendshipStatus);
router.put('/update', verifyToken, updateFriendshipStatus);

module.exports = router;
