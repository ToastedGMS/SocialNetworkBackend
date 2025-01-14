const {
	dbCreateFriendship,
	dbGetFriendshipStatus,
	dbUpdateFriendshipStatus,
} = require('../scripts/friendship.cjs');
const prisma = require('../prismaClient/prismaClient.cjs');

jest.mock('../prismaClient/prismaClient.cjs', () => ({
	friendship: {
		findFirst: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
	},
}));

describe('dbCreateFriendship', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it('should create a new friendship with user details', async () => {
		const senderId = 1;
		const receiverId = 2;
		const mockFriendship = {
			id: 1,
			senderId,
			receiverId,
			status: 'Pending',
			sender: { id: 1, username: 'user1', profilePic: 'pic1' },
			receiver: { id: 2, username: 'user2', profilePic: 'pic2' },
		};

		prisma.friendship.findFirst.mockResolvedValue(null); // No existing friendship
		prisma.friendship.create.mockResolvedValue(mockFriendship);

		const result = await dbCreateFriendship(senderId, receiverId);

		expect(result).toEqual(mockFriendship);
		expect(prisma.friendship.create).toHaveBeenCalledWith({
			data: { senderId, receiverId, status: 'Pending' },
			include: {
				sender: { select: { id: true, username: true, profilePic: true } },
				receiver: { select: { id: true, username: true, profilePic: true } },
			},
		});
	});

	it('should throw an error if friendship request already exists', async () => {
		const senderId = 1;
		const receiverId = 2;
		const mockExistingFriendship = {
			id: 1,
			senderId,
			receiverId,
			status: 'Pending',
			sender: { id: 1, username: 'user1', profilePic: 'pic1' },
			receiver: { id: 2, username: 'user2', profilePic: 'pic2' },
		};

		prisma.friendship.findFirst.mockResolvedValue(mockExistingFriendship); // Existing friendship

		await expect(dbCreateFriendship(senderId, receiverId)).rejects.toThrowError(
			'Friendship request already exists.'
		);
	});

	it('should throw an error if missing parameters', async () => {
		await expect(dbCreateFriendship(null, 2)).rejects.toThrowError(
			'Missing parameters for creating a friendship.'
		);

		await expect(dbCreateFriendship(1, null)).rejects.toThrowError(
			'Missing parameters for creating a friendship.'
		);
	});
});

describe('dbGetFriendshipStatus', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it('should retrieve friendship status with user details', async () => {
		const senderId = 1;
		const receiverId = 2;
		const mockFriendship = {
			id: 1,
			senderId,
			receiverId,
			status: 'Pending',
			sender: { id: 1, username: 'user1', profilePic: 'pic1' },
			receiver: { id: 2, username: 'user2', profilePic: 'pic2' },
		};

		prisma.friendship.findFirst.mockResolvedValue(mockFriendship);

		const result = await dbGetFriendshipStatus(senderId, receiverId);

		expect(result).toEqual(mockFriendship);
		expect(prisma.friendship.findFirst).toHaveBeenCalledWith({
			where: {
				OR: [
					{ senderId: senderId, receiverId: receiverId },
					{ senderId: receiverId, receiverId: senderId },
				],
			},
			include: {
				sender: { select: { id: true, username: true, profilePic: true } },
				receiver: { select: { id: true, username: true, profilePic: true } },
			},
		});
	});

	it('should throw an error if friendship not found', async () => {
		const senderId = 1;
		const receiverId = 2;

		prisma.friendship.findFirst.mockResolvedValue(null); // No friendship found

		await expect(
			dbGetFriendshipStatus(senderId, receiverId)
		).rejects.toThrowError('Friendship not found.');
	});

	it('should throw an error if missing parameters', async () => {
		await expect(dbGetFriendshipStatus(null, 2)).rejects.toThrowError(
			'Missing parameters for reading friendship status.'
		);

		await expect(dbGetFriendshipStatus(1, null)).rejects.toThrowError(
			'Missing parameters for reading friendship status.'
		);
	});
});

describe('dbUpdateFriendshipStatus', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it('should update friendship status and include user details', async () => {
		const senderId = 1;
		const receiverId = 2;
		const status = 'Accepted';
		const mockFriendship = {
			id: 1,
			senderId,
			receiverId,
			status: 'Pending',
			sender: { id: 1, username: 'user1', profilePic: 'pic1' },
			receiver: { id: 2, username: 'user2', profilePic: 'pic2' },
		};

		prisma.friendship.findFirst.mockResolvedValue(mockFriendship);
		prisma.friendship.update.mockResolvedValue({ ...mockFriendship, status });

		const result = await dbUpdateFriendshipStatus(senderId, receiverId, status);

		expect(result.status).toBe(status);
		expect(prisma.friendship.update).toHaveBeenCalledWith({
			where: { id: mockFriendship.id },
			data: { status },
			include: {
				sender: { select: { id: true, username: true, profilePic: true } },
				receiver: { select: { id: true, username: true, profilePic: true } },
			},
		});
	});

	it('should throw an error if invalid status', async () => {
		const senderId = 1;
		const receiverId = 2;
		const invalidStatus = 'InvalidStatus';

		await expect(
			dbUpdateFriendshipStatus(senderId, receiverId, invalidStatus)
		).rejects.toThrowError('Invalid status.');
	});

	it('should throw an error if friendship not found', async () => {
		const senderId = 1;
		const receiverId = 2;
		const status = 'Accepted';

		prisma.friendship.findFirst.mockResolvedValue(null); // No friendship found

		await expect(
			dbUpdateFriendshipStatus(senderId, receiverId, status)
		).rejects.toThrowError('Friendship not found.');
	});

	it('should throw an error if missing parameters', async () => {
		await expect(
			dbUpdateFriendshipStatus(null, 2, 'Accepted')
		).rejects.toThrowError(
			'Missing parameters for updating friendship status.'
		);

		await expect(
			dbUpdateFriendshipStatus(1, null, 'Accepted')
		).rejects.toThrowError(
			'Missing parameters for updating friendship status.'
		);

		await expect(dbUpdateFriendshipStatus(1, 2, null)).rejects.toThrowError(
			'Missing parameters for updating friendship status.'
		);
	});
});
