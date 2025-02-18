const express = require('express');
const router = express.Router();
const { verifyToken } = require('../auth/auth.cjs');
const {
	createNotification,
	readNotifsForUser,
} = require('../controllers/notificationController.cjs');

router.post('/new', verifyToken, createNotification);
router.get('/read', readNotifsForUser);

module.exports = router;
