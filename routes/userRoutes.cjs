const express = require('express');
const router = express.Router();

const {
	createUser,
	readUser,
	updateUser,
	deleteUser,
} = require('../controllers/userController.cjs');
const { checkCredentials, verifyToken } = require('../auth/auth.cjs');

router.post('/new', createUser);
router.get('/read/:id', readUser);
router.put('/update/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.get('/login', async (req, res) => {
	const { identification, password } = req.body;

	await checkCredentials(identification, password, res);
});

module.exports = router;
