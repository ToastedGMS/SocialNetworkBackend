const prisma = require('../prismaClient/prismaClient.cjs');

const {
	dbCreatePost,
	dbReadPost,
	dbDeletePost,
	dbUpdatePost,
} = require('../scripts/posts.cjs');

jest.mock('../prismaClient/prismaClient.cjs', () => ({
	post: {
		create: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		delete: jest.fn(),
		update: jest.fn(),
	},
}));

describe('dbCreatePost', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('does not perform post creation if required fields are empty', async () => {
		const invalidInputs = [
			{ authorID: null, content: 'example' },
			{
				authorID: 1,
				content: null,
			},
		];

		for (const input of invalidInputs) {
			await expect(dbCreatePost(input)).rejects.toThrow(
				'Missing parameters for post creation.'
			);
		}

		expect(prisma.post.create).not.toHaveBeenCalled();
	});

	test('should allow content with exactly 1000 characters', async () => {
		const input = {
			authorID: 1,
			content: 'a'.repeat(1000),
		};

		prisma.post.create.mockResolvedValue({
			id: 1,
			content: input.content,
			createdAt: 'Current Time',
			authorID: 1,
		});

		await expect(dbCreatePost(input)).resolves.toEqual({
			id: 1,
			content: input.content,
			createdAt: 'Current Time',
			authorID: 1,
		});
	});

	test('should throw an error if content exceeds 1000 characters', async () => {
		const input = {
			authorID: 1,
			content: 'a'.repeat(1001),
		};

		await expect(dbCreatePost(input)).rejects.toThrow(
			'Content exceeds the maximum length of 1000 characters.'
		);

		expect(prisma.post.create).not.toHaveBeenCalled();
	});

	test('should return a post object if all is well', async () => {
		const input = { authorID: 1, content: 'Example' };

		prisma.post.create.mockResolvedValue({
			id: 1,
			content: 'Example',
			createdAt: 'Current Time',
			authorID: 1,
		});

		await expect(dbCreatePost(input)).resolves.toEqual({
			id: 1,
			content: 'Example',
			createdAt: 'Current Time',
			authorID: 1,
		});
	});

	test('should throw an error for unexpected database errors', async () => {
		prisma.post.create.mockRejectedValue(
			new Error('Unexpected database error')
		);

		await expect(
			dbCreatePost({
				authorID: 1,
				content: 'Example',
			})
		).rejects.toThrow(
			'An unexpected error occurred. Details: Unexpected database error'
		);
	});
});

