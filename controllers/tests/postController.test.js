const {
	createPost,
	readPost,
	deletePost,
	updatePost,
} = require('../postController.cjs');
const {
	dbCreatePost,
	dbReadPost,
	dbDeletePost,
	dbUpdatePost,
} = require('../../prisma/scripts/posts.cjs');

jest.mock('../../prisma/scripts/posts.cjs');

describe('Post Controller', () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();
		req = { body: {}, query: {} };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	describe('createPost', () => {
		test('returns a 201 with the new post on success', async () => {
			req.body = { authorID: 1, content: 'This is a new post' };
			dbCreatePost.mockResolvedValue({
				id: 1,
				authorID: 1,
				content: 'This is a new post',
			});

			await createPost(req, res);

			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({
				id: 1,
				authorID: 1,
				content: 'This is a new post',
			});
		});

		test('returns a 400 error if missing parameters', async () => {
			req.body = { authorID: 1 }; // Missing content

			const error = 'Missing parameters for post creation.';
			dbCreatePost.mockRejectedValue(new Error(error));

			await createPost(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: error });
		});

		test('returns a 400 error if content exceeds the maximum length', async () => {
			req.body = { authorID: 1, content: 'a'.repeat(1001) }; // Content exceeds limit

			const error = 'Content exceeds the maximum length of 1000 characters.';
			dbCreatePost.mockRejectedValue(new Error(error));

			await createPost(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: error });
		});
	});

	describe('readPost', () => {
		test('returns a 200 with the requested post by id', async () => {
			req.query = { id: 1 };
			dbReadPost.mockResolvedValue({
				id: 1,
				author: { id: 1, username: 'testuser' },
				content: 'This is a post',
			});

			await readPost(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				id: 1,
				author: { id: 1, username: 'testuser' },
				content: 'This is a post',
			});
		});

		test('returns a 200 with all posts by the given authorID', async () => {
			req.query = { authorID: 1 };
			dbReadPost.mockResolvedValue([
				{
					id: 1,
					author: { id: 1, username: 'testuser' },
					content: 'This is a post',
				},
			]);

			await readPost(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith([
				{
					id: 1,
					author: { id: 1, username: 'testuser' },
					content: 'This is a post',
				},
			]);
		});

		test('returns a 500 error for unexpected errors', async () => {
			const error = 'Unexpected database error';
			dbReadPost.mockRejectedValue(new Error(error));

			await readPost(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});
	});

	describe('deletePost', () => {
		test('returns a 200 with a success message', async () => {
			req.params = { id: 1 };
			dbDeletePost.mockResolvedValue({
				message: 'Post with ID 1 deleted successfully.',
			});

			await deletePost(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				message: 'Post with ID 1 deleted successfully.',
			});
		});

		test('returns a 400 error if missing parameters', async () => {
			req.params = {}; // Missing id

			const error = 'Missing parameter: Post ID is required for deletion.';
			dbDeletePost.mockRejectedValue(new Error(error));

			await deletePost(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: error });
		});

		test('returns a 400 error if post not found', async () => {
			req.params = { id: 1 };

			const error = 'Post with ID 1 not found.';
			dbDeletePost.mockRejectedValue(new Error(error));

			await deletePost(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: error });
		});
	});

	describe('updatePost', () => {
		test('returns a 200 with the updated post', async () => {
			req.params = { id: 1 };

			req.body = { content: 'Updated content' };
			dbUpdatePost.mockResolvedValue({
				id: 1,
				authorID: 1,
				content: 'Updated content',
			});

			await updatePost(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				id: 1,
				authorID: 1,
				content: 'Updated content',
			});
		});

		test('returns a 400 error if missing parameters', async () => {
			req.params = { id: 1 };

			req.body = {}; // Missing content

			const error =
				'Missing parameters: Post ID and content are required for updating.';
			dbUpdatePost.mockRejectedValue(new Error(error));

			await updatePost(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: error });
		});

		test('returns a 400 error if post not found', async () => {
			req.params = { id: 1 };

			req.body = { content: 'Updated content' };

			const error = 'Post with ID 1 not found.';
			dbUpdatePost.mockRejectedValue(new Error(error));

			await updatePost(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: error });
		});
	});
});
