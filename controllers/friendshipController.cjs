const {
	dbCreateFriendship,
	dbGetFriendshipStatus,
	dbUpdateFriendshipStatus,
} = require('../prisma/scripts/friendship.cjs');

async function createFriendship(req, res) {
	try {
		const { senderId, receiverId } = req.body;

		if (!senderId || !receiverId) {
			return res
				.status(400)
				.json({ error: 'Missing parameters for creating a friendship.' });
		}

		const newFriendship = await dbCreateFriendship(senderId, receiverId);

		return res.status(201).json(newFriendship);
	} catch (error) {
		console.error('Error creating friendship:', error);

		if (error.message.includes('Friendship request already exists')) {
			return res.status(409).json({ error: error.message });
		}

		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function getFriendshipStatus(req, res) {
	try {
		const { senderId, receiverId } = req.query;

		if (!senderId || !receiverId) {
			return res
				.status(400)
				.json({ error: 'Missing parameters for reading friendship status.' });
		}

		const friendship = await dbGetFriendshipStatus(
			parseInt(senderId, 10),
			parseInt(receiverId, 10)
		);

		return res.status(200).json(friendship);
	} catch (error) {
		console.error('Error retrieving friendship status:', error);

		if (error.message.includes('Friendship not found')) {
			return res.status(404).json({ error: error.message });
		}

		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function updateFriendshipStatus(req, res) {
	try {
		const { senderId, receiverId, status } = req.body;

		if (!senderId || !receiverId || !status) {
			return res
				.status(400)
				.json({ error: 'Missing parameters for updating friendship status.' });
		}

		const updatedFriendship = await dbUpdateFriendshipStatus(
			senderId,
			receiverId,
			status
		);

		return res.status(200).json(updatedFriendship);
	} catch (error) {
		console.error('Error updating friendship status:', error);

		if (error.message.includes('Invalid status')) {
			return res.status(400).json({ error: error.message });
		}

		if (error.message.includes('Friendship not found')) {
			return res.status(404).json({ error: error.message });
		}

		return res.status(500).json({ error: 'Internal server error' });
	}
}

module.exports = {
	createFriendship,
	getFriendshipStatus,
	updateFriendshipStatus,
};
