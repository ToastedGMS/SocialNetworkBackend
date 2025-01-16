const prisma = require('../prismaClient/prismaClient.cjs');
const {
	dbCreateComment,
	dbReadComment,
	dbDeleteComment,
	dbUpdateComment,
} = require('../scripts/comments.cjs');

jest.mock('../prismaClient/prismaClient.cjs', () => ({
	comment: {
		create: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		delete: jest.fn(),
		update: jest.fn(),
	},
}));

describe('dbCreateComment', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('does not perform comment creation if required fields are empty', async () => {
		const invalidInputs = [
			{ authorID: null, content: 'example', postID: 1 },
			{ authorID: 1, content: null, postID: 1 },
			{ authorID: 1, content: 'example', postID: null },
		];

		for (const input of invalidInputs) {
			await expect(dbCreateComment(input)).rejects.toThrow(
				'Missing parameters for comment creation.'
			);
		}

		expect(prisma.comment.create).not.toHaveBeenCalled();
	});

	test('should allow content with exactly 1000 characters', async () => {
		const input = {
			authorID: 1,
			content: 'a'.repeat(1000),
			postID: 1,
		};

		prisma.comment.create.mockResolvedValue({
			id: 1,
			content: input.content,
			createdAt: 'Current Time',
			authorID: 1,
			postID: 1,
		});

		await expect(dbCreateComment(input)).resolves.toEqual({
			id: 1,
			content: input.content,
			createdAt: 'Current Time',
			authorID: 1,
			postID: 1,
		});
	});

	test('should throw an error if content exceeds 1000 characters', async () => {
		const input = {
			authorID: 1,
			content: 'a'.repeat(1001),
			postID: 1,
		};

		await expect(dbCreateComment(input)).rejects.toThrow(
			'Content exceeds the maximum length of 1000 characters.'
		);

		expect(prisma.comment.create).not.toHaveBeenCalled();
	});

	test('should return a comment object if all is well', async () => {
		const input = { authorID: 1, content: 'Example', postID: 1 };

		prisma.comment.create.mockResolvedValue({
			id: 1,
			content: 'Example',
			createdAt: 'Current Time',
			authorID: 1,
			postID: 1,
		});

		await expect(dbCreateComment(input)).resolves.toEqual({
			id: 1,
			content: 'Example',
			createdAt: 'Current Time',
			authorID: 1,
			postID: 1,
		});
	});

	test('should throw an error for unexpected database errors', async () => {
		prisma.comment.create.mockRejectedValue(
			new Error('Unexpected database error')
		);

		await expect(
			dbCreateComment({
				authorID: 1,
				content: 'Example',
				postID: 1,
			})
		).rejects.toThrow(
			'An unexpected error occurred. Details: Unexpected database error'
		);
	});
});

