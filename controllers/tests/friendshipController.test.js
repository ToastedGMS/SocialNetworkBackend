const {
	createFriendship,
	getFriendshipStatus,
	updateFriendshipStatus,
} = require('../friendshipController.cjs');
const {
	dbCreateFriendship,
	dbGetFriendshipStatus,
	dbUpdateFriendshipStatus,
} = require('../../prisma/scripts/friendship.cjs');

jest.mock('../../prisma/scripts/friendship.cjs'); // Mocking the database methods

describe('Friendship Controller', () => {
	describe('createFriendship', () => {
		it('should create a friendship and return status 201', async () => {
			const req = { body: { senderId: 1, receiverId: 2 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

			dbCreateFriendship.mockResolvedValue({
				id: 1,
				senderId: 1,
				receiverId: 2,
				status: 'Pending',
			});

			await createFriendship(req, res);

			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({
				id: 1,
				senderId: 1,
				receiverId: 2,
				status: 'Pending',
			});
		});

		it('should return status 400 when missing parameters', async () => {
			const req = { body: {} };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

			await createFriendship(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Missing parameters for creating a friendship.',
			});
		});

		it('should return status 409 if friendship already exists', async () => {
			const req = { body: { senderId: 1, receiverId: 2 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

			dbCreateFriendship.mockRejectedValue(
				new Error('Friendship request already exists')
			);

			await createFriendship(req, res);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Friendship request already exists',
			});
		});

		it('should return status 500 if an internal error occurs', async () => {
			const req = { body: { senderId: 1, receiverId: 2 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

			dbCreateFriendship.mockRejectedValue(new Error('Some internal error'));

			await createFriendship(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});
	});

	describe('getFriendshipStatus', () => {
		it('should return friendship status and status 200', async () => {
			const req = { query: { senderId: 1, receiverId: 2 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

			dbGetFriendshipStatus.mockResolvedValue({
				id: 1,
				senderId: 1,
				receiverId: 2,
				status: 'Accepted',
			});

			await getFriendshipStatus(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				id: 1,
				senderId: 1,
				receiverId: 2,
				status: 'Accepted',
			});
		});

		it('should return status 400 if missing parameters', async () => {
			const req = { query: {} };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

			await getFriendshipStatus(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Missing parameters for reading friendship status.',
			});
		});

		it('should return status 404 if friendship not found', async () => {
			const req = { query: { senderId: 1, receiverId: 2 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

			dbGetFriendshipStatus.mockRejectedValue(
				new Error('Friendship not found')
			);

			await getFriendshipStatus(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'Friendship not found' });
		});

		it('should return status 500 if an internal error occurs', async () => {
			const req = { query: { senderId: 1, receiverId: 2 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

			dbGetFriendshipStatus.mockRejectedValue(new Error('Some internal error'));

			await getFriendshipStatus(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});
	});

	describe('updateFriendshipStatus', () => {
		it('should update friendship status and return status 200', async () => {
			const req = { body: { senderId: 1, receiverId: 2, status: 'Accepted' } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

			dbUpdateFriendshipStatus.mockResolvedValue({
				id: 1,
				senderId: 1,
				receiverId: 2,
				status: 'Accepted',
			});

			await updateFriendshipStatus(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				id: 1,
				senderId: 1,
				receiverId: 2,
				status: 'Accepted',
			});
		});

		it('should return status 400 if missing parameters', async () => {
			const req = { body: {} };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

			await updateFriendshipStatus(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Missing parameters for updating friendship status.',
			});
		});

		it('should return status 400 if invalid status', async () => {
			const req = {
				body: { senderId: 1, receiverId: 2, status: 'InvalidStatus' },
			};
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

			dbUpdateFriendshipStatus.mockRejectedValue(new Error('Invalid status'));

			await updateFriendshipStatus(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: 'Invalid status' });
		});

		it('should return status 404 if friendship not found', async () => {
			const req = { body: { senderId: 1, receiverId: 2, status: 'Accepted' } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

			dbUpdateFriendshipStatus.mockRejectedValue(
				new Error('Friendship not found')
			);

			await updateFriendshipStatus(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'Friendship not found' });
		});

		it('should return status 500 if an internal error occurs', async () => {
			const req = { body: { senderId: 1, receiverId: 2, status: 'Accepted' } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

			dbUpdateFriendshipStatus.mockRejectedValue(
				new Error('Some internal error')
			);

			await updateFriendshipStatus(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});
	});
});
