const prisma = require('../prismaClient/prismaClient.cjs');

async function dbCreateNotification({
	senderID,
	receiverID,
	contentID,
	type,
	senderName,
}) {
	if (!senderID || !receiverID || !contentID || !type) {
		throw new Error('Missing parameters for notification creation.');
	}

	try {
		const notification = await prisma.notification.create({
			data: {
				senderID,
				receiverID,
				type,
				contentID,
				senderName,
			},
		});
		return notification;
	} catch (error) {
		console.error('Database error in dbCreateNotification:', error);
		throw new Error('Failed to create notification.');
	}
}

async function dbReadNotifications(receiverID) {
	if (!receiverID) {
		throw new Error(
			'Missing parameter: Receiver ID is required for reading notifications.'
		);
	}

	try {
		const readNotifs = await prisma.notification.findMany({
			where: { receiverID, read: true },
		});
		const unreadNotifs = await prisma.notification.findMany({
			where: { receiverID, read: false },
		});

		return { readNotifs, unreadNotifs };
	} catch (error) {
		console.error('Database error in dbReadNotifications:', error);
		throw new Error('Failed to fetch notifications.');
	}
}

module.exports = { dbCreateNotification, dbReadNotifications };
