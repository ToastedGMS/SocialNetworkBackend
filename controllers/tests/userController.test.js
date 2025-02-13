const {
	createUser,
	readUser,
	updateUser,
	deleteUser,
	searchUser,
} = require('../userController.cjs');
const {
	dbCreateUser,
	dbReadUser,
	dbUpdateUser,
	dbDeleteUser,
	dbSearchUser,
} = require('../../prisma/scripts/users.cjs');

const prisma = require('../../prisma/prismaClient/prismaClient.cjs');
jest.mock('../../prisma/prismaClient/prismaClient.cjs', () => ({
	user: {
		findFirst: jest.fn(),
	},
}));

jest.mock('../../prisma/scripts/users.cjs', () => {
	return {
		dbCreateUser: jest.fn(),
		dbReadUser: jest.fn(),
		dbUpdateUser: jest.fn(),
		dbDeleteUser: jest.fn(),
		dbSearchUser: jest.fn(),
	};
});

describe('createUser controller', () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();
		req = { body: {} };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	test('returns a 400 error when required fields are missing', async () => {
		req.body = {
			username: 'testuser',
			// Missing email
			password: '12345678',
		};

		const error =
			'All required fields (username, email, password) must be provided.';
		dbCreateUser.mockRejectedValue(new Error(error));

		await createUser(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: error });
	});

	test('returns a 400 error when special characters are included', async () => {
		req.body = {
			username: 'test_user!',
			email: 'test@example.com',
			password: '12345678',
		};

		const error = 'Username may not contain any special characters';
		dbCreateUser.mockRejectedValue(new Error(error));

		await createUser(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: error });
	});

	test('returns a bad request (400) error in case of bad inputs', async () => {
		req.body = {
			username: 'testuser',
			email: 'test@example.com',
			password: 'nope',
		};

		const error = 'Password must be at least 8 characters long.';
		dbCreateUser.mockRejectedValue(new Error(error));

		await createUser(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: error });
	});

	test('returns a 500 error for unexpected server errors', async () => {
		req.body = {
			username: 'testuser',
			email: 'test@example.com',
			password: '12345678',
		};

		const error = 'Unexpected database error';
		dbCreateUser.mockRejectedValue(new Error(error));

		await createUser(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
	});

	test('returns a 201 and the user object as json when successful', async () => {
		const user = {
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			profilePic: 'testprofile.png',
			bio: 'test bio idk',
		};

		req.body = {
			username: 'testuser',
			email: 'test@example.com',
			password: '12345678',
		};

		dbCreateUser.mockResolvedValue(user);

		await createUser(req, res);

		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith(user);
	});
});

describe('readUser controller', () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();
		req = { body: {}, params: {} };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	test('returns a 400 error for empty user search queries', async () => {
		const error = 'Search query may not be null or empty.';

		dbReadUser.mockRejectedValue(new Error(error));

		await readUser(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: error });
	});

	test('returns a 404 error if user is not found', async () => {
		const error = 'Provided user was not found. Please try again.';

		dbReadUser.mockRejectedValue(new Error(error));

		await readUser(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ error: error });
	});
	test('returns a 500 error for unexpected database errors', async () => {
		const error = 'Unexpected database error';

		dbReadUser.mockRejectedValue(new Error(error));

		await readUser(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
	});
	test('returns a 200 code with the user object for successful requests', async () => {
		const user = {
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			profilePic: 'testprofile.png',
			bio: 'test bio idk',
		};

		req.body = {
			username: 'testuser',
			email: 'test@example.com',
		};
		req.params = { id: 1 };

		dbReadUser.mockResolvedValue(user);

		await readUser(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(user);
	});
});

describe('updateUser controller', () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();
		req = { body: {} };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	test('returns a 400 error when special characters are included', async () => {
		req.body = {
			username: 'test_user!',
			email: 'test@example.com',
			bio: null,
			profilePic: 'pic.png',
		};
		req.params = { id: 1 };

		const error = 'Username may not contain any special characters';
		dbUpdateUser.mockRejectedValue(new Error(error));

		await updateUser(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: error });
	});

	test('returns a message indicating no updates when values provided are not different', async () => {
		req.body = {
			username: 'testuser',
			email: 'test@example.com',
			bio: null,
			profilePic: 'pic.png',
		};
		req.params = { id: 1 };

		prisma.user.findFirst.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: null,
			profilePic: 'pic.png',
		});

		const message = 'No values to update.';
		dbUpdateUser.mockResolvedValue(message);

		await updateUser(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ message: message });
	});

	test('returns a 500 error for unexpected database errors', async () => {
		const error = 'Unexpected database error';
		dbUpdateUser.mockRejectedValue(new Error(error));

		await updateUser(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
	});

	test('returns a 200 with the user object on successful requests', async () => {
		req.body = {
			username: 'testuser',
			email: 'test@example.com',
			bio: null,
			profilePic: 'pic.png',
		};
		req.params = { id: 1 };

		dbUpdateUser.mockResolvedValue({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: null,
			profilePic: 'pic.png',
		});

		await updateUser(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			bio: null,
			profilePic: 'pic.png',
		});
	});
});

describe('deleteUser controller', () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();
		req = { body: {} };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	test('returns a 403 error if password does not match', async () => {
		req.body = {
			password: 'incorrectPassword',
		};
		req.params = { id: 1 };

		const error = 'Forbidden action: Password does not match.';
		dbDeleteUser.mockRejectedValue(new Error(error));

		await deleteUser(req, res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith({ error: error });
	});

	test('returns a 500 error for unexpected database errors', async () => {
		const error = 'Unexpected database error';
		dbDeleteUser.mockRejectedValue(new Error(error));

		await deleteUser(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
	});

	test('returns a 200 success message when user is deleted successfully', async () => {
		req.body = {
			password: 'correctPassword',
		};
		req.params = { id: 1 };

		const message = 'User deleted successfully.';
		dbDeleteUser.mockResolvedValue(message);

		await deleteUser(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ message: message });
	});
});

describe('searchUser', () => {
	let req, res;

	beforeEach(() => {
		req = { query: {} };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	test('should return 200 and a list of users for a valid query', async () => {
		req.query.searchQuery = 'testUser';
		const mockUsers = [{ id: 1, username: 'testUser' }];
		dbSearchUser.mockResolvedValue(mockUsers);

		await searchUser(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ users: mockUsers });
	});

	test('should return 400 for an empty query', async () => {
		req.query.searchQuery = '';
		await searchUser(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			error: 'Search query cannot be empty',
		});
	});

	test('should return 500 for a database error', async () => {
		req.query.searchQuery = 'testUser';
		dbSearchUser.mockRejectedValue(new Error('Unexpected database error'));

		await searchUser(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			error: 'An error occurred while searching users',
		});
	});
});
