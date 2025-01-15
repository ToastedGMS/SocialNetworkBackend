const express = require('express');
const router = express.Router();

const {
	createUser,
	readUser,
	updateUser,
	deleteUser,
} = require('../controllers/userController.cjs');

router.post('/new', createUser);
router.get('/read', readUser);
router.put('/update', updateUser);
router.delete('/delete', deleteUser);

module.exports = router;
