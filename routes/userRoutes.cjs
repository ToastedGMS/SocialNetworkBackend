const express = require('express');
const router = express.Router();

const {
	createUser,
	readUser,
	updateUser,
	deleteUser,
} = require('../controllers/userController.cjs');

router.post('/new', createUser);
router.get('/read/:id', readUser);
router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);

module.exports = router;
