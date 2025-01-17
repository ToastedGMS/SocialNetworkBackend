const prisma = require('../prismaClient/prismaClient.cjs');
const bcrypt = require('bcryptjs');
const {
	dbCreateUser,
	dbReadUser,
	dbUpdateUser,
	dbDeleteUser,
	dbCheckCredentials,
	dbSearchUser,
} = require('../scripts/users.cjs');

jest.mock('../prismaClient/prismaClient.cjs', () => ({
	user: {
		create: jest.fn(),
		findFirst: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		findMany: jest.fn(),
		search: jest.fn(),
	},
}));

jest.mock('bcryptjs', () => ({
	hash: jest.fn(),
	compare: jest.fn(),
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

describe('dbUpdateUser', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should not call database if there are no fields to update', async () => {
		prisma.user.update.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		});

		prisma.user.findFirst.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		});

		const query = {
			userInfo: {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				bio: 'This is a test bio',
				profilePic: 'profile.jpg',
			},
		};

		await expect(dbUpdateUser(query)).resolves.toBe('No values to update.');
		expect(prisma.user.update).not.toHaveBeenCalled();
	});

	test('should not update empty fields (except bio)', async () => {
		prisma.user.update.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: null,
			profilePic: 'profile.jpg',
		});

		prisma.user.findFirst.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		});

		const query = {
			userInfo: {
				id: 1,
				username: null,
				email: null,
				bio: null,
				profilePic: null,
			},
		};

		await expect(dbUpdateUser(query)).resolves.toEqual({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: null,
			profilePic: 'profile.jpg',
		});
	});

	test('updates user when at least one field is different', async () => {
		prisma.user.update.mockResolvedValue({
			id: 1,
			username: 'updatedtestuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		});

		prisma.user.findFirst.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		});

		const query = {
			userInfo: {
				id: 1,
				username: 'updatedtestuser',
				email: 'test@example.com',
				bio: 'This is a test bio',
				profilePic: 'profile.jpg',
			},
		};

		await expect(dbUpdateUser(query)).resolves.toEqual({
			id: 1,
			username: 'updatedtestuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		});
	});

	test('should throw an error if username contains special characters', async () => {
		prisma.user.update.mockResolvedValue({
			id: 1,
			username: 'updatedtestuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		});

		prisma.user.findFirst.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		});

		const query = {
			userInfo: {
				id: 1,
				username: 'updated_test_user!',
				email: 'test@example.com',
				bio: 'This is a test bio',
				profilePic: 'profile.jpg',
			},
		};

		await expect(dbUpdateUser(query)).rejects.toThrow(
			'Username may not contain any special characters'
		);
		expect(prisma.user.update).not.toHaveBeenCalled();
	});

	test('should throw an error for unexpected database errors', async () => {
		prisma.user.update.mockRejectedValue(new Error('Unexpected Error'));

		const query = {
			userInfo: {
				id: 1,
				username: 'updatedtestuser',
				email: 'test@example.com',
				bio: 'This is a test bio',
				profilePic: 'profile.jpg',
			},
		};

		await expect(dbUpdateUser(query)).rejects.toThrow(
			'An unexpected error occurred. Details: Unexpected Error'
		);
	});

	test('should handle missing keys', async () => {
		prisma.user.findFirst.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		});

		prisma.user.update.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'updated@example.com',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		});

		const query = {
			userInfo: {
				id: 1,
				email: 'updated@example.com',
			},
		};

		await expect(dbUpdateUser(query)).resolves.toEqual({
			id: 1,
			username: 'testuser',
			email: 'updated@example.com',
			bio: 'This is a test bio',
			profilePic: 'profile.jpg',
		});
	});
});

