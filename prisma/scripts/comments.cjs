const prisma = require('../prismaClient/prismaClient.cjs');

async function dbCreateComment({ authorID, content }) {
	if (!authorID || !content) {
		throw new Error('Missing parameters for comment creation.');
	}
	let id = authorID;

	if (typeof authorID !== 'number') {
		id = parseInt(authorID, 10);
	}
	if (content.length > 1000) {
		throw new Error('Content exceeds the maximum length of 1000 characters.');
	}

	try {
		const comment = await prisma.comment.create({
			data: {
				authorID: id,
				content,
			},
		});

		return comment;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbReadComment({ id, authorID }) {
	if (id) {
		// Get comment by comment ID (also return author info)
		try {
			const comment = await prisma.comment.findUnique({
				where: {
					id: id,
				},
				include: {
					author: true,
				},
			});
			if (!comment) {
				throw new Error(`Comment with ID ${id} not found.`);
			}
			return comment;
		} catch (error) {
			console.error('Unexpected database error:', error);
			throw new Error(
				`An unexpected error occurred. Details: ${error.message}`
			);
		}
	}

	if (authorID) {
		// Get all comments by a specific author using their ID (also return author info)
		try {
			const comments = await prisma.comment.findMany({
				where: {
					authorID: authorID,
				},
				include: {
					author: true,
				},
				orderBy: {
					createdAt: 'desc', // Order by creation date in descending order
				},
			});
			return comments;
		} catch (error) {
			console.error('Unexpected database error:', error);
			throw new Error(
				`An unexpected error occurred. Details: ${error.message}`
			);
		}
	}

	try {
		// Get all comments
		const comments = await prisma.comment.findMany({
			include: {
				author: true,
			},
			orderBy: {
				createdAt: 'desc', // Order by creation date in descending order
			},
		});
		return comments;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbDeleteComment({ id }) {
	if (!id) {
		throw new Error('Missing parameter: Comment ID is required for deletion.');
	}

	try {
		const comment = await prisma.comment.findUnique({
			where: { id },
		});

		if (!comment) {
			throw new Error(`Comment with ID ${id} not found.`);
		}

		await prisma.comment.delete({
			where: { id },
		});

		return { message: `Comment with ID ${id} deleted successfully.` };
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbUpdateComment({ id, content }) {
	if (!id || !content) {
		throw new Error(
			'Missing parameters: Comment ID and content are required for updating.'
		);
	}

	if (content.length > 1000) {
		throw new Error('Content exceeds the maximum length of 1000 characters.');
	}

	try {
		const comment = await prisma.comment.findUnique({
			where: { id },
		});

		if (!comment) {
			throw new Error(`Comment with ID ${id} not found.`);
		}

		const updatedComment = await prisma.comment.update({
			where: { id },
			data: { content },
		});

		return updatedComment;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

module.exports = {
	dbCreateComment,
	dbReadComment,
	dbDeleteComment,
	dbUpdateComment,
};