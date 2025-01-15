const express = require('express');
const router = express.Router();

const {
	createFriendship,
	getFriendshipStatus,
	updateFriendshipStatus,
} = require('../controllers/friendshipController.cjs');

router.post('/new', createFriendship);
router.get('/status', getFriendshipStatus);
router.put('/update', updateFriendshipStatus);

module.exports = router;
