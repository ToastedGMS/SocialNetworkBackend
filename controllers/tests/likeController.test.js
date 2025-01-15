const {
	createLike,
	removeLike,
	readLikesForPost,
	readLikesForComment,
	readLikesForUser,
} = require('../likeController.cjs');
const {
	dbCreateLike,
	dbRemoveLike,
	dbReadLikesForPost,
	dbReadLikesForComment,
	dbReadLikesForUser,
} = require('../../prisma/scripts/likes.cjs');

jest.mock('../../prisma/scripts/likes.cjs', () => ({
	dbCreateLike: jest.fn(),
	dbRemoveLike: jest.fn(),
	dbReadLikesForPost: jest.fn(),
	dbReadLikesForComment: jest.fn(),
	dbReadLikesForUser: jest.fn(),
}));

describe('createLike controller', () => {
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
			// Missing authorID, postID, or commentID
		};

		const error =
			'Missing parameters: authorID, postID, or commentID must be provided.';
		dbCreateLike.mockRejectedValue(new Error(error));

		await createLike(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: error });
	});

	test('returns a 400 error when user has already liked', async () => {
		req.body = {
			authorID: 1,
			postID: 2,
		};

		const error = 'You have already liked this post.';
		dbCreateLike.mockRejectedValue(new Error(error));

		await createLike(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: error });
	});

	test('returns a 500 error for unexpected server errors', async () => {
		req.body = {
			authorID: 1,
			postID: 2,
		};

		const error = 'Unexpected database error';
		dbCreateLike.mockRejectedValue(new Error(error));

		await createLike(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
	});

	test('returns a 201 and the like object on success', async () => {
		const like = {
			id: 1,
			authorID: 1,
			postID: 2,
			commentID: null,
		};

		req.body = {
			authorID: 1,
			postID: 2,
		};

		dbCreateLike.mockResolvedValue(like);

		await createLike(req, res);

		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith(like);
	});
});

describe('removeLike controller', () => {
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
			// Missing authorID, postID, or commentID
		};

		const error =
			'Missing parameters: authorID, postID, or commentID must be provided.';
		dbRemoveLike.mockRejectedValue(new Error(error));

		await removeLike(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: error });
	});

	test('returns a 400 error when like is not found', async () => {
		req.body = {
			authorID: 1,
			postID: 2,
		};

		const error = 'Like not found for the provided post or comment.';
		dbRemoveLike.mockRejectedValue(new Error(error));

		await removeLike(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: error });
	});

	test('returns a 500 error for unexpected server errors', async () => {
		req.body = {
			authorID: 1,
			postID: 2,
		};

		const error = 'Unexpected database error';
		dbRemoveLike.mockRejectedValue(new Error(error));

		await removeLike(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
	});

	test('returns a 200 success message when like is removed successfully', async () => {
		const message = 'Like removed successfully.';
		req.body = {
			authorID: 1,
			postID: 2,
		};

		dbRemoveLike.mockResolvedValue(message);

		await removeLike(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(message);
	});
});

describe('readLikesForPost controller', () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();
		req = { params: {} };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	test('returns a 400 error for missing postID', async () => {
		req.params = {};

		const error = 'Missing parameter: Post ID is required for reading likes.';
		dbReadLikesForPost.mockRejectedValue(new Error(error));

		await readLikesForPost(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: error });
	});

	test('returns a 500 error for unexpected server errors', async () => {
		req.params = { postID: 1 };

		const error = 'Unexpected database error';
		dbReadLikesForPost.mockRejectedValue(new Error(error));

		await readLikesForPost(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
	});

	test('returns a 200 and the likes object on success', async () => {
		const likes = [
			{ id: 1, authorID: 1, postID: 1 },
			{ id: 2, authorID: 2, postID: 1 },
		];

		req.params = { postID: 1 };
		dbReadLikesForPost.mockResolvedValue(likes);

		await readLikesForPost(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(likes);
	});
});

describe('readLikesForComment controller', () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();
		req = { params: {} };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	test('returns a 400 error for missing commentID', async () => {
		req.params = {};

		const error =
			'Missing parameter: Comment ID is required for reading likes.';
		dbReadLikesForComment.mockRejectedValue(new Error(error));

		await readLikesForComment(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: error });
	});

	test('returns a 500 error for unexpected server errors', async () => {
		req.params = { commentID: 1 };

		const error = 'Unexpected database error';
		dbReadLikesForComment.mockRejectedValue(new Error(error));

		await readLikesForComment(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
	});

	test('returns a 200 and the likes object on success', async () => {
		const likes = [
			{ id: 1, authorID: 1, commentID: 1 },
			{ id: 2, authorID: 2, commentID: 1 },
		];

		req.params = { commentID: 1 };
		dbReadLikesForComment.mockResolvedValue(likes);

		await readLikesForComment(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(likes);
	});
});

describe('readLikesForUser controller', () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();
		req = { params: {} };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	test('returns a 400 error for missing authorID', async () => {
		req.params = {};

		const error = 'Missing parameter: Author ID is required for reading likes.';
		dbReadLikesForUser.mockRejectedValue(new Error(error));

		await readLikesForUser(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: error });
	});

	test('returns a 500 error for unexpected server errors', async () => {
		req.params = { authorID: 1 };

		const error = 'Unexpected database error';
		dbReadLikesForUser.mockRejectedValue(new Error(error));

		await readLikesForUser(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
	});

	test('returns a 200 and the likes object on success', async () => {
		const likes = [
			{ id: 1, authorID: 1, postID: 1 },
			{ id: 2, authorID: 1, commentID: 2 },
		];

		req.params = { authorID: 1 };
		dbReadLikesForUser.mockResolvedValue(likes);

		await readLikesForUser(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(likes);
	});
});