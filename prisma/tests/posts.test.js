const prisma = require('../prismaClient/prismaClient.cjs');

const { dbCreatePost } = require('../scripts/posts.cjs');

jest.mock('../prismaClient/prismaClient.cjs', () => ({
	post: {
		create: jest.fn(),
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
