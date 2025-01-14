const prisma = require('../prismaClient/prismaClient.cjs');
const {
	dbCreateLike,
	dbRemoveLike,
	dbReadLikesForPost,
	dbReadLikesForComment,
	dbReadLikesForUser,
} = require('../scripts/likes.cjs');

jest.mock('../prismaClient/prismaClient.cjs', () => ({
	like: {
		create: jest.fn(),
		findFirst: jest.fn(),
		delete: jest.fn(),
		findMany: jest.fn(),
	},
}));

describe('dbCreateLike', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should not allow like creation if missing parameters', async () => {
		const invalidInputs = [
			{ authorID: 1, postID: null, commentID: null },
			{ authorID: null, postID: 1, commentID: null },
		];

		for (const input of invalidInputs) {
			await expect(dbCreateLike(input)).rejects.toThrow(
				'Missing parameters for like creation.'
			);
		}

		expect(prisma.like.create).not.toHaveBeenCalled();
	});

	test('should not allow duplicate likes for the same post or comment', async () => {
		const input = { authorID: 1, postID: 1, commentID: null };

		prisma.like.findFirst.mockResolvedValue({ id: 1 });

		await expect(dbCreateLike(input)).rejects.toThrow(
			'You have already liked this post or comment.'
		);

		expect(prisma.like.create).not.toHaveBeenCalled();
	});

	test('should create a like for a post successfully', async () => {
		const input = { authorID: 1, postID: 1, commentID: null };
		const mockLike = { id: 1, authorID: 1, postID: 1 };

		prisma.like.findFirst.mockResolvedValue(null);
		prisma.like.create.mockResolvedValue(mockLike);

		await expect(dbCreateLike(input)).resolves.toEqual(mockLike);
		expect(prisma.like.create).toHaveBeenCalledWith({
			data: { authorID: 1, postID: 1, commentID: null },
		});
	});

	test('should create a like for a comment successfully', async () => {
		const input = { authorID: 1, postID: null, commentID: 1 };
		const mockLike = { id: 1, authorID: 1, commentID: 1 };

		prisma.like.findFirst.mockResolvedValue(null);
		prisma.like.create.mockResolvedValue(mockLike);

		await expect(dbCreateLike(input)).resolves.toEqual(mockLike);
		expect(prisma.like.create).toHaveBeenCalledWith({
			data: { authorID: 1, postID: null, commentID: 1 },
		});
	});
});

describe('dbRemoveLike', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should not allow like removal if missing parameters', async () => {
		const invalidInputs = [
			{ authorID: 1, postID: null, commentID: null },
			{ authorID: null, postID: 1, commentID: null },
		];

		for (const input of invalidInputs) {
			await expect(dbRemoveLike(input)).rejects.toThrow(
				'Missing parameters for like removal.'
			);
		}

		expect(prisma.like.delete).not.toHaveBeenCalled();
	});

	test('should remove a like successfully', async () => {
		const input = { authorID: 1, postID: 1, commentID: null };
		const mockLike = { id: 1, authorID: 1, postID: 1 };

		prisma.like.findFirst.mockResolvedValue(mockLike);
		prisma.like.delete.mockResolvedValue({});

		await expect(dbRemoveLike(input)).resolves.toEqual({
			message: 'Like removed successfully.',
		});

		expect(prisma.like.findFirst).toHaveBeenCalledWith({
			where: { authorID: 1, OR: [{ postID: 1 }, { commentID: null }] },
		});
		expect(prisma.like.delete).toHaveBeenCalledWith({ where: { id: 1 } });
	});

	test('should throw an error if like is not found', async () => {
		const input = { authorID: 1, postID: 1, commentID: null };

		prisma.like.findFirst.mockResolvedValue(null);

		await expect(dbRemoveLike(input)).rejects.toThrow('Like not found.');
	});
});

describe('dbReadLikesForPost', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should retrieve likes for a post successfully', async () => {
		const input = 1;
		const mockLikes = [
			{ id: 1, authorID: 1, postID: 1 },
			{ id: 2, authorID: 2, postID: 1 },
		];

		prisma.like.findMany.mockResolvedValue(mockLikes);

		await expect(dbReadLikesForPost(input)).resolves.toEqual(mockLikes);
		expect(prisma.like.findMany).toHaveBeenCalledWith({
			where: { postID: 1 },
			include: { author: true },
		});
	});

	test('should throw an error if post ID is not provided', async () => {
		await expect(dbReadLikesForPost(null)).rejects.toThrow(
			'Missing parameter: Post ID is required for reading likes.'
		);
	});
});

describe('dbReadLikesForComment', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should retrieve likes for a comment successfully', async () => {
		const input = 1;
		const mockLikes = [
			{ id: 1, authorID: 1, commentID: 1 },
			{ id: 2, authorID: 2, commentID: 1 },
		];

		prisma.like.findMany.mockResolvedValue(mockLikes);

		await expect(dbReadLikesForComment(input)).resolves.toEqual(mockLikes);
		expect(prisma.like.findMany).toHaveBeenCalledWith({
			where: { commentID: 1 },
			include: { author: true },
		});
	});

	test('should throw an error if comment ID is not provided', async () => {
		await expect(dbReadLikesForComment(null)).rejects.toThrow(
			'Missing parameter: Comment ID is required for reading likes.'
		);
	});
});

describe('dbReadLikesForUser', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should retrieve all likes for a user successfully', async () => {
		const input = 1;
		const mockLikes = [
			{ id: 1, authorID: 1, postID: 1 },
			{ id: 2, authorID: 1, commentID: 1 },
		];

		prisma.like.findMany.mockResolvedValue(mockLikes);

		await expect(dbReadLikesForUser(input)).resolves.toEqual(mockLikes);
		expect(prisma.like.findMany).toHaveBeenCalledWith({
			where: { authorID: 1 },
			include: { post: true, comment: true },
		});
	});

	test('should throw an error if author ID is not provided', async () => {
		await expect(dbReadLikesForUser(null)).rejects.toThrow(
			'Missing parameter: Author ID is required for reading likes.'
		);
	});
});
