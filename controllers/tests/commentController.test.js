const {
	createComment,
	readComment,
	updateComment,
	deleteComment,
} = require('../commentController.cjs');
const {
	dbCreateComment,
	dbReadComment,
	dbUpdateComment,
	dbDeleteComment,
} = require('../../prisma/scripts/comments.cjs');

const prisma = require('../../prisma/prismaClient/prismaClient.cjs');
jest.mock('../../prisma/prismaClient/prismaClient.cjs', () => ({
	comment: {
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		delete: jest.fn(),
		update: jest.fn(),
	},
}));

jest.mock('../../prisma/scripts/comments.cjs', () => {
	return {
		dbCreateComment: jest.fn(),
		dbReadComment: jest.fn(),
		dbUpdateComment: jest.fn(),
		dbDeleteComment: jest.fn(),
	};
});

describe('createComment controller', () => {
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
			authorID: 1,
			// Missing content
			postID: 1,
		};

		const error = 'Missing parameters for comment creation.';
		dbCreateComment.mockRejectedValue(new Error(error));

		await createComment(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: error });
	});

	test('returns a 400 error when content exceeds the maximum length', async () => {
		req.body = {
			authorID: 1,
			content: 'a'.repeat(1001), // Content too long
			postID: 1,
		};

		const error = 'Content exceeds the maximum length of 1000 characters.';
		dbCreateComment.mockRejectedValue(new Error(error));

		await createComment(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: error });
	});

	test('returns a 500 error for unexpected server errors', async () => {
		req.body = {
			authorID: 1,
			content: 'Great post!',
			postID: 1,
		};

		const error = 'Unexpected database error';
		dbCreateComment.mockRejectedValue(new Error(error));

		await createComment(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
	});

	test('returns a 201 and the comment object as json when successful', async () => {
		const comment = {
			id: 1,
			authorID: 1,
			content: 'Great post!',
			postID: 1,
			createdAt: '2025-01-15T00:00:00Z',
			updatedAt: '2025-01-15T00:00:00Z',
		};

		req.body = {
			authorID: 1,
			content: 'Great post!',
			postID: 1,
		};

		dbCreateComment.mockResolvedValue(comment);

		await createComment(req, res);

		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith(comment);
	});
});

describe('readComment controller', () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();
		req = { body: {} };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	test('returns a 404 error if comment is not found', async () => {
		const error = 'Comment with ID 999 not found.';

		req.query = { id: 999 };
		dbReadComment.mockRejectedValue(new Error(error));

		await readComment(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ error: error });
	});

	test('returns a 500 error for unexpected database errors', async () => {
		const error = 'Unexpected database error';
		dbReadComment.mockRejectedValue(new Error(error));

		await readComment(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
	});

	test('returns a 200 code with the comment object for successful requests', async () => {
		const comment = {
			id: 1,
			authorID: 1,
			content: 'Great post!',
			postID: 1,
			createdAt: '2025-01-15T00:00:00Z',
			updatedAt: '2025-01-15T00:00:00Z',
		};

		req.query = { id: 1 };

		dbReadComment.mockResolvedValue(comment);

		await readComment(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(comment);
	});
});

describe('updateComment controller', () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();
		req = { body: {}, params: {} };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	test('returns a 400 error when content exceeds the maximum length', async () => {
		req.body = {
			content: 'a'.repeat(1001), // Content too long
		};
		req.params = { id: 1 };

		const error = 'Content exceeds the maximum length of 1000 characters.';
		dbUpdateComment.mockRejectedValue(new Error(error));

		await updateComment(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: error });
	});

	test('returns a 500 error for unexpected database errors', async () => {
		const error = 'Unexpected database error';
		dbUpdateComment.mockRejectedValue(new Error(error));

		await updateComment(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
	});

	test('returns a 200 with the updated comment on successful requests', async () => {
		req.body = {
			content: 'Updated content',
		};
		req.params = { id: 1 };

		const updatedComment = {
			id: 1,
			authorID: 1,
			content: 'Updated content',
			postID: 1,
			createdAt: '2025-01-15T00:00:00Z',
			updatedAt: '2025-01-15T01:00:00Z',
		};

		dbUpdateComment.mockResolvedValue(updatedComment);

		await updateComment(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(updatedComment);
	});
});

describe('deleteComment controller', () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();
		req = { body: {}, params: {} };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	test('returns a 404 error if comment is not found', async () => {
		const error = 'Comment with ID 1 not found.';
		dbDeleteComment.mockRejectedValue(new Error(error));

		await deleteComment(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ error: error });
	});

	test('returns a 500 error for unexpected database errors', async () => {
		const error = 'Unexpected database error';
		dbDeleteComment.mockRejectedValue(new Error(error));

		await deleteComment(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
	});

	test('returns a 200 and a success message for successful deletion', async () => {
		req.params = { id: 1 };

		const successMessage = {
			message: 'Comment with ID 1 deleted successfully.',
		};

		dbDeleteComment.mockResolvedValue(successMessage);

		await deleteComment(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(successMessage);
	});
});
