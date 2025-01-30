const prisma = require('../prismaClient/prismaClient.cjs');

async function dbCreateFriendship(senderId, receiverId) {
	if (!senderId || !receiverId) {
		throw new Error('Missing parameters for creating a friendship.');
	}

	try {
		const existingFriendship = await prisma.friendship.findFirst({
			where: {
				OR: [
					{ senderId: senderId, receiverId: receiverId },
					{ senderId: receiverId, receiverId: senderId },
				],
			},
		});

		if (existingFriendship) {
			throw new Error('Friendship request already exists.');
		}

		const newFriendship = await prisma.friendship.create({
			data: {
				senderId,
				receiverId,
				status: 'Pending',
			},
			include: {
				sender: {
					select: { id: true, username: true, profilePic: true },
				},
				receiver: {
					select: { id: true, username: true, profilePic: true },
				},
			},
		});

		return newFriendship;
	} catch (error) {
		console.error('Error creating friendship:', error);
		throw new Error(`Error creating friendship: ${error.message}`);
	}
}

async function dbGetFriendshipStatus(senderId, receiverId) {
	if (!senderId || !receiverId) {
		throw new Error('Missing parameters for reading friendship status.');
	}

	try {
		const friendship = await prisma.friendship.findFirst({
			where: {
				OR: [
					{ senderId: senderId, receiverId: receiverId },
					{ senderId: receiverId, receiverId: senderId },
				],
			},
			include: {
				sender: {
					select: { id: true, username: true, profilePic: true },
				},
				receiver: {
					select: { id: true, username: true, profilePic: true },
				},
			},
		});

		if (!friendship) {
			throw new Error('Friendship not found.');
		}

		return friendship;
	} catch (error) {
		console.error('Error getting friendship status:', error);
		throw new Error(`Error retrieving friendship status: ${error.message}`);
	}
}

async function dbUpdateFriendshipStatus(senderId, receiverId, status) {
	if (!senderId || !receiverId || !status) {
		throw new Error('Missing parameters for updating friendship status.');
	}

	const validStatuses = ['Accepted', 'Declined', 'Blocked'];
	if (!validStatuses.includes(status)) {
		throw new Error('Invalid status.');
	}

	try {
		const friendship = await prisma.friendship.findFirst({
			where: {
				senderId,
				receiverId,
			},
		});

		if (!friendship) {
			throw new Error('Friendship not found.');
		}

		const updatedFriendship = await prisma.friendship.update({
			where: { id: friendship.id },
			data: { status },
			include: {
				sender: {
					select: { id: true, username: true, profilePic: true },
				},
				receiver: {
					select: { id: true, username: true, profilePic: true },
				},
			},
		});

		return updatedFriendship;
	} catch (error) {
		console.error('Error updating friendship status:', error);
		throw new Error(`Error updating friendship status: ${error.message}`);
	}
}

async function dbGetFriendships(id) {
	if (!id) {
		throw new Error('Missing id for reading friendships.');
	}
	try {
		const acceptedFriendships = await prisma.friendship.findMany({
			where: {
				OR: [
					{ senderId: id, status: 'Accepted' },
					{ receiverId: id, status: 'Accepted' },
				],
			},
			include: {
				sender: {
					select: { id: true, username: true, profilePic: true },
				},
				receiver: {
					select: { id: true, username: true, profilePic: true },
				},
			},
		});
		if (acceptedFriendships.length === 0) {
			throw new Error('No accepted friendships yet :(');
		}

		return acceptedFriendships;
	} catch (error) {
		console.error('Error getting accepted friendships:', error);
		throw new Error(`Error retrieving accepted friendships: ${error.message}`);
	}
}

module.exports = {
	dbCreateFriendship,
	dbGetFriendshipStatus,
	dbUpdateFriendshipStatus,
	dbGetFriendships,
};
