const {
	dbCreateUser,
	dbReadUser,
	dbUpdateUser,
	dbDeleteUser,
} = require('../prisma/scripts/users.cjs');

async function createUser(req, res) {
	try {
		const { username, email, password, bio, profilePic } = req.body;

		const newUser = await dbCreateUser({
			userInfo: { username, email, password, bio, profilePic },
		});

		return res.status(201).json(newUser);
	} catch (error) {
		console.error('Error creating user:', error);

		if (
			error.message.includes('required fields') ||
			error.message.includes('special characters') ||
			error.message.includes('at least 8 characters') ||
			error.message.includes('choose a different')
		) {
			return res.status(400).json({ error: error.message });
		}

		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function readUser(req, res) {
	try {
		const { id } = req.params;
		const { email, username } = req.body;

		const user = await dbReadUser({
			userInfo: { id: parseInt(id, 10), username, email },
		});

		return res.status(200).json(user);
	} catch (error) {
		console.error('Error reading user:', error);

		if (error.message.includes('null or empty.')) {
			return res.status(400).json({ error: error.message });
		}
		if (error.message.includes('was not found')) {
			return res.status(404).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function updateUser(req, res) {
	try {
		const { id } = req.params;

		const { username, email, bio, profilePic } = req.body;
		const updatedUser = await dbUpdateUser({
			userInfo: { id: parseInt(id, 10), username, email, bio, profilePic },
		});
		if (updatedUser === 'No values to update.') {
			return res.status(200).json({ message: 'No values to update.' });
		}

		return res.status(200).json(updatedUser);
	} catch (error) {
		console.error('Error updating user:', error);

		if (error.message.includes('special characters')) {
			return res.status(400).json({ error: error.message });
		}

		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function deleteUser(req, res) {
	try {
		const { id } = req.params;

		const { password } = req.body;
		const deletionMessage = await dbDeleteUser({
			userInfo: { id: parseInt(id, 10), password },
		});

		return res.status(200).json({ message: deletionMessage });
	} catch (error) {
		console.error('Error deleting user:', error);

		if (error.message.includes('Forbidden action: Password does not match')) {
			return res.status(403).json({ error: error.message });
		}

		return res.status(500).json({ error: 'Internal server error' });
	}
}

module.exports = { createUser, readUser, updateUser, deleteUser };
