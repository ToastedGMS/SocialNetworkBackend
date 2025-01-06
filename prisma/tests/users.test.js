const prisma = require('../prismaClient/prismaClient.cjs');
const bcrypt = require('bcryptjs');
const { dbCreateUser } = require('../scripts/users.cjs');

jest.mock('../prismaClient/prismaClient.cjs', () => ({
	user: {
		create: jest.fn(),
	},
}));

jest.mock('bcryptjs', () => ({
	hash: jest.fn(),
}));

describe('dbCreateUser', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should throw an error if required fields are missing', async () => {
		const invalidInputs = [
			{ userInfo: { email: 'test@example.com', password: 'password123' } },
			{ userInfo: { username: 'testuser', password: 'password123' } },
			{ userInfo: { username: 'testuser', email: 'test@example.com' } },
		];

		for (const input of invalidInputs) {
			await expect(dbCreateUser(input)).rejects.toThrow(
				'All required fields (username, email, password) must be provided.'
			);
		}
	});

	test('should throw an error if username contains special characters', async () => {
		const userInfo = {
			username: 'test_user!',
			email: 'test@example.com',
			password: 'password123',
		};

		await expect(dbCreateUser({ userInfo })).rejects.toThrow(
			'Username may not contain any special characters'
		);
	});

	test('should throw an error if password is less than 8 characters', async () => {
		const userInfo = {
			username: 'testuser',
			email: 'test@example.com',
			password: 'short',
		};

		await expect(dbCreateUser({ userInfo })).rejects.toThrow(
			'Password must be at least 8 characters long.'
		);
	});

	test('should create a new user successfully', async () => {
		const userInfo = {
			username: 'testuser',
			email: 'test@example.com',
			password: 'password123',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		};

		bcrypt.hash.mockResolvedValue('hashedPassword123');
		prisma.user.create.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		});

		const result = await dbCreateUser({ userInfo });

		expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
		expect(prisma.user.create).toHaveBeenCalledWith({
			data: {
				username: 'testuser',
				email: 'test@example.com',
				password: 'hashedPassword123',
				bio: 'This is a test bio',
				profilePic: 'profile.jpg',
			},
		});
		expect(result).toEqual({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			profilePic: 'profile.jpg',
		});
	});

	test('should throw an error for unexpected database errors', async () => {
		const userInfo = {
			username: 'testuser',
			email: 'test@example.com',
			password: 'password123',
		};

		bcrypt.hash.mockResolvedValue('hashedPassword123');
		prisma.user.create.mockRejectedValue(new Error('Unexpected error'));

		await expect(dbCreateUser({ userInfo })).rejects.toThrow(
			'An unexpected error occurred. Please try again later.'
		);
	});
});