describe('dbDeleteUser', () => {
	test('should not execute if password does not match', async () => {
		prisma.user.delete.mockResolvedValue(null);

		prisma.user.findFirst.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			password: 'hashedPassword',
			profilePic: 'profile.jpg',
		});

		bcrypt.compare.mockResolvedValue(false);

		const query = {
			userInfo: {
				id: 1,
				password: 'password',
			},
		};

		await expect(dbDeleteUser(query)).rejects.toThrow(
			'Forbidden action: Password does not match.'
		);
		expect(prisma.user.delete).not.toHaveBeenCalled();
	});

	test('deletes user if everything is right', async () => {
		prisma.user.delete.mockResolvedValue(null);

		prisma.user.findFirst.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			password: 'hashedPassword',
			profilePic: 'profile.jpg',
		});

		bcrypt.compare.mockResolvedValue(true);

		const query = {
			userInfo: {
				id: 1,
				password: 'password',
			},
		};

		await expect(dbDeleteUser(query)).resolves.toEqual(
			'User deleted successfully.'
		);
	});

	test('should throw an error for unexpected database errors', async () => {
		prisma.user.delete.mockRejectedValue(new Error('Unexpected Error'));

		prisma.user.findFirst.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: 'This is a test bio',
			password: 'hashedPassword',
			profilePic: 'profile.jpg',
		});

		bcrypt.compare.mockResolvedValue(true);

		const query = {
			userInfo: {
				id: 1,
				password: 'password',
			},
		};

		await expect(dbDeleteUser(query)).rejects.toThrow(
			'An unexpected error occurred. Details: Unexpected Error'
		);
	});
});
describe('dbCheckCredentials', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should throw an error if required fields are missing', async () => {
		const invalidInputs = [
			{ userInfo: { identification: 'test@example.com' } },
			{ userInfo: { password: 'password123' } },
			{ userInfo: {} },
		];

		for (const input of invalidInputs) {
			await expect(dbCheckCredentials(input)).rejects.toThrow(
				'One or more missing parameters for checking credentials'
			);
		}
	});

	test('should throw an error if user is not found', async () => {
		prisma.user.findFirst.mockResolvedValue(null);

		const userInfo = {
			identification: 'test@example.com',
			password: 'password123',
		};

		await expect(dbCheckCredentials({ userInfo })).rejects.toThrow(
			'Unable to find matching credentials, check username and password and try again.'
		);
	});

	test('should throw an error if password does not match', async () => {
		prisma.user.findFirst.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			password: 'hashedPassword',
		});

		bcrypt.compare.mockResolvedValue(false);

		const userInfo = {
			identification: 'test@example.com',
			password: 'password123',
		};

		await expect(dbCheckCredentials({ userInfo })).rejects.toThrow(
			'Unable to find matching credentials, check username and password and try again.'
		);
	});

	test('should return user details if credentials are correct', async () => {
		prisma.user.findFirst.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			password: 'hashedPassword',
			bio: 'Test bio',
			profilePic: 'profile.jpg',
		});

		bcrypt.compare.mockResolvedValue(true);

		const userInfo = {
			identification: 'testuser',
			password: 'password123',
		};

		const result = await dbCheckCredentials({ userInfo });

		expect(result).toEqual({
			id: 1,
			email: 'test@example.com',
			username: 'testuser',
			bio: 'Test bio',
			profilePic: 'profile.jpg',
		});
	});

	test('should throw an error for unexpected database errors', async () => {
		prisma.user.findFirst.mockRejectedValue(
			new Error('Unexpected database error')
		);

		const userInfo = {
			identification: 'test@example.com',
			password: 'password123',
		};

		await expect(dbCheckCredentials({ userInfo })).rejects.toThrow(
			'An unexpected error occurred. Details: Unexpected database error'
		);
	});
});

describe('dbSearchUser', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	test('should throw an error if no search query is provided', async () => {
		const invalidQueries = [null, '', undefined];

		for (const query of invalidQueries) {
			await expect(dbSearchUser(query)).rejects.toThrow(
				'No search query or empty query provided'
			);
		}
	});

	test('should throw an error for unexpected database error', async () => {
		prisma.user.findMany.mockRejectedValue(
			new Error('Unexpected database error')
		);

		await expect(dbSearchUser('testUser')).rejects.toThrow(
			'An unexpected error occurred. Details: Unexpected database error'
		);
	});

	test('should return a message if no result is found', async () => {
		prisma.user.findMany.mockResolvedValue([]);

		await expect(dbSearchUser('inexistentUser')).rejects.toThrow(
			'No users found'
		);
	});
	test('should return matching users when a valid search query is provided', async () => {
		const mockUsers = [
			{ id: 1, username: 'testUser1', email: 'test1@example.com' },
			{ id: 2, username: 'testUser2', email: 'test2@example.com' },
		];

		prisma.user.findMany.mockResolvedValue(mockUsers);

		const result = await dbSearchUser('testUser');

		expect(result).toEqual(mockUsers);
		expect(prisma.user.findMany).toHaveBeenCalledWith({
			where: {
				username: {
					search: 'testUser',
					mode: 'insensitive',
				},
			},
		});
	});
	test('should return matching users regardless of case sensitivity', async () => {
		const mockUsers = [
			{ id: 1, username: 'TestUser', email: 'test@example.com' },
		];

		prisma.user.findMany.mockResolvedValue(mockUsers);

		const result = await dbSearchUser('testuser');

		expect(result).toEqual(mockUsers);
		expect(prisma.user.findMany).toHaveBeenCalledWith({
			where: {
				username: {
					search: 'testuser',
					mode: 'insensitive',
				},
			},
		});
	});
	test('should return users whose usernames partially match the search query', async () => {
		const mockUsers = [
			{ id: 1, username: 'testUser123', email: 'test1@example.com' },
			{ id: 2, username: '123testUser', email: 'test2@example.com' },
		];

		prisma.user.findMany.mockResolvedValue(mockUsers);

		const result = await dbSearchUser('testUser');

		expect(result).toEqual(mockUsers);
		expect(prisma.user.findMany).toHaveBeenCalledWith({
			where: {
				username: {
					search: 'testUser',
					mode: 'insensitive',
				},
			},
		});
	});
});