describe('dbReadComment', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should retrieve a single comment by id and its author', async () => {
		const input = { id: 1 };
		const mockComment = {
			id: 1,
			content: 'Example Comment',
			authorID: 1,
			author: { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
		};

		prisma.comment.findUnique.mockResolvedValue(mockComment);

		await expect(dbReadComment(input)).resolves.toEqual(mockComment);
		expect(prisma.comment.findUnique).toHaveBeenCalledWith({
			where: { id: 1 },
			include: {
				author: {
					select: {
						id: true,
						username: true,
						email: true,
						bio: true,
						profilePic: true,
						createdAt: true,
						updatedAt: true,
						// Exclude password here by not including it in the select object
					},
				},
			},
		});
	});

	test('should retrieve all comments by authorID and their associated author info', async () => {
		const input = { authorID: 1 };
		const mockComments = [
			{
				id: 1,
				content: 'Comment 1',
				authorID: 1,
				author: { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
			},
			{
				id: 2,
				content: 'Comment 2',
				authorID: 1,
				author: { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
			},
		];

		prisma.comment.findMany.mockResolvedValue(mockComments);

		await expect(dbReadComment(input)).resolves.toEqual(mockComments);
		expect(prisma.comment.findMany).toHaveBeenCalledWith({
			where: { authorID: 1 },
			include: {
				author: {
					select: {
						id: true,
						username: true,
						email: true,
						bio: true,
						profilePic: true,
						createdAt: true,
						updatedAt: true,
						// Exclude password here by not including it in the select object
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});
	});

	test('should retrieve all comments for a specific postID', async () => {
		const input = { postID: 1 };
		const mockComments = [
			{
				id: 1,
				content: 'Comment 1',
				authorID: 1,
				author: { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
			},
			{
				id: 2,
				content: 'Comment 2',
				authorID: 1,
				author: { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
			},
		];

		prisma.comment.findMany.mockResolvedValue(mockComments);

		await expect(dbReadComment(input)).resolves.toEqual(mockComments);
		expect(prisma.comment.findMany).toHaveBeenCalledWith({
			where: { postID: 1 },
			include: {
				author: {
					select: {
						id: true,
						username: true,
						email: true,
						bio: true,
						profilePic: true,
						createdAt: true,
						updatedAt: true,
						// Exclude password here by not including it in the select object
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});
	});

	test('should throw error if comment with given id does not exist', async () => {
		const input = { id: 999 };
		prisma.comment.findUnique.mockResolvedValue(null);

		await expect(dbReadComment(input)).rejects.toThrow(
			'Comment with ID 999 not found.'
		);
	});

	test('should handle unexpected database errors', async () => {
		const input = { id: 1 };
		prisma.comment.findUnique.mockRejectedValue(new Error('Database error'));

		await expect(dbReadComment(input)).rejects.toThrow(
			'An unexpected error occurred. Details: Database error'
		);
	});
});

describe('dbDeleteComment', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should delete a comment successfully by ID', async () => {
		const input = { id: 1 };
		const mockComment = {
			id: 1,
			content: 'Example Comment',
			authorID: 1,
			postID: 1,
		};

		prisma.comment.findUnique.mockResolvedValue(mockComment);
		prisma.comment.delete.mockResolvedValue();

		await expect(dbDeleteComment(input)).resolves.toEqual({
			message: 'Comment with ID 1 deleted successfully.',
		});

		expect(prisma.comment.findUnique).toHaveBeenCalledWith({
			where: { id: 1 },
		});
		expect(prisma.comment.delete).toHaveBeenCalledWith({
			where: { id: 1 },
		});
	});

	test('should throw an error if the comment ID is not provided', async () => {
		await expect(dbDeleteComment({})).rejects.toThrow(
			'Missing parameter: Comment ID is required for deletion.'
		);

		expect(prisma.comment.findUnique).not.toHaveBeenCalled();
		expect(prisma.comment.delete).not.toHaveBeenCalled();
	});

	test('should throw an error if the comment with the given ID does not exist', async () => {
		prisma.comment.findUnique.mockResolvedValue(null);

		await expect(dbDeleteComment({ id: 999 })).rejects.toThrow(
			'Comment with ID 999 not found.'
		);

		expect(prisma.comment.findUnique).toHaveBeenCalledWith({
			where: { id: 999 },
		});
		expect(prisma.comment.delete).not.toHaveBeenCalled();
	});

	test('should handle unexpected database errors', async () => {
		prisma.comment.findUnique.mockRejectedValue(new Error('Database error'));

		await expect(dbDeleteComment({ id: 1 })).rejects.toThrow(
			'An unexpected error occurred. Details: Database error'
		);

		expect(prisma.comment.findUnique).toHaveBeenCalledWith({
			where: { id: 1 },
		});
		expect(prisma.comment.delete).not.toHaveBeenCalled();
	});
});

describe('dbUpdateComment', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should update a comment successfully by ID', async () => {
		const input = { id: 1, content: 'Updated comment' };
		const mockComment = {
			id: 1,
			content: 'Old comment',
			authorID: 1,
			postID: 1,
		};
		const updatedComment = {
			id: 1,
			content: 'Updated comment',
			authorID: 1,
			postID: 1,
		};

		prisma.comment.findUnique.mockResolvedValue(mockComment);
		prisma.comment.update.mockResolvedValue(updatedComment);

		await expect(dbUpdateComment(input)).resolves.toEqual(updatedComment);

		expect(prisma.comment.findUnique).toHaveBeenCalledWith({
			where: { id: 1 },
		});
		expect(prisma.comment.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: { content: 'Updated comment' },
		});
	});

	test('should throw an error if the comment ID or content is not provided', async () => {
		await expect(dbUpdateComment({})).rejects.toThrow(
			'Missing parameters: Comment ID and content are required for updating.'
		);

		await expect(dbUpdateComment({ id: 1 })).rejects.toThrow(
			'Missing parameters: Comment ID and content are required for updating.'
		);

		expect(prisma.comment.findUnique).not.toHaveBeenCalled();
		expect(prisma.comment.update).not.toHaveBeenCalled();
	});

	test('should throw an error if the comment with the given ID does not exist', async () => {
		prisma.comment.findUnique.mockResolvedValue(null);

		await expect(
			dbUpdateComment({ id: 999, content: 'Updated content' })
		).rejects.toThrow('Comment with ID 999 not found.');

		expect(prisma.comment.findUnique).toHaveBeenCalledWith({
			where: { id: 999 },
		});
		expect(prisma.comment.update).not.toHaveBeenCalled();
	});

	test('should handle unexpected database errors', async () => {
		prisma.comment.findUnique.mockRejectedValue(new Error('Database error'));

		await expect(
			dbUpdateComment({ id: 1, content: 'Updated content' })
		).rejects.toThrow('An unexpected error occurred. Details: Database error');

		expect(prisma.comment.findUnique).toHaveBeenCalledWith({
			where: { id: 1 },
		});
		expect(prisma.comment.update).not.toHaveBeenCalled();
	});
});
