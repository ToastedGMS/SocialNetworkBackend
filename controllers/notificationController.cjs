const {
	dbCreateNotification,
	dbReadNotifications,
} = require('../prisma/scripts/notifications.cjs');

async function createNotification(req, res) {
	try {
		const { receiverID, senderID, contentID, type } = req.body;
		const notif = await dbCreateNotification({
			receiverID: parseInt(receiverID, 10),
			senderID: parseInt(senderID, 10),
			contentID: parseInt(contentID, 10),
			type,
		});
		return res.status(201).json(notif);
	} catch (error) {
		console.error('Error creating notification:', error);
		if (error.message.includes('Missing parameters')) {
			return res.status(400).json({ message: error.message });
		}
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function readNotifsForUser(req, res) {
	try {
		const { id } = req.query;
		const notifs = await dbReadNotifications(parseInt(id, 10));
		return res.status(200).json(notifs);
	} catch (error) {
		console.error('Error reading notifications for user:', error);
		if (error.message.includes('Missing parameter')) {
			return res.status(400).json({
				message:
					'Missing parameter: Receiver ID is required for reading likes.',
			});
		}
		return res.status(500).json({ message: 'Internal server error' });
	}
}

module.exports = { createNotification, readNotifsForUser };
