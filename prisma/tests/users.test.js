const prisma = require('../prismaClient/prismaClient.cjs');
const bcrypt = require('bcryptjs');
const { dbCreateUser, dbReadUser } = require('../scripts/users.cjs');

jest.mock('../prismaClient/prismaClient.cjs', () => ({
	user: {
		create: jest.fn(),
		findFirst: jest.fn(),
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
			'An unexpected error occurred. Details: Unexpected error'
		);
	});
});

describe('dbReadUser', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('ensure that provided query is not null or empty', async () => {
		const invalidQueries = [
			{ userInfo: { id: null, email: null, username: null } },
			{ userInfo: { id: '', email: '', username: '' } },
			{ userInfo: {} },
		];

		for (const query of invalidQueries) {
			await expect(dbReadUser(query)).rejects.toThrow(
				'Search query may not be null or empty.'
			);
		}
	});

	test('ensure that function returns the user object when valid queries are passed', async () => {
		prisma.user.findFirst.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		});

		const validQueries = [
			{ userInfo: { id: 1, email: 'test@example.com', username: 'testuser' } },
			{ userInfo: { id: 1, username: 'testuser' } },
			{ userInfo: { email: 'test@example.com' } },
		];

		for (const query of validQueries) {
			const result = await dbReadUser(query);

			expect(result).toEqual({
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				bio: 'This is a test bio',
				profilePic: 'profile.jpg',
			});
		}
	});

	test('should throw an error if user is not found', async () => {
		prisma.user.findFirst.mockResolvedValue(null);

		const queries = [
			{ userInfo: { id: 2 } },
			{ userInfo: { email: 'test2@coolmail.com' } },
			{ userInfo: { username: 'testuser2' } },
		];

		for (const query of queries) {
			await expect(dbReadUser(query)).rejects.toThrow(
				'Provided user was not found. Please try again.'
			);
		}
	});
});