describe('dbReadPost', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should retrieve a single post by id and its author', async () => {
		const input = { id: 1 };
		const mockPost = {
			id: 1,
			content: 'Example Post',
			authorID: 1,
			author: {
				id: 1,
				username: 'John Doe', // Fix: Changed 'name' to 'username'
				email: 'john.doe@example.com',
				bio: 'Bio text',
				profilePic: 'https://example.com/pic.jpg',
				createdAt: new Date('2024-01-01T12:00:00Z'),
				updatedAt: new Date('2024-01-02T12:00:00Z'),
			},
			_count: {
				comments: 5,
				likes: 10,
			},
		};

		const expectedPost = {
			...mockPost,
			commentCount: mockPost._count.comments,
			likeCount: mockPost._count.likes,
		};

		prisma.post.findUnique.mockResolvedValue(mockPost);

		await expect(dbReadPost(input)).resolves.toEqual(expectedPost);
		expect(prisma.post.findUnique).toHaveBeenCalledWith({
			where: { id: 1 },
			include: {
				author: {
					select: {
						id: true,
						username: true, // Fix: username instead of name
						email: true,
						bio: true,
						profilePic: true,
						createdAt: true,
						updatedAt: true,
					},
				},
				_count: {
					select: {
						comments: true,
						likes: true,
					},
				},
			},
		});
	});

	test('should retrieve multiple posts by authorID and their author information', async () => {
		const input = { authorID: 1 };
		const mockPosts = [
			{
				id: 1,
				content: 'Post 1',
				authorID: 1,
				author: {
					id: 1,
					username: 'John Doe',
					email: 'john.doe@example.com',
					bio: 'Bio text',
					profilePic: 'https://example.com/pic.jpg',
					createdAt: new Date('2024-01-01T12:00:00Z'),
					updatedAt: new Date('2024-01-02T12:00:00Z'),
				},
				_count: {
					comments: 3,
					likes: 7,
				},
			},
			{
				id: 2,
				content: 'Post 2',
				authorID: 1,
				author: {
					id: 1,
					username: 'John Doe',
					email: 'john.doe@example.com',
					bio: 'Bio text',
					profilePic: 'https://example.com/pic.jpg',
					createdAt: new Date('2024-01-01T12:00:00Z'),
					updatedAt: new Date('2024-01-02T12:00:00Z'),
				},
				_count: {
					comments: 2,
					likes: 5,
				},
			},
		];

		const expectedPosts = mockPosts.map((post) => ({
			...post,
			commentCount: post._count.comments,
			likeCount: post._count.likes,
		}));

		prisma.post.findMany.mockResolvedValue(mockPosts);

		await expect(dbReadPost(input)).resolves.toEqual(expectedPosts);
		expect(prisma.post.findMany).toHaveBeenCalledWith({
			where: { authorID: 1 },
			include: {
				author: {
					select: {
						id: true,
						username: true, // Fix: username instead of name
						email: true,
						bio: true,
						profilePic: true,
						createdAt: true,
						updatedAt: true,
					},
				},
				_count: {
					select: {
						comments: true,
						likes: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});
	});
	test('should throw error if post with given id does not exist', async () => {
		const input = { id: 999 };
		prisma.post.findUnique.mockResolvedValue(null);

		await expect(dbReadPost(input)).rejects.toThrow(
			'Post with ID 999 not found.'
		);
	});

	test('should handle unexpected database errors', async () => {
		const input = { id: 1 };
		prisma.post.findUnique.mockRejectedValue(new Error('Database error'));

		await expect(dbReadPost(input)).rejects.toThrow(
			'An unexpected error occurred. Details: Database error'
		);
	});
});

describe('dbDeletePost', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should delete a post successfully by ID', async () => {
		const input = { id: 1 };
		const mockPost = { id: 1, content: 'Example Post', authorID: 1 };

		prisma.post.findUnique.mockResolvedValue(mockPost);
		prisma.post.delete.mockResolvedValue();

		await expect(dbDeletePost(input)).resolves.toEqual({
			message: 'Post with ID 1 deleted successfully.',
		});

		expect(prisma.post.findUnique).toHaveBeenCalledWith({
			where: { id: 1 },
		});
		expect(prisma.post.delete).toHaveBeenCalledWith({
			where: { id: 1 },
		});
	});

	test('should throw an error if the post ID is not provided', async () => {
		await expect(dbDeletePost({})).rejects.toThrow(
			'Missing parameter: Post ID is required for deletion.'
		);

		expect(prisma.post.findUnique).not.toHaveBeenCalled();
		expect(prisma.post.delete).not.toHaveBeenCalled();
	});

	test('should throw an error if the post with the given ID does not exist', async () => {
		prisma.post.findUnique.mockResolvedValue(null);

		await expect(dbDeletePost({ id: 999 })).rejects.toThrow(
			'Post with ID 999 not found.'
		);

		expect(prisma.post.findUnique).toHaveBeenCalledWith({
			where: { id: 999 },
		});
		expect(prisma.post.delete).not.toHaveBeenCalled();
	});

	test('should handle unexpected database errors', async () => {
		prisma.post.findUnique.mockRejectedValue(new Error('Database error'));

		await expect(dbDeletePost({ id: 1 })).rejects.toThrow(
			'An unexpected error occurred. Details: Database error'
		);

		expect(prisma.post.findUnique).toHaveBeenCalledWith({
			where: { id: 1 },
		});
		expect(prisma.post.delete).not.toHaveBeenCalled();
	});
});

describe('dbUpdatePost', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should update a post successfully by ID', async () => {
		const input = { id: 1, content: 'Updated content' };
		const mockPost = { id: 1, content: 'Old content', authorID: 1 };
		const updatedPost = { id: 1, content: 'Updated content', authorID: 1 };

		prisma.post.findUnique.mockResolvedValue(mockPost);
		prisma.post.update.mockResolvedValue(updatedPost);

		await expect(dbUpdatePost(input)).resolves.toEqual(updatedPost);

		expect(prisma.post.findUnique).toHaveBeenCalledWith({
			where: { id: 1 },
		});
		expect(prisma.post.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: { content: 'Updated content', image: null },
		});
	});

	test('should throw an error if the post ID or content is not provided', async () => {
		await expect(dbUpdatePost({})).rejects.toThrow(
			'Missing parameters: Post ID and content are required for updating.'
		);

		await expect(dbUpdatePost({ id: 1 })).rejects.toThrow(
			'Missing parameters: Post ID and content are required for updating.'
		);

		expect(prisma.post.findUnique).not.toHaveBeenCalled();
		expect(prisma.post.update).not.toHaveBeenCalled();
	});

	test('should throw an error if the post with the given ID does not exist', async () => {
		prisma.post.findUnique.mockResolvedValue(null);

		await expect(
			dbUpdatePost({ id: 999, content: 'Updated content' })
		).rejects.toThrow('Post with ID 999 not found.');

		expect(prisma.post.findUnique).toHaveBeenCalledWith({
			where: { id: 999 },
		});
		expect(prisma.post.update).not.toHaveBeenCalled();
	});

	test('should handle unexpected database errors', async () => {
		prisma.post.findUnique.mockRejectedValue(new Error('Database error'));

		await expect(
			dbUpdatePost({ id: 1, content: 'Updated content' })
		).rejects.toThrow('An unexpected error occurred. Details: Database error');

		expect(prisma.post.findUnique).toHaveBeenCalledWith({
			where: { id: 1 },
		});
		expect(prisma.post.update).not.toHaveBeenCalled();
	});
});
