const prisma = require('../prismaClient/prismaClient.cjs');

async function dbCreateComment({ authorID, content, postID }) {
	if (!authorID || !content || !postID) {
		throw new Error('Missing parameters for comment creation.');
	}

	let id = authorID;

	if (typeof authorID != 'number') {
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
				postID,
			},
		});

		return comment;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbReadComment({ id, authorID, postID }) {
	if (id) {
		try {
			const comment = await prisma.comment.findUnique({
				where: { id },
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
		try {
			const comments = await prisma.comment.findMany({
				where: {
					authorID,
				},
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
			return comments;
		} catch (error) {
			console.error('Unexpected database error:', error);
			throw new Error(
				`An unexpected error occurred. Details: ${error.message}`
			);
		}
	}

	if (postID) {
		try {
			const comments = await prisma.comment.findMany({
				where: {
					postID,
				},
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
			return comments;
		} catch (error) {
			console.error('Unexpected database error:', error);
			throw new Error(
				`An unexpected error occurred. Details: ${error.message}`
			);
		}
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
